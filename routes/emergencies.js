const express = require('express');
const Emergency = require('../models/Emergency');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all emergencies
router.get('/', auth, async (req, res) => {
  try {
    const emergencies = await Emergency.find()
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(emergencies);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get emergency by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    res.json(emergency);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create emergency
router.post('/', auth, async (req, res) => {
  try {
    const emergency = new Emergency({
      ...req.body,
      reportedBy: req.user._id,
    });

    await emergency.save();
    await emergency.populate('reportedBy', 'name email');
    res.status(201).json(emergency);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update emergency status (authority only)
router.patch('/:id/status', auth, authorize('authority'), async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['status', 'resolution'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    const emergency = await Emergency.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    updates.forEach((update) => (emergency[update] = req.body[update]));

    if (req.body.status === 'resolved') {
      emergency.resolvedAt = new Date();
    }

    await emergency.save();
    await emergency.populate('reportedBy', 'name email');
    await emergency.populate('assignedTo', 'name email');

    res.json(emergency);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Assign emergency (authority only)
router.patch('/:id/assign', auth, authorize('authority'), async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    emergency.assignedTo = req.user._id;
    await emergency.save();
    await emergency.populate('reportedBy', 'name email');
    await emergency.populate('assignedTo', 'name email');

    res.json(emergency);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 