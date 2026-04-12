// src/api/volunteerApi.js
const BASE = 'http://localhost:5000/api/volunteer';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const updateVolunteerStatus = (volunteerId, isActive) => apiFetch('/active', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ volunteerId, isActive }),
});

export const respondToIssue = (volunteerId, issueId) => apiFetch('/respond', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ volunteerId, issueId }),
});

export const expressInterestInIssue = (volunteerId, issueId) => apiFetch('/express-interest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ volunteerId, issueId }),
});
