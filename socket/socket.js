const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user._id);

    // Join user-specific room
    socket.join(socket.user._id);

    // Join department room if user is an authority
    if (socket.user.role === 'authority' && socket.user.department) {
      socket.join(socket.user.department);
    }

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user._id);
    });
  });

  return io;
};

// Helper functions for emitting events
const emitEmergencyUpdate = (emergency) => {
  if (!io) return;

  // Emit to all authorities in the relevant department
  io.to(getRelevantDepartment(emergency.type)).emit('emergency:update', emergency);
  
  // Emit to the reporter
  io.to(emergency.reporter.toString()).emit('emergency:update', emergency);
};

const emitNewAdvisory = (advisory) => {
  if (!io) return;
  io.emit('advisory:new', advisory);
};

const emitUserNotification = (userId, notification) => {
  if (!io) return;
  io.to(userId.toString()).emit('notification:new', notification);
};

module.exports = {
  initializeSocket,
  emitEmergencyUpdate,
  emitNewAdvisory,
  emitUserNotification,
}; 