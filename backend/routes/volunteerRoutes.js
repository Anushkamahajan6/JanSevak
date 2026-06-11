const express = require('express');
const jwt = require('jsonwebtoken');
const Volunteer = require('../models/volunteerModel');
const Issue = require('../models/Issue');
const {
  getNearbyTasks, applyForTask, requestMoreVolunteers,
  submitProof, respondToIssue
} = require('../controllers/volunteerController');

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

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ userId: req.user.id });
    if (!volunteer) return res.json({ volunteer: null });
    res.json({ volunteer });
  } catch (err) {
    console.error('Fetch volunteer profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/profile', verifyToken, async (req, res) => {
  try {
    const { name, type, ngoName, skills } = req.body;
    const existing = await Volunteer.findOne({ userId: req.user.id });
    if (existing) return res.status(400).json({ error: 'Profile already exists' });

    const newVolunteer = await Volunteer.create({
      userId: req.user.id, name, type, ngoName, skills, points: 0, rating: 0
    });
    res.status(201).json({ message: 'Profile created successfully', volunteer: newVolunteer });
  } catch (err) {
    console.error('Create volunteer profile error:', err);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

router.get('/tasks', getNearbyTasks);
router.post('/apply', applyForTask);
router.post('/request-more', requestMoreVolunteers);
router.post('/submit-proof', submitProof);
router.post('/respond', respondToIssue);

router.patch('/active', verifyToken, async (req, res) => {
  try {
    const { isActive } = req.body;
    const volunteer = await Volunteer.findOneAndUpdate(
      { userId: req.user.id }, { isActive }, { new: true }
    );
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });
    res.json({ message: isActive ? 'You are now Active' : 'You are now Offline', volunteer });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/express-interest', verifyToken, async (req, res) => {
  try {
    const { issueId } = req.body;
    const volunteer = await Volunteer.findOne({ userId: req.user.id });
    if (!volunteer) return res.status(404).json({ error: 'Volunteer profile not found' });

    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const already = issue.requestedVolunteers.some(
      rv => rv.volunteerId.toString() === volunteer._id.toString()
    );
    if (already) return res.status(400).json({ error: 'Already expressed interest' });

    issue.requestedVolunteers.push({ volunteerId: volunteer._id, respondedAt: new Date() });
    await issue.save();
    res.json({ message: 'Interest registered. Admin will review and assign you.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;