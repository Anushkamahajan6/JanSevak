const express = require('express');
const jwt = require('jsonwebtoken');
const Issue = require('../models/Issue');
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

router.get('/stats', verifyToken, async (req, res) => {
  try {
    const total = await Issue.countDocuments();
    const resolved = await Issue.countDocuments({ status: 'resolved' });
    const inProgress = await Issue.countDocuments({ status: 'in-progress' });
    const pending = await Issue.countDocuments({ status: 'pending' });
    res.json({ total, resolved, inProgress, pending });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId.match(/^[0-9a-fA-F]{24}$/))
      return res.status(400).json({ error: 'Invalid user ID format' });
    const issues = await Issue.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json({ issues });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

router.post('/:id/upvote', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/))
      return res.status(400).json({ error: 'Invalid issue ID format' });
    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    if (issue.upvotedBy.includes(userId))
      return res.status(400).json({ error: 'Already upvoted', upvotes: issue.upvotes });
    issue.upvotedBy.push(userId);
    issue.upvotes += 1;
    await issue.save();
    res.json({ success: true, upvotes: issue.upvotes, message: 'Upvote recorded' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upvote issue' });
  }
});

router.get('/', async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 }).lean();
    res.json({ issues });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { category, severity, status, location, title, description } = req.body;
    const userId = req.user.id;
    if (!category || !location || !location.coordinates)
      return res.status(400).json({ error: 'Missing required fields: category, location' });

    const newIssue = new Issue({
      category, severity: severity || 3, status: status || 'pending',
      location: { type: 'Point', coordinates: location.coordinates, address: location.address || 'Unknown Location' },
      userId, title: title || category, description: description || '',
      upvotes: 0, upvotedBy: [], requestedVolunteers: []
    });
    await newIssue.save();

    const Volunteer = require('../models/volunteerModel');
    const activeVolunteers = await Volunteer.find({ isActive: true }).select('_id name');
    if (activeVolunteers.length > 0 && req.io) {
      req.io.emit('new_issue_created', {
        issueId: newIssue._id, category: newIssue.category, severity: newIssue.severity,
        description: newIssue.description, location: newIssue.location, title: newIssue.title,
        createdAt: newIssue.createdAt, urgency: newIssue.severity >= 4 ? 'HIGH' : 'MEDIUM'
      });
    }
    res.status(201).json({ success: true, issue: newIssue, message: 'Issue created successfully', volunteerCount: activeVolunteers.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

router.get('/heatmap', async (req, res) => {
  try {
    const issues = await Issue.find();
    const geojson = {
      type: 'FeatureCollection',
      features: issues.map(issue => ({
        type: 'Feature', geometry: issue.location,
        properties: { weight: issue.severity / 5, category: issue.category, status: issue.status }
      }))
    };
    res.json(geojson);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

module.exports = router;