const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware - allow all origins for deployment
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
app.use('/api/patients', require('./routes/patients'));
app.use('/api/readings', require('./routes/readings'));
app.use('/api/emergencies', require('./routes/emergencies'));

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Home Health Backend is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Home Health System API',
    version: '1.0.0',
    endpoints: ['/api/patients', '/api/readings', '/api/emergencies', '/health']
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});
