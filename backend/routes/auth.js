// backend/routes/auth.js - UPDATED WITH EMAIL
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, age, condition, address, specialization, licenseNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const userData = { email, password, name, role };
    
    if (role === 'patient') {
      userData.age = age;
      userData.condition = condition;
      userData.address = address;
    } else if (role === 'clinician') {
      userData.specialization = specialization;
      userData.licenseNumber = licenseNumber;
    }

    const user = new User(userData);
    await user.save();

    // Send welcome email (optional - don't block registration if it fails)
    sendWelcomeEmail(user.email, user.name, user.role).catch(err => {
      console.log('Welcome email failed:', err.message);
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        age: user.age,
        condition: user.condition,
        address: user.address,
        specialization: user.specialization
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Forgot Password - WITH EMAIL
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const emailResult = await sendPasswordResetEmail(user.email, resetToken);
    
    if (emailResult.success) {
      res.json({
        message: 'Password reset email sent successfully. Please check your inbox.',
        // Only for development/testing - REMOVE IN PRODUCTION:
        ...(process.env.NODE_ENV === 'development' && { 
          resetToken,
          resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
        })
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send reset email. Please try again later.',
        details: emailResult.message 
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful! You can now login with your new password.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;