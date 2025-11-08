const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getTutors, getTutorById } = require('../controllers/tutorController');

// All routes require authentication
router.use(authenticate);

// GET /api/tutors - Get all tutors (with optional subject filter)
router.get('/', getTutors);

// GET /api/tutors/:id - Get specific tutor
router.get('/:id', getTutorById);

module.exports = router;

