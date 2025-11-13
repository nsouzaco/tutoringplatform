const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  generateReport,
  getReport,
  getTutorReports,
  getReportStatus,
} = require('../controllers/reportController');

// All routes require authentication
router.use(authenticate);

// POST /api/reports/session/:id - Generate AI report for session
router.post('/session/:id', generateReport);

// GET /api/reports/session/:id/status - Get report generation status
router.get('/session/:id/status', getReportStatus);

// GET /api/reports/session/:id - Get report for specific session
router.get('/session/:id', getReport);

// GET /api/reports - Get all reports for logged-in tutor
router.get('/', getTutorReports);

module.exports = router;

