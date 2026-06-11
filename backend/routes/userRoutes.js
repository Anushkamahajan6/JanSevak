const express = require('express');
const jwt = require('jsonwebtoken');
const Issue = require('../models/Issue');
const User = require('../models/User');
const router = express.Router();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const tokenValue = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : req.cookies?.token;
  if (!tokenValue) return res.status(401).json({ error: 'Not authenticated' });
  try {
    req.user = jwt.verify(tokenValue, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/', (req, res) => res.send('User Dashboard'));

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ userId: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const update = {};
    if (name) update.name = name.trim();
    if (phone !== undefined) update.phone = phone.trim();
    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('name email role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ userId: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const totalIssues = await Issue.countDocuments({ userId });
    const resolved = await Issue.countDocuments({ userId, status: 'resolved' });
    const pending = await Issue.countDocuments({ userId, status: 'pending' });
    const inProgress = await Issue.countDocuments({ userId, status: 'in-progress' });
    res.json({ totalIssues, resolved, pending, inProgress });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;