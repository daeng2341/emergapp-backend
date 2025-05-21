const Emergency = require('../models/Emergency');
const User = require('../models/User');

// Get all emergencies
exports.getEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find()
      .populate('reporter', 'name email')
      .populate('assignedTo', 'name email rank department')
      .sort({ createdAt: -1 });
    res.json(emergencies);
  } catch (error) {
    console.error('Get emergencies error:', error);
    res.status(500).json({ error: 'Error fetching emergencies' });
  }
};

// Create new emergency report
exports.createEmergency = async (req, res) => {
  try {
    const { type, location, description, coordinates } = req.body;
    const emergency = new Emergency({
      type,
      location,
      description,
      coordinates,
      reporter: req.user.id,
    });

    await emergency.save();

    // Notify relevant authorities based on emergency type
    const authorities = await User.find({
      role: 'authority',
      department: getRelevantDepartment(type),
    });

    // TODO: Implement real-time notifications

    res.status(201).json(emergency);
  } catch (error) {
    console.error('Create emergency error:', error);
    res.status(500).json({ error: 'Error creating emergency report' });
  }
};

// Update emergency status
exports.updateEmergency = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, notes } = req.body;

    const emergency = await Emergency.findById(id);
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    if (status) emergency.status = status;
    if (assignedTo) emergency.assignedTo = assignedTo;
    if (notes) {
      emergency.notes.push({
        content: notes,
        author: req.user.id,
      });
    }

    await emergency.save();

    // TODO: Implement real-time notifications for status updates

    res.json(emergency);
  } catch (error) {
    console.error('Update emergency error:', error);
    res.status(500).json({ error: 'Error updating emergency' });
  }
};

// Get emergency by ID
exports.getEmergency = async (req, res) => {
  try {
    const { id } = req.params;
    const emergency = await Emergency.findById(id)
      .populate('reporter', 'name email')
      .populate('assignedTo', 'name email rank department')
      .populate('notes.author', 'name email rank department');

    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    res.json(emergency);
  } catch (error) {
    console.error('Get emergency error:', error);
    res.status(500).json({ error: 'Error fetching emergency' });
  }
};

// Helper function to determine relevant department
const getRelevantDepartment = (type) => {
  switch (type) {
    case 'fire':
      return 'bfp';
    case 'medical':
      return 'hospital';
    case 'crime':
      return 'pnp';
    case 'disaster':
      return 'mdrrmo';
    default:
      return null;
  }
}; 