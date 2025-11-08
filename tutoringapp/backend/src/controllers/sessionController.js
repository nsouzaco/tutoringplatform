const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

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
    const { userId, role } = req.user;
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
    const { userId, role } = req.user;
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
    const { userId, role } = req.user;
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

    // Generate unique Jitsi room ID
    const jitsiRoomId = `tutoring-${crypto.randomBytes(8).toString('hex')}`;

    // Create session
    const session = await prisma.session.create({
      data: {
        studentId: userId,
        tutorId,
        startTime: start,
        endTime: end,
        duration,
        jitsiRoomId,
        status: 'SCHEDULED',
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

    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
};

// Update session status
const updateSessionStatus = async (req, res, next) => {
  try {
    const { userId } = req.user;
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

    res.json({ session: updatedSession });
  } catch (error) {
    next(error);
  }
};

// Cancel session
const cancelSession = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

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

    // Can't cancel completed sessions
    if (session.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Cannot cancel completed session' });
    }

    // Update session to cancelled
    const updatedSession = await prisma.session.update({
      where: { id },
      data: { status: 'CANCELLED' },
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

    res.json({ session: updatedSession });
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
};

