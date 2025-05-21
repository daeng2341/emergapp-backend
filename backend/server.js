const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'authority'], required: true },
  name: { type: String, required: true },
  phone: String,
  location: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Emergency Schema
const emergencySchema = new mongoose.Schema({
  type: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  responders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

const Emergency = mongoose.model('Emergency', emergencySchema);

// News Schema
const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  image: String,
  createdAt: { type: Date, default: Date.now }
});

const News = mongoose.model('News', newsSchema);

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Email Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Authentication Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id });
    
    if (!user) {
      throw new Error();
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

// Routes

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, role, name, phone, location } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      role,
      name,
      phone,
      location
    });
    
    await user.save();
    
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).send({ error: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Report Emergency
app.post('/api/emergencies', auth, async (req, res) => {
  try {
    const emergency = new Emergency({
      ...req.body,
      reportedBy: req.user._id
    });
    
    await emergency.save();
    
    // Notify all connected clients
    io.emit('newEmergency', emergency);
    
    res.status(201).send(emergency);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get Emergencies
app.get('/api/emergencies', auth, async (req, res) => {
  try {
    const emergencies = await Emergency.find()
      .populate('reportedBy', 'name email')
      .populate('responders', 'name email');
    res.send(emergencies);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Create News
app.post('/api/news', auth, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'authority') {
      return res.status(403).send({ error: 'Only authorities can post news' });
    }
    
    const news = new News({
      ...req.body,
      author: req.user._id,
      image: req.file ? `/uploads/${req.file.filename}` : undefined
    });
    
    await news.save();
    
    // Notify all connected clients
    io.emit('newNews', news);
    
    res.status(201).send(news);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get News
app.get('/api/news', async (req, res) => {
  try {
    const news = await News.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.send(news);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 