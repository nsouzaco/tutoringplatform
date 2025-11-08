require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const { initializeFirebase } = require('./config/firebase');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Initialize Firebase
initializeFirebase();

// Create Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/availability', require('./routes/availability'));
app.use('/api/tutors', require('./routes/tutors'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/ratings', require('./routes/ratings'));

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join a session room
  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });

  // Leave a session room
  socket.on('leave-session', (sessionId) => {
    socket.leave(sessionId);
    console.log(`Socket ${socket.id} left session ${sessionId}`);
  });

  // Handle chat messages
  socket.on('chat-message', async (data) => {
    const { sessionId, senderId, message } = data;
    
    try {
      // Save message to database
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const chatMessage = await prisma.chatMessage.create({
        data: {
          sessionId,
          senderId,
          message,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });

      // Broadcast message to all users in the session room
      io.to(sessionId).emit('chat-message', chatMessage);
      
      await prisma.$disconnect();
    } catch (error) {
      console.error('Error saving chat message:', error);
      socket.emit('chat-error', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicator
  socket.on('typing', ({ sessionId, userName }) => {
    socket.to(sessionId).emit('user-typing', { userName });
  });

  socket.on('stop-typing', ({ sessionId }) => {
    socket.to(sessionId).emit('user-stopped-typing');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = { app, server, io };

