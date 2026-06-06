const express = require('express');
const jwt = require('jsonwebtoken');
const Issue = require('../models/Issue');
const Volunteer = require('../models/volunteerModel');

const router = express.Router();

// Auth middleware
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

// GET /api/admin/
router.get('/', (req, res) => {
  res.send('Admin Dashboard');
});

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const resolved = await Issue.countDocuments({ status: 'resolved' });
    const inProgress = await Issue.countDocuments({ status: 'in-progress' });
    const open = await Issue.countDocuments({ status: { $in: ['open', 'pending'] } });
    const hotspots = await Issue.countDocuments({ severity: { $gte: 4 } });
    const animalCases = await Issue.countDocuments({
      category: { $regex: /animal/i },
      status: { $ne: 'resolved' }
    });
    const activeVolunteers = await Volunteer.countDocuments();

    res.json({ totalIssues, resolved, inProgress, open, hotspots, animalCases, activeVolunteers });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/admin/issues
router.get('/issues', async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 }).lean();
    res.json({ issues });
  } catch (err) {
    console.error('Fetch issues error:', err);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

// PATCH /api/admin/issues/:id/status
router.patch('/issues/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['open', 'pending', 'in-progress', 'resolved'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const issue = await Issue.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    res.json({ success: true, issue });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// GET /api/admin/volunteers
router.get('/volunteers', async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ createdAt: -1 }).lean();
    res.json({ volunteers });
  } catch (err) {
    console.error('Fetch volunteers error:', err);
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
});

// GET /api/admin/issue/:issueId/volunteers
router.get('/issue/:issueId/volunteers', verifyAdmin, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.issueId)
      .populate('requestedVolunteers.volunteerId', 'name type ngoName skills rating points score')
      .populate('assignedTo', 'name type skills rating');

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
        assignedTo: issue.assignedTo,
      },
      requestedVolunteers: issue.requestedVolunteers,
    });
  } catch (err) {
    console.error('Fetch volunteers error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/approve
// Approve a volunteer for an issue
// Body: { volunteerId, issueId, approved: true/false }
router.post('/approve', async (req, res) => {
  try {
    const { volunteerId, issueId, approved } = req.body;

    if (!volunteerId || !issueId) {
      return res.status(400).json({ error: 'volunteerId and issueId are required' });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });

    const requestEntry = issue.requestedVolunteers.find(
      rv => rv.volunteerId.toString() === volunteerId
    );

    if (!requestEntry) {
      return res.status(404).json({ error: 'Volunteer not in requested list' });
    }

    if (approved) {
      // Assign the issue to this volunteer
      issue.assignedTo = volunteerId;
      issue.status = 'in-progress';
      requestEntry.approved = true;
    } else {
      requestEntry.approved = false;
    }

    await issue.save();

    res.json({
      message: approved ? `Volunteer "${volunteer.name}" assigned.` : `Volunteer "${volunteer.name}" rejected.`,
      issueStatus: issue.status,
      assignedTo: issue.assignedTo
    });
  } catch (err) {
    console.error('Approve volunteer error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/issue/:issueId/approve/:volunteerId
router.post('/issue/:issueId/approve/:volunteerId', verifyAdmin, async (req, res) => {
  try {
    const { issueId, volunteerId } = req.params;

    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });

    // Update requestedVolunteers if volunteer is in the list
    const requestEntry = issue.requestedVolunteers.find(
      rv => rv.volunteerId.toString() === volunteerId
    );
    if (requestEntry) {
      requestEntry.approved = true;
    }

    issue.assignedTo = volunteerId;
    issue.status = 'in-progress';
    await issue.save();

    res.json({
      message: `Volunteer "${volunteer.name}" approved and assigned to issue.`,
      issueStatus: 'in-progress',
      assignedVolunteer: { _id: volunteer._id, name: volunteer.name }
    });
  } catch (err) {
    console.error('Approve volunteer error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;