const Volunteer = require('../models/volunteerModel');
const Issue = require('../models/Issue');

// Get nearby tasks from real MongoDB issues
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
    console.error('getNearbyTasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Auto-assignment queue (in-memory)
const activeTaskQueues = {};

const applyForTask = async (req, res) => {
  try {
    const { volunteerId, taskId } = req.body;
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });

    if (!activeTaskQueues[taskId]) {
      activeTaskQueues[taskId] = { isAssigned: false, applicants: [], waitlist: [], timer: null };
    }

    if (activeTaskQueues[taskId].isAssigned) {
      return res.status(400).json({ error: 'This task has already been assigned.' });
    }

    const alreadyApplied = activeTaskQueues[taskId].applicants.some(
      a => a.volunteerId.toString() === volunteerId
    );
    if (alreadyApplied) return res.status(400).json({ error: 'Already applied for this task.' });

    activeTaskQueues[taskId].applicants.push({
      volunteerId: volunteer._id,
      points: volunteer.points,
      name: volunteer.name,
    });

    volunteer.history.push({ taskId, status: 'Pending Approval' });
    await volunteer.save();

    if (!activeTaskQueues[taskId].timer) {
      activeTaskQueues[taskId].timer = setTimeout(async () => {
        const pool = activeTaskQueues[taskId].applicants;
        if (pool.length === 0) return;
        pool.sort((a, b) => b.points - a.points);
        const lead = pool[0];
        await Volunteer.updateOne(
          { _id: lead.volunteerId, 'history.taskId': taskId },
          { $set: { 'history.$.status': 'Assigned (Primary Lead)' } }
        );
        for (let i = 1; i < pool.length; i++) {
          await Volunteer.updateOne(
            { _id: pool[i].volunteerId, 'history.taskId': taskId },
            { $set: { 'history.$.status': 'Waitlisted' } }
          );
        }
        activeTaskQueues[taskId].waitlist = pool.slice(1);
        activeTaskQueues[taskId].isAssigned = true;
      }, 15000);
    }

    res.status(200).json({ message: "You're in the queue! Auto-assignment in ~15 seconds.", taskId });
  } catch (error) {
    console.error('Apply task error:', error);
    res.status(500).json({ error: 'Failed to apply' });
  }
};

const requestMoreVolunteers = async (req, res) => {
  try {
    const { taskId, additionalCount } = req.body;
    if (!taskId || !additionalCount) return res.status(400).json({ error: 'taskId and additionalCount required.' });

    const queue = activeTaskQueues[taskId];
    if (!queue) return res.status(404).json({ error: 'No active queue found.' });
    if (!queue.isAssigned) return res.status(400).json({ error: 'Auto-assignment not completed yet.' });

    const toAssign = queue.waitlist.splice(0, parseInt(additionalCount));
    if (toAssign.length === 0) return res.status(200).json({ message: 'No volunteers left on waitlist.' });

    for (const v of toAssign) {
      await Volunteer.updateOne(
        { _id: v.volunteerId, 'history.taskId': taskId },
        { $set: { 'history.$.status': 'Assigned' } }
      );
    }
    queue.waitlist = [];

    res.status(200).json({ message: `${toAssign.length} volunteer(s) assigned from waitlist.` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to request more volunteers' });
  }
};

const submitProof = async (req, res) => {
  try {
    const { volunteerId, taskId, pointsEarned } = req.body;
    const updated = await Volunteer.findByIdAndUpdate(
      volunteerId,
      { $inc: { points: pointsEarned || 10 } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Volunteer not found' });
    res.status(200).json({ message: 'Proof submitted. Task completed.', totalPoints: updated.points });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit proof' });
  }
};

const issueAutoAssignTimers = {};

const respondToIssue = async (req, res) => {
  try {
    const { volunteerId, issueId } = req.body;
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });

    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const already = issue.requestedVolunteers.some(rv => rv.volunteerId.toString() === volunteerId);
    if (already) return res.status(400).json({ error: 'Already expressed interest' });

    issue.requestedVolunteers.push({ volunteerId: volunteer._id, respondedAt: new Date() });
    await issue.save();

    if (!issueAutoAssignTimers[issueId]) {
      issueAutoAssignTimers[issueId] = setTimeout(async () => {
        const fresh = await Issue.findById(issueId);
        if (!fresh || fresh.assignedTo) return;
        const ids = fresh.requestedVolunteers.filter(rv => rv.approved !== false).map(rv => rv.volunteerId);
        const volunteers = await Volunteer.find({ _id: { $in: ids }, isActive: true }).sort({ score: -1 });
        if (volunteers.length > 0) {
          fresh.assignedTo = volunteers[0]._id;
          fresh.status = 'in-progress';
          await fresh.save();
        }
        delete issueAutoAssignTimers[issueId];
      }, 15000);
    }

    res.status(200).json({ message: 'Interest noted. Auto-assignment in ~15 seconds.', issueId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to respond' });
  }
};

module.exports = { getNearbyTasks, applyForTask, requestMoreVolunteers, submitProof, respondToIssue };