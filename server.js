const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const config = require('./config/config');
const { initializeSocket } = require('./socket/socket');

// Create Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose
  .connect(config.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/emergencies', require('./routes/emergency'));
app.use('/api/news', require('./routes/news'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
server.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
}); 