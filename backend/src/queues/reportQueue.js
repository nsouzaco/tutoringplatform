const Queue = require('bull');
const OpenAI = require('openai');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Create queue with Upstash Redis
// Bull uses ioredis internally, so we need to configure TLS properly for Upstash
let redisConfig;

if (process.env.REDIS_URL) {
  const redisUrl = process.env.REDIS_URL;
  
  // Check if URL uses rediss:// (TLS) or redis://
  const isTLS = redisUrl.startsWith('rediss://');
  
  // Parse URL components - handles both redis:// and rediss://
  const urlMatch = redisUrl.match(/rediss?:\/\/(?:default:)?([^@]+)@([^:]+):(\d+)/);
  
  if (urlMatch) {
    const [, password, host, port] = urlMatch;
    redisConfig = {
      redis: {
        host,
        port: parseInt(port) || 6379,
        password,
        ...(isTLS && {
          tls: {
            rejectUnauthorized: false // Required for Upstash TLS
          }
        }),
        maxRetriesPerRequest: null, // Required for Bull to work properly
        enableReadyCheck: false,
        retryStrategy: (times) => {
          if (times > 10) {
            console.error('❌ Redis connection failed after 10 retries');
            return null;
          }
          return Math.min(times * 100, 3000);
        }
      }
    };
    console.log(`🔗 Configuring Bull queue with Redis: ${host}:${port} (TLS: ${isTLS})`);
  } else {
    // Fallback: try to use URL directly (ioredis can parse it)
    console.warn('⚠️  Could not parse REDIS_URL, using direct connection');
    redisConfig = redisUrl;
  }
} else {
  console.warn('⚠️  REDIS_URL not set, using localhost Redis');
  redisConfig = 'redis://localhost:6379';
}

const reportQueue = new Queue('report-generation', redisConfig, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000 // Start with 2 seconds, exponential backoff
    },
    timeout: 300000, // 5 minutes max per job
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: false, // Keep failed jobs for debugging
  },
  limiter: {
    max: 10, // Max 10 jobs per interval
    duration: 60000, // 1 minute
  },
  settings: {
    maxStalledCount: 2, // Retry stalled jobs twice
    stalledInterval: 30000, // Check for stalled jobs every 30s
    lockDuration: 300000, // 5 minutes lock duration
  }
});

// Add connection event handlers to diagnose issues
reportQueue.on('ready', () => {
  console.log('✅ Report queue connected to Redis and ready');
});

reportQueue.on('error', (error) => {
  console.error('❌ Report queue error:', error.message);
});

// Log when worker starts processing
reportQueue.on('active', (job) => {
  console.log(`🔄 Report job ${job.id} started processing for session ${job.data.sessionId}`);
});

// Test Redis connection
if (reportQueue.client) {
  reportQueue.client.on('ready', () => {
    console.log('✅ Bull queue Redis client connected');
  });

  reportQueue.client.on('error', (error) => {
    console.error('❌ Bull queue Redis client error:', error.message);
  });
}

// Process reports with concurrency of 5
reportQueue.process(5, async (job) => {
  const { sessionId } = job.data;
  
  console.log(`[Queue] Processing report for session ${sessionId}`);
  job.progress(10); // Update progress

  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  // Fetch session data
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      student: true,
      tutor: { include: { tutorProfile: true } },
      chatMessages: { orderBy: { timestamp: 'asc' } },
      sessionNote: true,
      rating: true,
    }
  });

  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  if (session.status !== 'COMPLETED') {
    throw new Error(`Session ${sessionId} is not completed yet`);
  }

  job.progress(30); // Update progress

  // Check if report already exists
  const existingReport = await prisma.sessionReport.findUnique({
    where: { sessionId }
  });

  if (existingReport) {
    console.log(`[Queue] Report already exists for session ${sessionId}`);
    return existingReport;
  }

  // Prepare chat history
  const chatHistory = session.chatMessages
    .map(msg => `${msg.senderName}: ${msg.message}`)
    .join('\n');

  // Prepare notes (sessionNote is a single object, not an array)
  const notes = session.sessionNote ? session.sessionNote.content : '';

  job.progress(50); // Update progress

  // Generate report with GPT-4o (faster and cheaper than GPT-4)
  const prompt = `You are an AI assistant analyzing a tutoring session. Generate a comprehensive report.

Session Details:
- Student: ${session.student.name}
- Tutor: ${session.tutor.name}
- Duration: ${Math.round((new Date(session.endTime) - new Date(session.startTime)) / 60000)} minutes
- Rating: ${session.rating ? `${session.rating.overallRating}/5 (Punctuality: ${session.rating.punctuality}/5, Friendliness: ${session.rating.friendliness}/5, Helpfulness: ${session.rating.helpfulness}/5)` : 'Not rated yet'}
${session.rating?.comment ? `- Student Feedback: ${session.rating.comment}` : ''}

Chat Conversation:
${chatHistory || 'No chat messages recorded'}

Tutor Notes:
${notes || 'No notes recorded'}

Generate a JSON report with this structure:
{
  "summary": "2-3 sentence overview of the session",
  "topicsDiscussed": ["topic1", "topic2", "topic3"],
  "studentProgress": "Assessment of student understanding and progress",
  "strengths": ["strength1", "strength2"],
  "areasForImprovement": ["area1", "area2"],
  "nextSteps": ["recommended next step 1", "recommended next step 2"],
  "tutorNotes": "Key observations from the tutor perspective"
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o', // Fast and cost-effective
    messages: [
      { role: 'system', content: 'You are an educational AI assistant that analyzes tutoring sessions and provides constructive feedback.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1500,
    response_format: { type: "json_object" }
  });

  job.progress(80); // Update progress

  let reportData;
  try {
    reportData = JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('[Queue] Failed to parse OpenAI response:', completion.choices[0].message.content);
    throw new Error('Failed to parse AI report response');
  }

  // Save report to database (all data goes into the reportData JSON field)
  const report = await prisma.sessionReport.create({
    data: {
      sessionId,
      tutorId: session.tutor.tutorProfile.id,
      reportData: {
        summary: reportData.summary || 'No summary available',
        topicsDiscussed: reportData.topicsDiscussed || [],
        studentProgress: reportData.studentProgress || 'No progress assessment available',
        strengths: reportData.strengths || [],
        areasForImprovement: reportData.areasForImprovement || [],
        nextSteps: reportData.nextSteps || [],
        tutorNotes: reportData.tutorNotes || notes || 'No notes available',
      },
      generatedAt: new Date(),
    }
  });

  job.progress(100); // Complete

  console.log(`[Queue] ✅ Report generated for session ${sessionId}`);
  return report;
});

console.log('📋 Report queue worker initialized and listening for jobs');

// Event handlers for monitoring
reportQueue.on('completed', (job, result) => {
  console.log(`✅ Report ${job.id} completed for session ${job.data.sessionId}`);
});

reportQueue.on('failed', (job, err) => {
  console.error(`❌ Report ${job.id} failed for session ${job.data.sessionId}:`, err.message);
});

reportQueue.on('stalled', (job) => {
  console.warn(`⚠️  Report ${job.id} stalled for session ${job.data.sessionId}`);
});

reportQueue.on('progress', (job, progress) => {
  console.log(`📊 Report ${job.id} progress: ${progress}%`);
});

reportQueue.on('error', (error) => {
  console.error('Queue error:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Closing report queue...');
  await reportQueue.close();
});

module.exports = reportQueue;

