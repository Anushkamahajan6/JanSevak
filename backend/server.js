const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');

dotenv.config();
connectDB();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
import express from 'express';
import volunteerRoutes from './routes/volunteerRoutes.js';
// import adminRoutes from './routes/adminRoutes.js';
// import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use('/api/auth', authRoutes);

// Mount the routes
app.use('/api/volunteer', volunteerRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/user', userRoutes);

app.listen(PORT, () => {
  console.log(`JanSevak Server running on port ${PORT}`);
});