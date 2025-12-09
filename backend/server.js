// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas successfully!');
})
.catch((error) => {
  console.log('❌ MongoDB connection error:', error.message);
});

// Import routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const readingRoutes = require('./routes/readings');
const emergencyRoutes = require('./routes/emergencies');
const emrRoutes = require('./routes/emr');
const paymentRoutes = require('./routes/payments');
const labRoutes = require('./routes/labs');
const appointmentRoutes = require('./routes/appointments');
const visitNoteRoutes = require('./routes/visitNotes');
const carePlanRoutes = require('./routes/carePlans');
const taskRoutes = require('./routes/tasks');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/emr', emrRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/visit-notes', visitNoteRoutes);
app.use('/api/care-plans', carePlanRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Home Health System API',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      patients: '/api/patients',
      readings: '/api/readings',
      emergencies: '/api/emergencies',
      emr: '/api/emr',
      payments: '/api/payments',
      labs: '/api/labs',
      appointments: '/api/appointments',
      visitNotes: '/api/visit-notes',
      carePlans: '/api/care-plans',
      tasks: '/api/tasks'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
});