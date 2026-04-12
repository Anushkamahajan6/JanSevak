const express = require('express');
const Volunteer = require('../models/volunteerModel');
const Issue = require('../models/Issue');

const {
  createProfile,
  getNearbyTasks,
  applyForTask,
  submitProof
} = require('../controllers/volunteerController');

const router = express.Router();

router.post('/profile', createProfile);
router.get('/tasks', getNearbyTasks);
router.post('/apply', applyForTask);
router.post('/submit-proof', submitProof);

// Toggle active/inactive status
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

// ✅ NEW: Volunteer clicks "I want to help" on an issue
// POST /api/volunteer/express-interest
// Body: { volunteerId, issueId }
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
    if (issue.interestedVolunteers.includes(volunteerId)) {
      return res.status(400).json({ error: 'Already expressed interest in this issue' });
    }

    issue.interestedVolunteers.push(volunteerId);
    await issue.save();

    res.status(200).json({ message: 'Interest registered! Admin will review and assign you.' });
  } catch (error) {
    console.error('Express interest error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;