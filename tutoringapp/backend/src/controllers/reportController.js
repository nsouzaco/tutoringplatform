const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate AI session report
const generateReport = async (req, res, next) => {
  try {
    const { id } = req.params; // session ID
    const userId = req.user.id;
    const role = req.user.role;

    // Only tutors can generate reports
    if (role !== 'TUTOR') {
      return res.status(403).json({ error: 'Only tutors can generate reports' });
    }

    // Get session with all data
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        chatMessages: {
          orderBy: { timestamp: 'asc' },
          include: {
            sender: {
              select: {
                name: true,
                role: true,
              },
            },
          },
        },
        sessionNote: true,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Verify tutor owns this session
    if (session.tutorId !== userId) {
      return res.status(403).json({ error: 'You can only generate reports for your own sessions' });
    }

    // Check if session is completed
    if (session.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Can only generate reports for completed sessions' });
    }

    // Check if report already exists
    const existingReport = await prisma.sessionReport.findUnique({
      where: { sessionId: id },
    });

    if (existingReport) {
      return res.json({ report: existingReport });
    }

    // Prepare data for GPT-4
    const chatHistory = session.chatMessages
      .map(msg => `${msg.sender.name} (${msg.sender.role}): ${msg.message}`)
      .join('\n');

    const notes = session.sessionNote?.content || 'No notes taken';

    const prompt = `You are an educational AI assistant analyzing a tutoring session. Generate a comprehensive report for the tutor.

**Session Details:**
- Student: ${session.student.name}
- Tutor: ${session.tutor.name}
- Duration: ${session.duration} minutes
- Date: ${new Date(session.startTime).toLocaleString()}

**Chat Messages:**
${chatHistory || 'No chat messages'}

**Session Notes:**
${notes}

**Generate a structured report in JSON format with these sections:**
1. **summary**: Brief overview of the session (2-3 sentences)
2. **topicsCovered**: Array of topics/subjects discussed
3. **studentProgress**: Assessment of student understanding and progress
4. **strengths**: What the student did well
5. **areasForImprovement**: Topics that need more work
6. **recommendations**: Specific action items for next session
7. **nextSteps**: Suggested topics or exercises for future sessions

Return ONLY valid JSON, no markdown formatting.`;

    // Call GPT-4
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational analyst. Provide insightful, actionable feedback for tutors.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const reportText = completion.choices[0].message.content;
    let reportData;

    try {
      // Parse GPT-4 response
      reportData = JSON.parse(reportText);
    } catch (parseError) {
      console.error('Failed to parse GPT-4 response:', reportText);
      return res.status(500).json({ error: 'Failed to generate report' });
    }

    // Get tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId },
    });

    if (!tutorProfile) {
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    // Save report to database
    const report = await prisma.sessionReport.create({
      data: {
        sessionId: id,
        tutorId: tutorProfile.id,
        reportData,
      },
    });

    res.status(201).json({ report });
  } catch (error) {
    console.error('Error generating report:', error);
    next(error);
  }
};

// Get session report
const getReport = async (req, res, next) => {
  try {
    const { id } = req.params; // session ID
    const userId = req.user.id;
    const role = req.user.role;

    // Get session to verify access
    const session = await prisma.session.findUnique({
      where: { id },
      select: {
        tutorId: true,
        studentId: true,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Only tutor and student can view report
    if (session.tutorId !== userId && session.studentId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const report = await prisma.sessionReport.findUnique({
      where: { sessionId: id },
      include: {
        session: {
          include: {
            student: {
              select: {
                name: true,
                email: true,
              },
            },
            tutor: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report });
  } catch (error) {
    next(error);
  }
};

// Get all reports for a tutor
const getTutorReports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (role !== 'TUTOR') {
      return res.status(403).json({ error: 'Only tutors can view reports' });
    }

    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId },
    });

    if (!tutorProfile) {
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    const reports = await prisma.sessionReport.findMany({
      where: { tutorId: tutorProfile.id },
      include: {
        session: {
          include: {
            student: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { generatedAt: 'desc' },
    });

    res.json({ reports });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateReport,
  getReport,
  getTutorReports,
};

