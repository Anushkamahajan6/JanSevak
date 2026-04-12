const Volunteer = require('../models/volunteerModel');
const Issue = require('../models/Issue');

// 1. Create Volunteer Profile
const createProfile = async (req, res) => {
  try {
    const { name, type, ngoName, skills } = req.body;
    const newVolunteer = await Volunteer.create({
      name, type, ngoName, skills,
      points: 0, rating: 0
    });
    res.status(201).json({ message: "Profile created successfully!", volunteer: newVolunteer });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ error: "Failed to create profile" });
  }
};

// 2. Get nearby tasks — NOW FROM REAL MongoDB issues
const getNearbyTasks = async (req, res) => {
  try {
    // Fetch all open/pending issues from DB, newest first
    const issues = await Issue.find({
      status: { $in: ['open', 'pending'] }
    })
      .sort({ createdAt: -1 })
      .lean();

    // Map Issue documents to the task shape the frontend expects
    const tasks = issues.map(issue => ({
      reportId: issue._id,           // real MongoDB _id used for express-interest
      category: issue.category,
      description: issue.description || `${issue.category} reported near this location.`,
      reportedBy: 'Community',
      address: issue.location?.address || 'Location on map',
      coordinates: {
        lat: issue.location?.coordinates?.[1],
        lng: issue.location?.coordinates?.[0],
      },
      status: issue.status,
      severity: issue.severity,
      pointsReward: issue.severity * 20, // e.g. severity 5 → 100 pts
      createdAt: issue.createdAt,
    }));

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("getNearbyTasks error:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

// 3. Apply for a task
const applyForTask = async (req, res) => {
  try {
    const { volunteerId, taskId } = req.body;
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) return res.status(404).json({ error: "Volunteer not found" });

    let assignmentStatus = volunteer.rating >= 4.0 ? "Assigned" : "Pending Approval";

    volunteer.history.push({ taskId: null, status: assignmentStatus });
    await volunteer.save();

    res.status(200).json({ message: `Task application received. Status: ${assignmentStatus}`, taskId });
  } catch (error) {
    console.error("Apply task error:", error);
    res.status(500).json({ error: "Failed to apply for task" });
  }
};

// 4. Submit proof & earn points
const submitProof = async (req, res) => {
  try {
    const { volunteerId, taskId, pointsEarned } = req.body;
    const updatedVolunteer = await Volunteer.findByIdAndUpdate(
      volunteerId,
      { $inc: { points: pointsEarned || 10, tasksCompleted: 1 } },
      { new: true }
    );
    if (!updatedVolunteer) return res.status(404).json({ error: "Volunteer not found" });
    res.status(200).json({ message: "Proof submitted! Task completed.", totalPoints: updatedVolunteer.points });
  } catch (error) {
    console.error("Submit proof error:", error);
    res.status(500).json({ error: "Failed to submit proof" });
  }
};

module.exports = { createProfile, getNearbyTasks, applyForTask, submitProof };