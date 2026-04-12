/**
 * volunteerSocket.js — Uber-style real-time volunteer dispatch
 *
 * Flow:
 * 1. Volunteer opens app → emits volunteer:go_active with their [lng, lat]
 * 2. Issue is reported → POST /api/heatmap/report → calls dispatchToNearbyVolunteers()
 * 3. Every active volunteer within 5km gets a 'new_task_ping' event instantly
 * 4. Volunteer hears sound + sees popup → accepts or ignores (30s timeout)
 * 5. First to accept → others get 'task_taken' → their popups dismiss
 */

// In-memory store of active volunteers: { userId → { socketId, coordinates: [lng, lat] } }
// Replace with Redis when scaling to multiple servers
const activeVolunteers = new Map();

/** Haversine distance in km between [lng,lat] pairs */
function getDistanceKm([lng1, lat1], [lng2, lat2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Called from heatmap route after a new issue is saved.
 * Pings all active volunteers within radiusKm.
 */
function dispatchToNearbyVolunteers(io, issue, radiusKm = 5) {
  const issueCoords = issue.location.coordinates; // [lng, lat]
  const pinged = [];

  for (const [userId, volunteer] of activeVolunteers.entries()) {
    const dist = getDistanceKm(issueCoords, volunteer.coordinates);
    if (dist <= radiusKm) {
      io.to(volunteer.socketId).emit('new_task_ping', {
        issue: {
          _id: issue._id,
          category: issue.category,
          severity: issue.severity,
          status: issue.status,
          location: issue.location,
          createdAt: issue.createdAt,
        },
        distanceKm: +dist.toFixed(2),
        timeoutSeconds: 30,
      });
      pinged.push(userId);
    }
  }

  console.log(`📡 Pinged ${pinged.length} volunteer(s) within ${radiusKm}km for issue ${issue._id}`);
  return pinged;
}

/**
 * When a volunteer accepts, tell all others to dismiss the popup.
 */
function notifyTaskTaken(io, issueId, acceptedByUserId) {
  for (const [userId, volunteer] of activeVolunteers.entries()) {
    if (userId !== acceptedByUserId) {
      io.to(volunteer.socketId).emit('task_taken', { issueId });
    }
  }
}

/** Called once from server.js */
function initSocket(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Volunteer goes active — registers location
    // Payload: { userId, coordinates: [lng, lat] }
    socket.on('volunteer:go_active', (data) => {
      if (!data?.userId || !data?.coordinates) return;
      activeVolunteers.set(data.userId, {
        socketId: socket.id,
        coordinates: data.coordinates,
        name: data.name || '',
      });
      socket.emit('volunteer:active_confirmed', {
        message: 'You are now active. You will receive nearby issue alerts.',
        activeCount: activeVolunteers.size,
      });
      console.log(`✅ Volunteer active: ${data.userId} | Total active: ${activeVolunteers.size}`);
    });

    // Volunteer moves — update their location
    // Payload: { userId, coordinates: [lng, lat] }
    socket.on('volunteer:update_location', (data) => {
      if (!data?.userId || !data?.coordinates) return;
      const v = activeVolunteers.get(data.userId);
      if (v) { v.coordinates = data.coordinates; activeVolunteers.set(data.userId, v); }
    });

    // Volunteer goes offline manually
    // Payload: { userId }
    socket.on('volunteer:go_inactive', (data) => {
      if (data?.userId) {
        activeVolunteers.delete(data.userId);
        socket.emit('volunteer:inactive_confirmed', { message: 'You are now offline.' });
        console.log(`⬛ Volunteer offline: ${data.userId} | Total active: ${activeVolunteers.size}`);
      }
    });

    // Volunteer accepts a task ping
    // Payload: { userId, issueId }
    socket.on('volunteer:accept_task', (data) => {
      if (!data?.userId || !data?.issueId) return;
      socket.emit('task_accepted_confirmed', {
        issueId: data.issueId,
        message: 'Task accepted! Check your task list.',
      });
      notifyTaskTaken(io, data.issueId, data.userId);
      console.log(`🤝 Volunteer ${data.userId} accepted issue ${data.issueId}`);
    });

    // Heartbeat — keeps volunteer in active map
    socket.on('volunteer:ping_active', (data) => {
      // just a keep-alive, no action needed
    });

    // Auto-remove on disconnect (app closed, network lost)
    socket.on('disconnect', () => {
      for (const [userId, v] of activeVolunteers.entries()) {
        if (v.socketId === socket.id) {
          activeVolunteers.delete(userId);
          console.log(`🔴 Volunteer disconnected: ${userId} | Total active: ${activeVolunteers.size}`);
          break;
        }
      }
    });
  });
}

module.exports = { initSocket, dispatchToNearbyVolunteers, notifyTaskTaken, activeVolunteers };