const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { submitRating, getRating } = require('../controllers/ratingController');

// Submit rating for a session (students only)
router.post('/session/:sessionId', authenticate, submitRating);

// Get rating for a session
router.get('/session/:sessionId', authenticate, getRating);

module.exports = router;



