const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const reportQueue = require('../queues/reportQueue');

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
        rating: true, // Include student rating
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
      return res.json({ 
        success: true,
        status: 'completed',
        report: existingReport 
      });
    }

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ 
        error: 'AI report generation is not available. Please configure OPENAI_API_KEY.' 
      });
    }

    // Check if job already exists in queue
    const existingJob = await reportQueue.getJob(`report-${id}`);
    if (existingJob) {
      const state = await existingJob.getState();
      const progress = existingJob.progress();
      
      return res.json({
        success: true,
        status: state,
        jobId: existingJob.id,
        progress,
        message: state === 'active' ? 'Report is being generated...' : 'Report generation queued'
      });
    }

    // Add to queue (returns immediately!)
    const job = await reportQueue.add(
      { sessionId: id },
      { 
        jobId: `report-${id}`, // Prevent duplicates
        priority: 1 // Higher priority for user-initiated requests
      }
    );

    res.json({ 
      success: true,
      status: 'queued',
      jobId: job.id,
      message: 'Report generation started. Check back in 30-60 seconds.',
      statusUrl: `/api/reports/session/${id}/status`
    });
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

// Get report generation status
const getReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params; // session ID
    const userId = req.user.id;
    
    // Verify access to session
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

    // Only tutor and student can check status
    if (session.tutorId !== userId && session.studentId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check database first
    const report = await prisma.sessionReport.findUnique({
      where: { sessionId: id }
    });

    if (report) {
      return res.json({ 
        success: true,
        status: 'completed',
        report 
      });
    }

    // Check queue status
    const job = await reportQueue.getJob(`report-${id}`);
    
    if (!job) {
      return res.json({ 
        success: true,
        status: 'not_started',
        message: 'No report generation in progress'
      });
    }

    const state = await job.getState();
    const progress = job.progress();
    const failedReason = state === 'failed' ? job.failedReason : null;

    res.json({
      success: true,
      status: state, // 'waiting', 'active', 'completed', 'failed', 'delayed'
      progress,
      jobId: job.id,
      message: state === 'active' ? 'Report is being generated...' : 
               state === 'waiting' ? 'Report generation is queued...' :
               state === 'failed' ? 'Report generation failed' : undefined,
      error: failedReason
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateReport,
  getReport,
  getTutorReports,
  getReportStatus,
};

