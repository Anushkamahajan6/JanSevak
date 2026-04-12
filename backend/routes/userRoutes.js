const express = require('express');
const jwt = require('jsonwebtoken');
const Issue = require('../models/Issue');
const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const cookieHeader = req.headers.cookie || '';
  const tokenCookie = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('token='));
  const token = tokenCookie ? tokenCookie.substring('token='.length) : null;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// User route
router.get('/', (req, res) => {
  res.send('User Dashboard');
});

// Dashboard API - Get aggregated statistics
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const resolved = await Issue.countDocuments({ status: 'resolved' });
    const pending = await Issue.countDocuments({ status: 'pending' });

    res.json({
      totalIssues,
      resolved,
      pending
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Profile route used by the frontend
router.get('/profile', (req, res) => {
  const cookieHeader = req.headers.cookie || '';
  const tokenCookie = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('token='));
  const token = tokenCookie ? tokenCookie.substring('token='.length) : null;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ userId: decoded.id, role: decoded.role });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;