import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Import DB connection and Routes
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import volunteerRoutes from './routes/volunteerRoutes.js';
// import adminRoutes from './routes/adminRoutes.js';
// import userRoutes from './routes/userRoutes.js';

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