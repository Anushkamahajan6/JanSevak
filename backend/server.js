const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Import DB connection and Routes
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
// const adminRoutes = require('./routes/adminRoutes');
// const userRoutes = require('./routes/userRoutes');

// Initialize environment variables
dotenv.config();

// Connect to the database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Mount the routes
app.use('/api/auth', authRoutes);
app.use('/api/volunteer', volunteerRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/user', userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`JanSevak Server running on port ${PORT}`);
});