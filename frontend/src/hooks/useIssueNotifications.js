import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

/**
 * Hook for listening to real-time issue notifications via Socket.io
 * Automatically plays a sound and shows a toast when new issues are created
 */
export const useIssueNotifications = (onNewIssue) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to Socket.io server
    const socketInstance = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketInstance.on('connect', () => {
      console.log('✅ Connected to notifications');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from notifications');
      setIsConnected(false);
    });

    socketInstance.on('new_issue_created', (data) => {
      console.log('🔔 New issue notification received:', data);
      
      // Play notification sound
      playNotificationSound();
      
      // Call the callback with the new issue data
      if (onNewIssue) {
        onNewIssue(data);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [onNewIssue]);

  return { socket, isConnected };
};

/**
 * Play a notification sound
 * Uses Web Audio API to generate an emergency alert-style notification
 * This provides audio feedback when a new issue is reported
 */
export const playNotificationSound = () => {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a pulsing alert tone with frequency sweep
    const now = audioContext.currentTime;
    
    // Main alert tone with sawtooth wave (louder than sine)
    {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.type = 'sawtooth'; // Sawtooth = very loud, rich harmonics
      
      // Frequency sweep: 1200 Hz → 400 Hz (create alarm effect)
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.4);
      
      // Volume envelope
      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      
      osc.start(now);
      osc.stop(now + 0.4);
    }
    
    // Secondary pulse for extra emphasis
    {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      
      osc2.type = 'triangle'; // Triangle = bright and clear
      osc2.frequency.value = 2000;
      
      // Short sharp pulse at the end
      gain2.gain.setValueAtTime(0, now + 0.35);
      gain2.gain.setValueAtTime(0.8, now + 0.35);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      
      osc2.start(now + 0.35);
      osc2.stop(now + 0.6);
    }
    
    console.log('🔊 Alert tone played!');
  } catch (err) {
    console.error('Error playing notification sound:', err);
  }
};
