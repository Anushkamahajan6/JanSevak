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

// 2. Get nearby tasks from real MongoDB issues
const getNearbyTasks = async (req, res) => {
  try {
    const issues = await Issue.find({ status: { $in: ['open', 'pending'] } })
      .sort({ createdAt: -1 }).lean();

    const tasks = issues.map(issue => ({
      reportId: issue._id,
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
      pointsReward: issue.severity * 20,
      createdAt: issue.createdAt,
    }));

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("getNearbyTasks error:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

// --- AUTO-ASSIGNMENT ENGINE (In-Memory Queue) ---
const activeTaskQueues = {};

// 3. Apply for a task — joins the queue, triggers auto-assign after 15s
const applyForTask = async (req, res) => {
  try {
    const { volunteerId, taskId } = req.body;

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) return res.status(404).json({ error: "Volunteer not found" });

    // Initialize queue for this task if it doesn't exist
    if (!activeTaskQueues[taskId]) {
      activeTaskQueues[taskId] = { isAssigned: false, applicants: [], waitlist: [], timer: null };
    }

    if (activeTaskQueues[taskId].isAssigned) {
      return res.status(400).json({ error: "Sorry, this task has already been assigned." });
    }

    // Prevent duplicate applications
    const alreadyApplied = activeTaskQueues[taskId].applicants.some(
      a => a.volunteerId.toString() === volunteerId
    );
    if (alreadyApplied) {
      return res.status(400).json({ error: "You have already applied for this task." });
    }

    activeTaskQueues[taskId].applicants.push({
      volunteerId: volunteer._id,
      points: volunteer.points,
      name: volunteer.name,
    });

    volunteer.history.push({ taskId: taskId, status: "Pending Approval" });
    await volunteer.save();

    // Start the 15-second countdown (only once per task)
    if (!activeTaskQueues[taskId].timer) {
      console.log(`⏱️ Clock started for Task: ${taskId}`);

      activeTaskQueues[taskId].timer = setTimeout(async () => {
        const pool = activeTaskQueues[taskId].applicants;
        if (pool.length === 0) return;

        pool.sort((a, b) => b.points - a.points);
        const lead = pool[0];
        console.log(`👑 Auto-Assign: ${lead.name} is the Team Lead!`);

        // Assign Lead
        await Volunteer.updateOne(
          { _id: lead.volunteerId, "history.taskId": taskId },
          { $set: { "history.$.status": "Assigned (Primary Lead)" } }
        );

        // Waitlist everyone else
        for (let i = 1; i < pool.length; i++) {
          await Volunteer.updateOne(
            { _id: pool[i].volunteerId, "history.taskId": taskId },
            { $set: { "history.$.status": "Waitlisted" } }
          );
        }

        // Store waitlist for the "request more" feature
        activeTaskQueues[taskId].waitlist = pool.slice(1);
        activeTaskQueues[taskId].isAssigned = true;

        console.log(`✅ Task ${taskId} assigned. ${pool.length - 1} on waitlist.`);
      }, 15000);
    }

    res.status(200).json({ message: "You're in the queue! Auto-assignment in ~15 seconds.", taskId });
  } catch (error) {
    console.error("Apply task error:", error);
    res.status(500).json({ error: "Failed to apply" });
  }
};

// 4. Lead requests more volunteers from the waitlist
const requestMoreVolunteers = async (req, res) => {
  try {
    const { taskId, additionalCount } = req.body;

    if (!taskId || !additionalCount) {
      return res.status(400).json({ error: "taskId and additionalCount are required." });
    }

    const queue = activeTaskQueues[taskId];
    if (!queue) {
      return res.status(404).json({ error: "No active queue found for this task. Has the timer finished?" });
    }
    if (!queue.isAssigned) {
      return res.status(400).json({ error: "Auto-assignment hasn't completed yet. Wait for the timer." });
    }

    const count = parseInt(additionalCount);
    const toAssign = queue.waitlist.splice(0, count); // Take from front of waitlist

    if (toAssign.length === 0) {
      return res.status(200).json({ message: "No volunteers left on the waitlist." });
    }

    for (const v of toAssign) {
      await Volunteer.updateOne(
        { _id: v.volunteerId, "history.taskId": taskId },
        { $set: { "history.$.status": "Assigned" } }
      );
    }

    // Reject remaining waitlist
    for (const v of queue.waitlist) {
      await Volunteer.updateOne(
        { _id: v.volunteerId, "history.taskId": taskId },
        { $set: { "history.$.status": "Pending Approval" } } // or a "Rejected" status
      );
    }
    queue.waitlist = []; // Clear the rest

    const names = toAssign.map(v => v.name).join(', ');
    res.status(200).json({
      message: `✅ ${toAssign.length} volunteer(s) pulled from waitlist: ${names}`
    });
  } catch (error) {
    console.error("requestMoreVolunteers error:", error);
    res.status(500).json({ error: "Failed to request more volunteers" });
  }
};

// 5. Submit proof & earn points
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

module.exports = { createProfile, getNearbyTasks, applyForTask, requestMoreVolunteers, submitProof };