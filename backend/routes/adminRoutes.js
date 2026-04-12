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

// ── GET /api/admin/ ──────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.send('Admin Dashboard');
});

// ── GET /api/admin/stats ─────────────────────────────────────────────────────
// NOTE: No auth guard so the dashboard can always show stats.
// Add verifyAdmin back once login flow for admins is wired up.
router.get('/stats', async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const resolved    = await Issue.countDocuments({ status: 'resolved' });
    const inProgress  = await Issue.countDocuments({ status: 'in-progress' });
    const open        = await Issue.countDocuments({ status: { $in: ['open', 'pending'] } });
    const hotspots    = await Issue.countDocuments({ severity: { $gte: 4 } });
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

// ── GET /api/admin/issues ────────────────────────────────────────────────────
router.get('/issues', async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 }).lean();
    res.json({ issues });
  } catch (err) {
    console.error('Fetch issues error:', err);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

// ── PATCH /api/admin/issues/:id/status ──────────────────────────────────────
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

// ── GET /api/admin/volunteers ────────────────────────────────────────────────
router.get('/volunteers', async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ createdAt: -1 }).lean();
    res.json({ volunteers });
  } catch (err) {
    console.error('Fetch volunteers error:', err);
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
});

// ── GET /api/admin/issue/:issueId/volunteers ─────────────────────────────────
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

// ── POST /api/admin/issue/:issueId/approve/:volunteerId ──────────────────────
router.post('/issue/:issueId/approve/:volunteerId', verifyAdmin, async (req, res) => {
  try {
    const { issueId, volunteerId } = req.params;

    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });

    issue.assignedVolunteer = volunteerId;
    issue.status = 'in-progress';
    await issue.save();

    volunteer.history.push({ taskId: issueId, status: 'Assigned' });
    await volunteer.save();

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