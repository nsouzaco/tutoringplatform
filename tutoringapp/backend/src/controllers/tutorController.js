const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all tutors (for students to browse)
const getTutors = async (req, res, next) => {
  try {
    const { subject } = req.query;

    // Build where clause
    const where = {
      role: 'TUTOR',
    };

    // Get tutors with their profiles
    const tutors = await prisma.user.findMany({
      where,
      include: {
        tutorProfile: {
          include: {
            availability: {
              where: { isEnabled: true },
              orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
            },
          },
        },
      },
    });

    // Filter by subject if specified
    let filteredTutors = tutors;
    if (subject) {
      filteredTutors = tutors.filter(tutor => 
        tutor.tutorProfile?.subjects?.some(s => 
          s.toLowerCase().includes(subject.toLowerCase())
        )
      );
    }

    // Format response
    const formattedTutors = filteredTutors.map(tutor => ({
      id: tutor.id,
      name: tutor.name,
      email: tutor.email,
      profilePhoto: tutor.profilePhoto,
      timezone: tutor.timezone,
      bio: tutor.tutorProfile?.bio,
      subjects: tutor.tutorProfile?.subjects || [],
      hourlyRate: tutor.tutorProfile?.hourlyRate,
      availability: tutor.tutorProfile?.availability || [],
    }));

    res.json({ tutors: formattedTutors });
  } catch (error) {
    next(error);
  }
};

// Get specific tutor details
const getTutorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tutor = await prisma.user.findUnique({
      where: { id },
      include: {
        tutorProfile: {
          include: {
            availability: {
              where: { isEnabled: true },
              orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
            },
          },
        },
      },
    });

    if (!tutor || tutor.role !== 'TUTOR') {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    const formattedTutor = {
      id: tutor.id,
      name: tutor.name,
      email: tutor.email,
      profilePhoto: tutor.profilePhoto,
      timezone: tutor.timezone,
      bio: tutor.tutorProfile?.bio,
      subjects: tutor.tutorProfile?.subjects || [],
      hourlyRate: tutor.tutorProfile?.hourlyRate,
      availability: tutor.tutorProfile?.availability || [],
    };

    res.json({ tutor: formattedTutor });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTutors,
  getTutorById,
};

