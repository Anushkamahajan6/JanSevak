const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const twilioRoutes = require('./routes/twilioRoutes');
const heatmapRoutes = require('./routes/heatmap');
const issueRoutes = require('./routes/issueRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes'); // ✅ NEW

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));

app.use('/twilio', twilioRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/admin', adminRoutes); // ✅ NEW
app.use('/api', heatmapRoutes);

app.listen(PORT, () => {
  console.log(`JanSawak Server running on port ${PORT}`);
});