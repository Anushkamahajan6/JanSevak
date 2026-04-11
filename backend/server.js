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
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use('/api/auth', authRoutes);

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const volunteerRoutes = require('./routes/volunterRoutes');
const heatmapRoutes = require('./routes/heatmap');
const Issue = require('./models/Issue');


// Use routes
app.use('/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/volunteer', volunteerRoutes);
app.use('/api/heatmap', heatmapRoutes);


// Default route
app.get('/api/heatmap', async (req, res) => {
  try {
    const issues = await Issue.find();
    const geojson = {
      type: 'FeatureCollection',
      features: issues.map(issue => ({
        type: 'Feature',
        geometry: issue.location,
        properties: { 
          weight: issue.severity === 5 ? 1 : 0.5, // Using your 5-scale from Atlas
          category: issue.category 
        }
      }))
    };
    res.json(geojson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});