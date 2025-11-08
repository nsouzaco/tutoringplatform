const prisma = require('../config/prisma');
const OpenAI = require('openai');

// Initialize OpenAI (optional)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Get platform statistics
const getStats = async (req, res, next) => {
  try {
    // Total counts
    const totalStudents = await prisma.user.count({
      where: { role: 'STUDENT' }
    });

    const totalTutors = await prisma.user.count({
      where: { role: 'TUTOR' }
    });

    const totalSessions = await prisma.session.count();

    // Sessions this year
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const sessionsThisYear = await prisma.session.count({
      where: {
        createdAt: {
          gte: startOfYear
        }
      }
    });

    // Sessions this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const sessionsThisMonth = await prisma.session.count({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    // Average rating
    const avgRatingResult = await prisma.sessionRating.aggregate({
      _avg: {
        overallRating: true
      }
    });

    res.json({
      stats: {
        totalStudents,
        totalTutors,
        totalSessions,
        sessionsThisYear,
        sessionsThisMonth,
        averageRating: avgRatingResult._avg.overallRating || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all tutors with metrics
const getTutors = async (req, res, next) => {
  try {
    const tutors = await prisma.user.findMany({
      where: { role: 'TUTOR' },
      include: {
        tutorProfile: true,
        tutorsessions: {
          include: {
            rating: true
          }
        }
      }
    });

    // Calculate metrics for each tutor
    const tutorsWithMetrics = tutors.map(tutor => {
      const sessions = tutor.tutorsessions || [];
      const totalSessions = sessions.length;
      const canceledSessions = sessions.filter(s => s.status === 'CANCELLED').length;
      const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
      const cancellationRate = totalSessions > 0 ? (canceledSessions / totalSessions) * 100 : 0;

      // Get all ratings
      const ratings = sessions
        .map(s => s.rating)
        .filter(r => r !== null);

      const totalRatings = ratings.length;
      const averageRating = totalRatings > 0
        ? ratings.reduce((sum, r) => sum + r.overallRating, 0) / totalRatings
        : 0;

      // Check for high churn (bad reviews on first sessions)
      const firstSessionRatings = sessions
        .filter(s => s.rating && s.isFirstSession)
        .map(s => s.rating);

      const badFirstSessionRatings = firstSessionRatings.filter(r => r.overallRating < 3).length;
      const isHighChurn = firstSessionRatings.length >= 3 && badFirstSessionRatings >= 2;

      return {
        id: tutor.id,
        name: tutor.name,
        email: tutor.email,
        subjects: tutor.tutorProfile?.subjects || [],
        bio: tutor.tutorProfile?.bio || '',
        hourlyRate: tutor.tutorProfile?.hourlyRate || 0,
        metrics: {
          totalSessions,
          completedSessions,
          canceledSessions,
          cancellationRate: Math.round(cancellationRate * 10) / 10,
          totalRatings,
          averageRating: Math.round(averageRating * 10) / 10,
          firstSessionRatings: firstSessionRatings.length,
          badFirstSessionRatings,
          isHighChurn
        }
      };
    });

    res.json({
      tutors: tutorsWithMetrics
    });
  } catch (error) {
    next(error);
  }
};

// Get detailed tutor profile with ratings
const getTutorDetail = async (req, res, next) => {
  try {
    const { tutorId } = req.params;

    const tutor = await prisma.user.findUnique({
      where: { id: tutorId, role: 'TUTOR' },
      include: {
        tutorProfile: true,
        tutorsessions: {
          include: {
            rating: true,
            student: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!tutor) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    // Calculate detailed metrics
    const sessions = tutor.tutorsessions || [];
    const totalSessions = sessions.length;
    const canceledSessions = sessions.filter(s => s.status === 'CANCELLED').length;
    const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
    const cancellationRate = totalSessions > 0 ? (canceledSessions / totalSessions) * 100 : 0;

    // Ratings analysis
    const ratings = sessions
      .map(s => s.rating)
      .filter(r => r !== null);

    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0
      ? ratings.reduce((sum, r) => sum + r.overallRating, 0) / totalRatings
      : 0;

    // Rating distribution (round float ratings to nearest integer)
    const ratingDistribution = {
      5: ratings.filter(r => Math.round(r.overallRating) === 5).length,
      4: ratings.filter(r => Math.round(r.overallRating) === 4).length,
      3: ratings.filter(r => Math.round(r.overallRating) === 3).length,
      2: ratings.filter(r => Math.round(r.overallRating) === 2).length,
      1: ratings.filter(r => Math.round(r.overallRating) === 1).length
    };

    // First session performance
    const sessionsWithRatings = sessions.filter(s => s.rating);
    const firstSessionRatings = sessionsWithRatings.filter(s => s.isFirstSession).map(s => s.rating);
    const badFirstSessionRatings = firstSessionRatings.filter(r => r.overallRating < 3);
    const isHighChurn = firstSessionRatings.length >= 3 && badFirstSessionRatings.length >= 2;

    // All feedback comments
    const feedbackComments = sessionsWithRatings
      .filter(s => s.rating.comment)
      .map(s => ({
        rating: s.rating.overallRating,
        feedback: s.rating.comment,
        isFirstSession: s.isFirstSession,
        createdAt: s.rating.createdAt
      }));

    res.json({
      tutor: {
        id: tutor.id,
        name: tutor.name,
        email: tutor.email,
        phoneNumber: tutor.phoneNumber,
        location: tutor.location,
        timezone: tutor.timezone,
        createdAt: tutor.createdAt,
        subjects: tutor.tutorProfile?.subjects || [],
        bio: tutor.tutorProfile?.bio || '',
        hourlyRate: tutor.tutorProfile?.hourlyRate || 0,
        metrics: {
          totalSessions,
          completedSessions,
          canceledSessions,
          cancellationRate: Math.round(cancellationRate * 10) / 10,
          totalRatings,
          averageRating: Math.round(averageRating * 10) / 10,
          ratingDistribution,
          firstSessionRatings: firstSessionRatings.length,
          badFirstSessionRatings: badFirstSessionRatings.length,
          isHighChurn
        },
        feedbackComments,
        sessions: sessions.map(s => ({
          id: s.id,
          startTime: s.startTime,
          duration: s.duration,
          status: s.status,
          student: s.student,
          rating: s.rating
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Generate AI summary of tutor's teaching style and performance
const generateTutorSummary = async (req, res, next) => {
  try {
    if (!openai) {
      return res.status(503).json({
        error: 'AI summary generation is not available. Please configure OPENAI_API_KEY.'
      });
    }

    const { tutorId } = req.params;

    // Get tutor with all ratings and chat messages
    const tutor = await prisma.user.findUnique({
      where: { id: tutorId, role: 'TUTOR' },
      include: {
        tutorProfile: true,
        tutorsessions: {
          include: {
            rating: true,
            chatMessages: {
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                    role: true
                  }
                }
              },
              orderBy: {
                timestamp: 'asc'
              }
            },
            student: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!tutor) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    const sessionsWithRatings = tutor.tutorsessions.filter(s => s.rating);

    if (sessionsWithRatings.length === 0) {
      return res.json({
        summary: {
          overview: 'No ratings available yet to generate a summary.',
          teachingStyle: 'Not enough data',
          strengths: [],
          areasForImprovement: [],
          recommendation: 'Wait for more student feedback.'
        }
      });
    }

    // Prepare data for AI
    const averageRating = sessionsWithRatings.reduce((sum, s) => sum + s.rating.overallRating, 0) / sessionsWithRatings.length;
    const feedbackComments = sessionsWithRatings
      .filter(s => s.rating.comment)
      .map(s => `Rating: ${s.rating.overallRating.toFixed(1)}/5 (${s.isFirstSession ? 'First Session' : 'Returning Student'}) - "${s.rating.comment}"`)
      .join('\n');

    const firstSessionRatings = sessionsWithRatings.filter(s => s.isFirstSession);
    const badFirstSessions = firstSessionRatings.filter(s => s.rating.overallRating < 3).length;

    // Format chat conversations for analysis (limit to recent sessions for context window)
    const completedSessions = tutor.tutorsessions
      .filter(s => s.status === 'COMPLETED')
      .slice(0, 5); // Analyze last 5 sessions to stay within token limits

    const chatConversations = completedSessions
      .map((session, idx) => {
        if (!session.chatMessages || session.chatMessages.length === 0) {
          return `Session ${idx + 1} (with ${session.student.name}) - No chat messages`;
        }
        
        const chatLog = session.chatMessages
          .map(msg => `${msg.sender.name} (${msg.sender.role}): ${msg.message}`)
          .join('\n  ');
        
        const ratingInfo = session.rating 
          ? ` | Rating: ${session.rating.overallRating.toFixed(1)}/5`
          : ' | No rating';
        
        return `Session ${idx + 1} (with ${session.student.name}${ratingInfo}):\n  ${chatLog}`;
      })
      .join('\n\n');

    const hasChatData = completedSessions.some(s => s.chatMessages && s.chatMessages.length > 0);

    const prompt = `You are analyzing a tutor's performance on an online tutoring platform.

Tutor: ${tutor.name}
Subjects: ${tutor.tutorProfile?.subjects.join(', ') || 'N/A'}
Bio: ${tutor.tutorProfile?.bio || 'No bio provided'}

Performance Metrics:
- Total Sessions: ${tutor.tutorsessions.length}
- Average Rating: ${averageRating.toFixed(1)}/5.0
- Total Ratings: ${sessionsWithRatings.length}
- First Session Ratings: ${firstSessionRatings.length}
- Bad First Session Ratings (< 3 stars): ${badFirstSessions}

Student Feedback:
${feedbackComments || 'No written feedback provided'}

${hasChatData ? `\nSession Chat Conversations (Recent Sessions):
Please analyze the tutor's guidance quality, teaching approach, and interaction style based on these conversations:

${chatConversations}

Based on these conversations, evaluate:
- Quality of explanations provided
- Patience and encouragement shown
- Ability to break down complex concepts
- Responsiveness to student questions
- Overall teaching effectiveness
` : '\nNo chat conversation data available for analysis.'}

Please provide a comprehensive analysis in JSON format with the following structure:
{
  "overview": "2-3 sentence summary of overall performance${hasChatData ? ', including insights from chat conversations' : ''}",
  "teachingStyle": "Description of teaching approach based on feedback${hasChatData ? ' and actual conversation patterns' : ''}",
  "strengths": ["strength 1", "strength 2", ...],
  "areasForImprovement": ["area 1", "area 2", ...],
  ${hasChatData ? '"guidanceQuality": "Analysis of the guidance provided in chat conversations - clarity, depth, encouragement, and teaching effectiveness",' : ''}
  "churnAnalysis": "Analysis of first session performance and student retention",
  "recommendation": "Admin recommendation (continue monitoring, provide support, or flag for review)"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // gpt-4o supports JSON mode
      messages: [
        {
          role: 'system',
          content: 'You are an educational platform administrator analyzing tutor performance. Provide honest, constructive feedback based on ratings, student feedback, and actual chat conversations from tutoring sessions. Pay special attention to the quality of guidance, teaching methods, and communication style demonstrated in the chat logs.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const aiSummary = JSON.parse(completion.choices[0].message.content);

    res.json({
      summary: aiSummary
    });
  } catch (error) {
    console.error('Error generating tutor summary:', error);
    next(error);
  }
};

module.exports = {
  getStats,
  getTutors,
  getTutorDetail,
  generateTutorSummary
};

