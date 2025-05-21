const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (user, rememberMe = false) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: rememberMe ? '30d' : '1d' }
  );
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, role, ...otherFields } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      role,
      ...otherFields,
    });

    await user.save();

    // Generate token
    const token = generateToken(user, req.body.rememberMe);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(role === 'citizen' ? {
          address: user.address,
          contactNumber: user.contactNumber,
          location: user.location,
        } : {
          rank: user.rank,
          department: user.department,
          isVerified: user.isVerified,
        }),
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password, role, rememberMe } = req.body;

    // Find user
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update remember me status
    if (rememberMe !== undefined) {
      user.rememberMe = rememberMe;
      await user.save();
    }

    // Generate token
    const token = generateToken(user, user.rememberMe);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(role === 'citizen' ? {
          address: user.address,
          contactNumber: user.contactNumber,
          location: user.location,
        } : {
          rank: user.rank,
          department: user.department,
          isVerified: user.isVerified,
        }),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      ...(user.role === 'citizen' ? {
        address: user.address,
        contactNumber: user.contactNumber,
        location: user.location,
      } : {
        rank: user.rank,
        department: user.department,
        isVerified: user.isVerified,
      }),
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Error getting user data' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, password, ...otherFields } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (password) user.password = password;

    // Update role-specific fields
    if (user.role === 'citizen') {
      if (otherFields.address) user.address = otherFields.address;
      if (otherFields.contactNumber) user.contactNumber = otherFields.contactNumber;
      if (otherFields.location) user.location = otherFields.location;
    } else {
      if (otherFields.rank) user.rank = otherFields.rank;
      if (otherFields.department) user.department = otherFields.department;
    }

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      ...(user.role === 'citizen' ? {
        address: user.address,
        contactNumber: user.contactNumber,
        location: user.location,
      } : {
        rank: user.rank,
        department: user.department,
        isVerified: user.isVerified,
      }),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;
    const user = await User.findOne({ email, role });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // TODO: Send reset email with token
    // For now, just return the token
    res.json({ message: 'Password reset token generated', resetToken });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Error processing forgot password request' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update password
    user.password = password;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Error resetting password' });
  }
}; 