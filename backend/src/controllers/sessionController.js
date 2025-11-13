const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
const dailyService = require('../services/dailyService');

// Helper function to check for booking conflicts
const checkAvailabilityConflict = async (tutorId, startTime, endTime, excludeSessionId = null) => {
  const where = {
    tutorId,
    status: { in: ['SCHEDULED', 'LIVE'] },
    OR: [
      // New session starts during existing session
      {
        AND: [
          { startTime: { lte: startTime } },
          { endTime: { gt: startTime } },
        ],
      },
      // New session ends during existing session
      {
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gte: endTime } },
        ],
      },
      // New session completely contains existing session
      {
        AND: [
          { startTime: { gte: startTime } },
          { endTime: { lte: endTime } },
        ],
      },
    ],
  };

  if (excludeSessionId) {
    where.id = { not: excludeSessionId };
  }

  const conflictingSession = await prisma.session.findFirst({ where });
  return !!conflictingSession;
};

// Get user's sessions
const getSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { status, upcoming } = req.query;

    // Build where clause based on user role
    const where = {};
    if (role === 'STUDENT') {
      where.studentId = userId;
    } else if (role === 'TUTOR') {
      where.tutorId = userId;
    }

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    // Filter upcoming sessions
    if (upcoming === 'true') {
      where.startTime = { gte: new Date() };
      where.status = { in: ['SCHEDULED', 'LIVE'] };
    }

    const sessions = await prisma.session.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    res.json({ sessions });
  } catch (error) {
    next(error);
  }
};

// Get specific session
const getSessionById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
        chatMessages: {
          orderBy: { timestamp: 'asc' },
        },
        sessionNote: true,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if user has access to this session
    if (session.studentId !== userId && session.tutorId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ session });
  } catch (error) {
    next(error);
  }
};

// Create session (book a session)
const createSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { tutorId, startTime, duration } = req.body;

    // Only students can book sessions
    if (role !== 'STUDENT') {
      return res.status(403).json({ error: 'Only students can book sessions' });
    }

    // Validate input
    if (!tutorId || !startTime || !duration) {
      return res.status(400).json({ error: 'Tutor ID, start time, and duration are required' });
    }

    if (![15, 30, 45, 60].includes(duration)) {
      return res.status(400).json({ error: 'Duration must be 15, 30, 45, or 60 minutes' });
    }

    // Calculate end time
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);

    // Check if tutor exists
    const tutor = await prisma.user.findUnique({
      where: { id: tutorId },
    });

    if (!tutor || tutor.role !== 'TUTOR') {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    // Check for conflicts
    const hasConflict = await checkAvailabilityConflict(tutorId, start, end);
    if (hasConflict) {
      return res.status(409).json({ error: 'This time slot is already booked' });
    }

    // Check if this is the first session between this student and tutor
    const previousSessions = await prisma.session.count({
      where: {
        studentId: userId,
        tutorId,
      },
    });
    const isFirstSession = previousSessions === 0;

    // Generate unique Jitsi room ID (kept for backward compatibility)
    const jitsiRoomId = `tutoring-${crypto.randomBytes(8).toString('hex')}`;

    // Create session first (without Daily.co room)
    const session = await prisma.session.create({
      data: {
        studentId: userId,
        tutorId,
        startTime: start,
        endTime: end,
        duration,
        jitsiRoomId,
        status: 'SCHEDULED',
        isFirstSession,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
    });

    // Create Daily.co room for the session
    try {
      const dailyRoom = await dailyService.createRoom(session.id, duration);
      
      // Update session with Daily.co room info
      const updatedSession = await prisma.session.update({
        where: { id: session.id },
        data: {
          dailyRoomUrl: dailyRoom.url,
          dailyRoomName: dailyRoom.name,
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
            },
          },
          tutor: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
            },
          },
        },
      });

      res.status(201).json({ session: updatedSession });
    } catch (error) {
      // If Daily.co room creation fails, still return session but log error
      console.error('Failed to create Daily.co room:', error.message);
      res.status(201).json({ 
        session,
        warning: 'Session created but video room setup failed. Please contact support.'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Update session status
const updateSessionStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get session
    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if user has access
    if (session.studentId !== userId && session.tutorId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get session with Daily.co room info before updating
    const sessionBeforeUpdate = await prisma.session.findUnique({
      where: { id },
      select: { dailyRoomName: true, status: true },
    });

    // Update session
    const updatedSession = await prisma.session.update({
      where: { id },
      data: { status },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
    });

    // Clean up Daily.co room when session is completed or cancelled
    if ((status === 'COMPLETED' || status === 'CANCELLED') && sessionBeforeUpdate?.dailyRoomName) {
      try {
        await dailyService.deleteRoom(sessionBeforeUpdate.dailyRoomName);
      } catch (error) {
        // Don't fail the request if room deletion fails
        console.warn(`Failed to delete Daily.co room ${sessionBeforeUpdate.dailyRoomName}:`, error.message);
      }
    }

    res.json({ session: updatedSession });
  } catch (error) {
    next(error);
  }
};

// Cancel session
const cancelSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { id } = req.params;
    const { reason } = req.body; // Optional cancellation reason

    // Get session
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
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

    // Check if user has access
    if (session.studentId !== userId && session.tutorId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Can't cancel completed sessions
    if (session.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Cannot cancel completed session' });
    }

    // Determine who cancelled
    const cancelledBy = session.tutorId === userId ? 'TUTOR' : 'STUDENT';

    // Update session to cancelled
    const updatedSession = await prisma.session.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledBy,
        cancelledAt: new Date(),
        cancellationReason: reason || null,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
    });

    // Clean up Daily.co room if it exists
    if (session.dailyRoomName) {
      try {
        await dailyService.deleteRoom(session.dailyRoomName);
      } catch (error) {
        console.warn(`Failed to delete Daily.co room ${session.dailyRoomName}:`, error.message);
      }
    }

    // If tutor cancelled, trigger metrics recalculation
    if (cancelledBy === 'TUTOR' && session.tutor.tutorProfile) {
      const { recalculateTutorMetrics } = require('./ratingController');
      await recalculateTutorMetrics(session.tutor.tutorProfile.id);
    }

    res.json({ session: updatedSession });
  } catch (error) {
    next(error);
  }
};

// Get Daily.co meeting token for a session
const getMeetingToken = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get session
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
        tutor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if user has access
    if (session.studentId !== userId && session.tutorId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if Daily.co room exists
    if (!session.dailyRoomName || !session.dailyRoomUrl) {
      return res.status(400).json({ error: 'Video room not set up for this session' });
    }

    // Determine if user is the tutor (owner/moderator)
    const isOwner = session.tutorId === userId;
    const userName = isOwner ? session.tutor.name : session.student.name;

    // Generate meeting token
    const token = await dailyService.getMeetingToken(session.dailyRoomName, userName, isOwner);

    res.json({
      token,
      roomUrl: session.dailyRoomUrl,
      roomName: session.dailyRoomName,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSessions,
  getSessionById,
  createSession,
  updateSessionStatus,
  cancelSession,
  getMeetingToken,
};

