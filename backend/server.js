require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize express app first
const app = express();
const PORT = process.env.PORT || 3001;

// Add global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Initialize database with error handling
let db;
try {
  db = require('./database.js');
  console.log('Database initialized successfully');
} catch (error) {
  console.error('Failed to initialize database:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Load routes with error handling
let authRoutes, dashboardRoutes, notebookRoutes, noteRoutes, attachmentRoutes, searchRoutes, userRoutes;
try {
  authRoutes = require('./routes/auth');
  dashboardRoutes = require('./routes/dashboard');
  notebookRoutes = require('./routes/notebooks');
  noteRoutes = require('./routes/notes');
  attachmentRoutes = require('./routes/attachments');
  searchRoutes = require('./routes/search');
  userRoutes = require('./routes/user');
  console.log('All routes loaded successfully');
} catch (error) {
  console.error('Failed to load routes:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notebooks', notebookRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/user', userRoutes);

// --- Health Check ---
app.get('/api', (req, res) => {
  res.json({ message: "Welcome to Will's Notes API. Backend is running." });
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`Backend server is listening on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/api`);
});

server.on('error', (err) => {
  console.error('Server error:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});
