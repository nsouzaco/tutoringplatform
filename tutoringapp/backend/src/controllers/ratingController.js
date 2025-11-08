const prisma = require('../config/prisma');

/**
 * Submit rating for a completed session (students only)
 */
const submitRating = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { punctuality, friendliness, helpfulness, comment } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    // Only students can rate
    if (role !== 'STUDENT') {
      return res.status(403).json({ error: 'Only students can rate sessions' });
    }

    // Validate ratings (1-5)
    if (punctuality < 1 || punctuality > 5 || friendliness < 1 || friendliness > 5 || helpfulness < 1 || helpfulness > 5) {
      return res.status(400).json({ error: 'Ratings must be between 1 and 5' });
    }

    // Get session
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        rating: true,
        tutor: {
          include: {
            tutorProfile: true,
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Verify student owns this session
    if (session.studentId !== userId) {
      return res.status(403).json({ error: 'You can only rate your own sessions' });
    }

    // Check if session is completed
    if (session.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Can only rate completed sessions' });
    }

    // Check if already rated
    if (session.rating) {
      return res.status(400).json({ error: 'Session already rated' });
    }

    // Calculate overall rating
    const overallRating = (punctuality + friendliness + helpfulness) / 3;

    // Create rating
    const rating = await prisma.sessionRating.create({
      data: {
        sessionId,
        punctuality,
        friendliness,
        helpfulness,
        overallRating,
        comment,
      },
    });

    // Trigger metrics recalculation
    await recalculateTutorMetrics(session.tutor.tutorProfile.id);

    res.status(201).json({ rating });
  } catch (error) {
    console.error('Error submitting rating:', error);
    next(error);
  }
};

/**
 * Get rating for a session
 */
const getRating = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Get session to verify access
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { rating: true },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Only tutor and student can view rating
    if (session.tutorId !== userId && session.studentId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!session.rating) {
      return res.status(404).json({ error: 'No rating found for this session' });
    }

    res.json({ rating: session.rating });
  } catch (error) {
    next(error);
  }
};

/**
 * Recalculate tutor metrics after a new rating
 */
const recalculateTutorMetrics = async (tutorProfileId) => {
  try {
    // Get all sessions for this tutor
    const sessions = await prisma.session.findMany({
      where: {
        tutor: {
          tutorProfile: {
            id: tutorProfileId,
          },
        },
      },
      include: {
        rating: true,
      },
    });

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
    const cancelledSessions = sessions.filter(s => s.status === 'CANCELLED').length;

    // Calculate cancellations this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const cancellationsThisWeek = sessions.filter(
      s => s.status === 'CANCELLED' && 
           s.cancelledBy === 'TUTOR' && 
           s.cancelledAt && 
           s.cancelledAt >= weekAgo
    ).length;

    // Calculate average rating
    const ratedSessions = sessions.filter(s => s.rating);
    const averageRating = ratedSessions.length > 0
      ? ratedSessions.reduce((sum, s) => sum + s.rating.overallRating, 0) / ratedSessions.length
      : 0;

    // Calculate first session metrics
    const firstSessions = sessions.filter(s => s.isFirstSession);
    const firstSessionCount = firstSessions.length;
    const firstSessionRated = firstSessions.filter(s => s.rating);
    const firstSessionLowRatingCount = firstSessionRated.filter(s => s.rating.overallRating < 3).length;
    const firstSessionAvgRating = firstSessionRated.length > 0
      ? firstSessionRated.reduce((sum, s) => sum + s.rating.overallRating, 0) / firstSessionRated.length
      : 0;

    // Calculate churn risk score
    let churnRiskScore = 0;
    let isHighChurnRisk = false;

    if (firstSessionCount >= 3) {
      const lowRatingRate = firstSessionLowRatingCount / firstSessionCount;
      
      if (lowRatingRate >= 1.0) {
        // 100% of first sessions got <3 stars
        churnRiskScore = 100;
        isHighChurnRisk = true;
      } else if (lowRatingRate >= 0.67) {
        // 67%+ of first sessions got <3 stars
        churnRiskScore = 80;
        isHighChurnRisk = true;
      } else if (lowRatingRate >= 0.5) {
        // 50%+ of first sessions got <3 stars
        churnRiskScore = 60;
        isHighChurnRisk = true;
      } else if (lowRatingRate > 0) {
        churnRiskScore = lowRatingRate * 100;
      }
    }

    // Check high cancellation
    const isHighCancellation = cancellationsThisWeek > 3;

    // Upsert metrics
    await prisma.tutorMetrics.upsert({
      where: { tutorId: tutorProfileId },
      create: {
        tutorId: tutorProfileId,
        averageRating,
        totalSessions,
        completedSessions,
        cancelledSessions,
        cancellationsThisWeek,
        firstSessionCount,
        firstSessionLowRatingCount,
        firstSessionAvgRating,
        churnRiskScore,
        isHighChurnRisk,
        isHighCancellation,
      },
      update: {
        averageRating,
        totalSessions,
        completedSessions,
        cancelledSessions,
        cancellationsThisWeek,
        firstSessionCount,
        firstSessionLowRatingCount,
        firstSessionAvgRating,
        churnRiskScore,
        isHighChurnRisk,
        isHighCancellation,
        lastCalculatedAt: new Date(),
      },
    });

    console.log(`✅ Metrics recalculated for tutor ${tutorProfileId}`);
  } catch (error) {
    console.error('Error recalculating tutor metrics:', error);
    throw error;
  }
};

module.exports = {
  submitRating,
  getRating,
  recalculateTutorMetrics,
};

