const express = require('express');
const jwt = require('jsonwebtoken');
const Issue = require('../models/Issue');
const Volunteer = require('../models/volunteerModel');

const router = express.Router();

// ── Auth middleware ──────────────────────────────────────────────────────────
const verifyAdmin = (req, res, next) => {
  const cookieHeader = req.headers.cookie || '';
  const tokenCookie = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('token='));
  const token = tokenCookie ? tokenCookie.substring('token='.length) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access only' });
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ── GET /admin/ ──────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.send('Admin Dashboard');
});

// ── GET /admin/issues ───────────────────────────────────────────────────
router.get("/issues", async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /admin/issue/:issueId/volunteers ─────────────────────────────────
router.get('/issue/:issueId/volunteers', verifyAdmin, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.issueId)
      .populate('interestedVolunteers', 'name type ngoName skills rating points badges')
      .populate('assignedVolunteer', 'name type skills rating');

    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    res.json({
      issue: {
        _id: issue._id,
        category: issue.category,
        status: issue.status,
        severity: issue.severity,
        location: issue.location,
        title: issue.title,
        description: issue.description,
        assignedVolunteer: issue.assignedVolunteer,
      },
      interestedVolunteers: issue.interestedVolunteers,
    });
  } catch (err) {
    console.error('Fetch volunteers error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /admin/issue/:issueId/approve/:volunteerId ──────────────────────
router.post('/issue/:issueId/approve/:volunteerId', verifyAdmin, async (req, res) => {
  try {
    const { issueId, volunteerId } = req.params;

    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });

    // Assign volunteer and move issue to in-progress
    issue.assignedVolunteer = volunteerId;
    issue.status = 'in-progress';
    await issue.save();

    // Log in volunteer's history
    volunteer.history.push({
      taskId: issueId,
      status: 'Assigned',
    });
    await volunteer.save();

    res.json({
      message: `Volunteer "${volunteer.name}" approved and assigned to issue.`,
      issueStatus: 'in-progress',
      assignedVolunteer: {
        _id: volunteer._id,
        name: volunteer.name,
      }
    });
  } catch (err) {
    console.error('Approve volunteer error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;