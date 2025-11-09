const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
} = require('../controllers/availabilityController');

// All routes require authentication
router.use(authenticate);

// GET /api/availability - Get tutor's availability
router.get('/', getAvailability);

// POST /api/availability - Create availability slot
router.post('/', createAvailability);

// PUT /api/availability/:id - Update availability slot
router.put('/:id', updateAvailability);

// DELETE /api/availability/:id - Delete availability slot
router.delete('/:id', deleteAvailability);

module.exports = router;



