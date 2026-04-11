const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// User route
router.get('/', (req, res) => {
  res.send('User Dashboard');
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