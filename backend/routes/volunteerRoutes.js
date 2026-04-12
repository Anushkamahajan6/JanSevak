const express = require('express');

const Volunteer = require('../models/volunteerModel');

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

router.post('/status', async (req, res) => {
  try {
    const { volunteerId, isActive } = req.body;

    const updatedVolunteer = await Volunteer.findByIdAndUpdate(
      volunteerId,
      { isActive },
      { new: true }
    );

    res.json({
      message: isActive
        ? "You are now Active"
        : "You are now Offline",
      volunteer: updatedVolunteer
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post('/submit-proof', submitProof);

module.exports = router;