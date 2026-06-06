const express = require('express');
const jwt = require('jsonwebtoken');
const Issue = require('../models/Issue');

const router = express.Router();

// Verify JWT token from cookies
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
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * 1. GET /api/issues/stats
 * Returns aggregate statistics about all issues
 */
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const total = await Issue.countDocuments();
    const resolved = await Issue.countDocuments({ status: 'resolved' });
    const inProgress = await Issue.countDocuments({ status: 'in-progress' });
    const pending = await Issue.countDocuments({ status: 'pending' });

    res.json({
      total,
      resolved,
      inProgress,
      pending
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * 2. GET /api/issues/user/:userId
 * Returns all issues filed by a specific user
 */
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const issues = await Issue.find({ userId })
      .sort({ createdAt: -1 }) // Newest first
      .lean(); // Return plain objects for better performance

    res.json({ issues });
  } catch (err) {
    console.error('Error fetching user issues:', err);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

/**
 * 3. POST /api/issues/:id/upvote
 * Increment upvote count for an issue
 */
router.post('/:id/upvote', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // From JWT token

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid issue ID format' });
    }

    // Find issue
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Check if user already upvoted (prevent duplicates)
    if (issue.upvotedBy.includes(userId)) {
      return res.status(400).json({ 
        error: 'You have already upvoted this issue',
        upvotes: issue.upvotes 
      });
    }

    // Add user to upvotedBy and increment upvotes
    issue.upvotedBy.push(userId);
    issue.upvotes += 1;
    await issue.save();

    res.json({
      success: true,
      upvotes: issue.upvotes,
      message: 'Upvote recorded'
    });
  } catch (err) {
    console.error('Error upvoting issue:', err);
    res.status(500).json({ error: 'Failed to upvote issue' });
  }
});

/**
 * 5. GET /api/issues
 * Returns all issues (for public view/admin)
 */
router.get('/', async (req, res) => {
  try {
    const issues = await Issue.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({ issues });
  } catch (err) {
    console.error('Error fetching all issues:', err);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

/**
 * 6. POST /api/issues
 * Create a new issue
 * Triggers volunteer notifications if active volunteers exist
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { category, severity, status, location, title, description } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!category || !location || !location.coordinates) {
      return res.status(400).json({ error: 'Missing required fields: category, location' });
    }

    // Create new issue
    const newIssue = new Issue({
      category,
      severity: severity || 3,
      status: status || 'pending',
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address || 'Unknown Location'
      },
      userId,
      title: title || category,
      description: description || '',
      upvotes: 0,
      upvotedBy: [],
      requestedVolunteers: []
    });

    await newIssue.save();

    // Check for active volunteers to trigger notifications
    const Volunteer = require('../models/volunteerModel');
    const activeVolunteers = await Volunteer.find({ isActive: true }).select('_id name');
    
    if (activeVolunteers.length > 0 && req.io) {
      // Emit notification to all connected volunteers
      // In production, you'd track which volunteers are connected via Socket.io rooms
      req.io.emit('new_issue_created', {
        issueId: newIssue._id,
        category: newIssue.category,
        severity: newIssue.severity,
        description: newIssue.description,
        location: newIssue.location,
        title: newIssue.title,
        createdAt: newIssue.createdAt,
        urgency: newIssue.severity >= 4 ? 'HIGH' : 'MEDIUM'
      });
      
      console.log(`🔔 📢 Notified ${activeVolunteers.length} active volunteers about new issue ${newIssue._id}`);
    }

    res.status(201).json({
      success: true,
      issue: newIssue,
      message: 'Issue created successfully',
      volunteerCount: activeVolunteers.length
    });
  } catch (err) {
    console.error('Error creating issue:', err);
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

/**
 * 5. GET /api/heatmap
 * Returns issues as GeoJSON for heatmap visualization
 */
router.get('/heatmap', async (req, res) => {
  try {
    const issues = await Issue.find();
    const geojson = {
      type: 'FeatureCollection',
      features: issues.map(issue => ({
        type: 'Feature',
        geometry: issue.location,
        properties: { 
          weight: issue.severity / 5,
          category: issue.category,
          status: issue.status
        }
      }))
    };
    res.json(geojson);
  } catch (err) {
    console.error('Error fetching heatmap data:', err);
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

module.exports = router;
