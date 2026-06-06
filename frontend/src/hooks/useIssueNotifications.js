import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

let sharedSocket = null;

function getSocket() {
  if (!sharedSocket) {
    sharedSocket = io(import.meta.env.VITE_API_BASE_URL || '${import.meta.env.VITE_API_BASE_URL}', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    });
  }
  return sharedSocket;
}

export const useIssueNotifications = ({ onNewIssue, onTaskAssigned, onStatusUpdated, volunteer, isActive } = {}) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setIsConnected(true);
      // Register volunteer as active with location if available
      if (volunteer?._id && isActive) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            socket.emit('volunteer:go_active', {
              userId: volunteer._id,
              name: volunteer.name,
              coordinates: [pos.coords.longitude, pos.coords.latitude],
            });
          },
          () => {
            // No location — still register but without coords
            socket.emit('volunteer:go_active', {
              userId: volunteer._id,
              name: volunteer.name,
              coordinates: [77.5092, 28.4621], // fallback
            });
          }
        );
      }
    };

    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    if (socket.connected) setIsConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [volunteer, isActive]);

  // new_issue_created
  useEffect(() => {
    if (!onNewIssue) return;
    const socket = getSocket();
    const handler = (data) => { playNotificationSound(); onNewIssue(data); };
    socket.on('new_issue_created', handler);
    return () => socket.off('new_issue_created', handler);
  }, [onNewIssue]);

  // task_assigned — volunteer gets notified admin approved them
  useEffect(() => {
    if (!onTaskAssigned || !volunteer?._id) return;
    const socket = getSocket();
    const handler = (data) => {
      if (data.volunteerId?.toString() === volunteer._id?.toString()) {
        playNotificationSound();
        onTaskAssigned(data);
      }
    };
    socket.on('task_assigned', handler);
    return () => socket.off('task_assigned', handler);
  }, [onTaskAssigned, volunteer]);

  // issue_status_updated — refresh heatmap / task list
  useEffect(() => {
    if (!onStatusUpdated) return;
    const socket = getSocket();
    socket.on('issue_status_updated', onStatusUpdated);
    return () => socket.off('issue_status_updated', onStatusUpdated);
  }, [onStatusUpdated]);

  return { isConnected };
};

export const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.3);
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  } catch (_) {}
};