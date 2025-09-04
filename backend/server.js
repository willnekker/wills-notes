require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database.js'); // Initializes DB connection and schema

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const notebookRoutes = require('./routes/notebooks');
const noteRoutes = require('./routes/notes');
const attachmentRoutes = require('./routes/attachments');
const searchRoutes = require('./routes/search');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

app.listen(PORT, () => {
  console.log(`Backend server is listening on port ${PORT}`);
});
