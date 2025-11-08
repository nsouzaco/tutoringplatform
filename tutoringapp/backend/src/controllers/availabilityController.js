const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get tutor's availability
const getAvailability = async (req, res, next) => {
  try {
    const { userId } = req.user;

    // Get tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId },
    });

    if (!tutorProfile) {
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    // Get all availability slots
    const availability = await prisma.availability.findMany({
      where: { tutorId: tutorProfile.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    res.json({ availability });
  } catch (error) {
    next(error);
  }
};

// Create availability slot
const createAvailability = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { dayOfWeek, startTime, endTime, isRecurring, specificDate } = req.body;

    // Validate input
    if (dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({ error: 'Day of week, start time, and end time are required' });
    }

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ error: 'Day of week must be between 0 (Sunday) and 6 (Saturday)' });
    }

    // Get tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId },
    });

    if (!tutorProfile) {
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    // Create availability
    const availability = await prisma.availability.create({
      data: {
        tutorId: tutorProfile.id,
        dayOfWeek,
        startTime,
        endTime,
        isRecurring: isRecurring !== undefined ? isRecurring : true,
        specificDate: specificDate ? new Date(specificDate) : null,
      },
    });

    res.status(201).json({ availability });
  } catch (error) {
    next(error);
  }
};

// Update availability slot
const updateAvailability = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const { dayOfWeek, startTime, endTime, isRecurring, isEnabled, specificDate } = req.body;

    // Get tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId },
    });

    if (!tutorProfile) {
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    // Check if availability belongs to this tutor
    const existingAvailability = await prisma.availability.findUnique({
      where: { id },
    });

    if (!existingAvailability || existingAvailability.tutorId !== tutorProfile.id) {
      return res.status(404).json({ error: 'Availability slot not found' });
    }

    // Update availability
    const updateData = {};
    if (dayOfWeek !== undefined) updateData.dayOfWeek = dayOfWeek;
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
    if (specificDate !== undefined) updateData.specificDate = specificDate ? new Date(specificDate) : null;

    const availability = await prisma.availability.update({
      where: { id },
      data: updateData,
    });

    res.json({ availability });
  } catch (error) {
    next(error);
  }
};

// Delete availability slot
const deleteAvailability = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    // Get tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId },
    });

    if (!tutorProfile) {
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    // Check if availability belongs to this tutor
    const existingAvailability = await prisma.availability.findUnique({
      where: { id },
    });

    if (!existingAvailability || existingAvailability.tutorId !== tutorProfile.id) {
      return res.status(404).json({ error: 'Availability slot not found' });
    }

    // Delete availability
    await prisma.availability.delete({
      where: { id },
    });

    res.json({ message: 'Availability slot deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
};

