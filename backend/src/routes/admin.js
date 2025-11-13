const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  next();
};

// Apply authentication and admin check to all routes
router.use(authenticate);
router.use(requireAdmin);

// Get platform statistics
router.get('/stats', adminController.getStats);

// Get all tutors with metrics
router.get('/tutors', adminController.getTutors);

// Get detailed tutor profile
router.get('/tutors/:tutorId', adminController.getTutorDetail);

// Generate AI summary for tutor
router.post('/tutors/:tutorId/ai-summary', adminController.generateTutorSummary);

module.exports = router;

