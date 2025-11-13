const prisma = require('../config/prisma');

/**
 * Register a new user (called after Firebase auth creation)
 */
const register = async (req, res, next) => {
  try {
    const { firebaseUid, email, name, role, timezone, phoneNumber, location, subjects, bio } = req.body;

    // Debug logging
    console.log('📝 Registration request received:', { 
      email, 
      name, 
      role, 
      phoneNumber, 
      location,
      hasSubjects: !!subjects,
      hasBio: !!bio 
    });

    // Validate required fields
    if (!firebaseUid || !email || !name || !role) {
      return res.status(400).json({
        error: 'Missing required fields: firebaseUid, email, name, role',
      });
    }

    // Validate role
    if (!['STUDENT', 'TUTOR', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role. Must be STUDENT, TUTOR, or ADMIN',
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already registered',
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        firebaseUid,
        email,
        name,
        role,
        phoneNumber: phoneNumber || null,
        location: location || null,
        timezone: timezone || 'UTC',
        // If tutor, create tutor profile
        ...(role === 'TUTOR' && {
          tutorProfile: {
            create: {
              bio: bio || '',
              subjects: subjects || [],
            },
          },
        }),
      },
      include: {
        tutorProfile: true,
      },
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phoneNumber: user.phoneNumber,
        location: user.location,
        timezone: user.timezone,
        tutorProfile: user.tutorProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        tutorProfile: true,
      },
    });

    res.json({
      user: {
        id: user.id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        role: user.role,
        phoneNumber: user.phoneNumber,
        location: user.location,
        profilePhoto: user.profilePhoto,
        timezone: user.timezone,
        tutorProfile: user.tutorProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phoneNumber, location, profilePhoto, timezone, bio, subjects } = req.body;
    const userId = req.user.id;

    // Update user basic info
    const updateData = {};
    if (name) updateData.name = name;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (location !== undefined) updateData.location = location;
    if (profilePhoto) updateData.profilePhoto = profilePhoto;
    if (timezone) updateData.timezone = timezone;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        tutorProfile: true,
      },
    });

    // If tutor, update tutor profile
    if (req.user.role === 'TUTOR' && user.tutorProfile) {
      const tutorUpdateData = {};
      if (bio !== undefined) tutorUpdateData.bio = bio;
      if (subjects !== undefined) tutorUpdateData.subjects = subjects;

      if (Object.keys(tutorUpdateData).length > 0) {
        await prisma.tutorProfile.update({
          where: { userId },
          data: tutorUpdateData,
        });
      }
    }

    // Fetch updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tutorProfile: true,
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  getMe,
  updateProfile,
};

