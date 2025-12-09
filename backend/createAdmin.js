// backend/createAdmin.js
// Run this ONCE to create your first admin account
// Usage: node createAdmin.js

const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@homehealth.com' });
    if (existingAdmin) {
      console.log('❌ Admin already exists with email: admin@homehealth.com');
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      email: 'admin@homehealth.com',
      password: 'admin123', // Change this password after first login!
      name: 'System Administrator',
      role: 'admin',
      isActive: true
    });

    await admin.save();
    console.log('✅ Admin account created successfully!');
    console.log('📧 Email: admin@homehealth.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();