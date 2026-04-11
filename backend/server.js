const express = require('express');
const app = express();

const PORT = 5000;

// Middleware
app.use(express.json());

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const volunteerRoutes = require('./routes/volunterRoutes');

// Use routes
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/volunteer', volunteerRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});