const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Import DB connection and Routes
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const twilioRoutes = require('./routes/twilioRoutes');
const heatmapRoutes = require('./routes/heatmap');
const issueRoutes = require('./routes/issueRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize environment variables
dotenv.config();

// Connect to the database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.urlencoded({ extended: false })); // IMPORTANT for Twilio
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Routes
app.use('/twilio', twilioRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/heatmap', heatmapRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`JanSawak Server running on port ${PORT}`);
});