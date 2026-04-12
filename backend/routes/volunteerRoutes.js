const express = require('express');
const Volunteer = require('../models/volunteerModel');
const Issue = require('../models/Issue');

const {
  createProfile,
  getNearbyTasks,
  applyForTask,
  requestMoreVolunteers,
  submitProof,
  respondToIssue
} = require('../controllers/volunteerController');

const router = express.Router();

router.post('/profile', createProfile);
router.get('/tasks', getNearbyTasks);
router.post('/apply', applyForTask);
router.post('/request-more', requestMoreVolunteers);
router.post('/submit-proof', submitProof);
router.post('/respond', respondToIssue);

// Toggle active/inactive status
router.patch('/active', async (req, res) => {
  try {
    const { volunteerId, isActive } = req.body;
    const updatedVolunteer = await Volunteer.findByIdAndUpdate(
      volunteerId,
      { isActive },
      { new: true }
    );
    if (!updatedVolunteer) return res.status(404).json({ error: 'Volunteer not found' });
    res.json({
      message: isActive ? "You are now Active" : "You are now Offline",
      volunteer: updatedVolunteer
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post('/status', async (req, res) => {
  try {
    const { volunteerId, isActive } = req.body;
    const updatedVolunteer = await Volunteer.findByIdAndUpdate(
      volunteerId,
      { isActive },
      { new: true }
    );
    res.json({
      message: isActive ? "You are now Active" : "You are now Offline",
      volunteer: updatedVolunteer
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Volunteer clicks "I want to help" on an issue
router.post('/express-interest', async (req, res) => {
  try {
    const { volunteerId, issueId } = req.body;

    if (!volunteerId || !issueId) {
      return res.status(400).json({ error: 'volunteerId and issueId are required' });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });

    // Prevent duplicate interest
    const already = issue.requestedVolunteers.some(
      rv => rv.volunteerId.toString() === volunteerId
    );
    if (already) {
      return res.status(400).json({ error: 'Already expressed interest in this issue' });
    }

    issue.requestedVolunteers.push({
      volunteerId: volunteer._id,
      respondedAt: new Date()
    });
    await issue.save();

    res.status(200).json({ message: 'Interest registered! Admin will review and assign you.' });
  } catch (error) {
    console.error('Express interest error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;