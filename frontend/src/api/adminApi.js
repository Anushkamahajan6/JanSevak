// src/api/adminApi.js
const BASE = 'http://localhost:5000/api/admin';

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

export const fetchAdminStats      = ()              => apiFetch('/stats');
export const fetchAdminIssues     = ()              => apiFetch('/issues');
export const fetchAdminVolunteers = ()              => apiFetch('/volunteers');

export const updateIssueStatus    = (id, status)   => apiFetch(`/issues/${id}/status`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status }),
});

export const approveVolunteer = (issueId, volunteerId) => apiFetch(`/issue/${issueId}/approve/${volunteerId}`, {
  method: 'POST',
});

export const approveVolunteerRequest = (volunteerId, issueId, approved) => apiFetch('/approve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ volunteerId, issueId, approved }),
});