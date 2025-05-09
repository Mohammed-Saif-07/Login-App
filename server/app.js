const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // Added for production static file serving
const authRoutes = require('./routes/auth');

const app = express();

// Middleware Configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enhanced CORS Configuration
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:3000'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
}));

// MongoDB Connection with improved settings
mongoose.set('strictQuery', false); // Remove deprecation warning

const MONGO_URI='your-mongodb-connection-string',

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
  socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
})
.then(() => console.log('MongoDB connected successfully!'))
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1); // Exit process on connection failure
});

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

// Routes
app.use('/api/auth', authRoutes);

// Test Route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date()
  });
});

// Production Configuration
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'index.html'));
  });
}

// Enhanced Error Handling
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.stack);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Server Configuration
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
