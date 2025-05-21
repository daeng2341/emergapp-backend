const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const emergencyController = require('../controllers/emergencyController');

// Get all emergencies (authorities only)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'authority') {
    return res.status(403).json({ error: 'Not authorized to view all emergencies' });
  }
  emergencyController.getEmergencies(req, res);
});

// Create new emergency report
router.post('/', auth, emergencyController.createEmergency);

// Update emergency status (authorities only)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'authority') {
    return res.status(403).json({ error: 'Not authorized to update emergency status' });
  }
  emergencyController.updateEmergency(req, res);
});

// Get emergency by ID
router.get('/:id', auth, emergencyController.getEmergency);

module.exports = router; 