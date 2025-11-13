const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Register new user
router.post('/register', authController.register);

// Get current user profile
router.get('/me', authenticate, authController.getMe);

// Update user profile
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router;




