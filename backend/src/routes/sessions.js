const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getSessions,
  getSessionById,
  createSession,
  updateSessionStatus,
  cancelSession,
  getMeetingToken,
} = require('../controllers/sessionController');

// All routes require authentication
router.use(authenticate);

// GET /api/sessions - Get user's sessions
router.get('/', getSessions);

// GET /api/sessions/:id - Get specific session
router.get('/:id', getSessionById);

// POST /api/sessions - Create new session (book)
router.post('/', createSession);

// PATCH /api/sessions/:id/status - Update session status
router.patch('/:id/status', updateSessionStatus);

// GET /api/sessions/:id/token - Get Daily.co meeting token
router.get('/:id/token', getMeetingToken);

// DELETE /api/sessions/:id - Cancel session
router.delete('/:id', cancelSession);

module.exports = router;

