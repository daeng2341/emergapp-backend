const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['fire', 'medical', 'crime', 'disaster', 'other'],
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'active', 'resolved'],
      default: 'pending',
    },
    location: {
      type: String,
      required: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    images: [String],
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    notes: [{
      content: String,
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

const Emergency = mongoose.model('Emergency', emergencySchema);

module.exports = Emergency; 