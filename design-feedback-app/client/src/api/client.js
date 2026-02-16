const BASE = '/api';

function getAuthToken() {
  return localStorage.getItem('auth_token');
}

async function request(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// Auth
export const getAuthConfig = () =>
  fetch(`${BASE}/auth/config`).then((r) => r.json());

export const googleSignIn = (credential) =>
  fetch(`${BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  }).then(async (res) => {
    if (!res.ok) throw new Error('Sign in failed');
    return res.json();
  });

export const getMe = (token) =>
  fetch(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(async (res) => {
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  });

export const logout = (token) =>
  fetch(`${BASE}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

// Projects
export const createProject = (data) =>
  request('/projects', { method: 'POST', body: JSON.stringify(data) });

export const getProjects = () => request('/projects');

export const getProject = (id) => request(`/projects/${id}`);

export const deleteProject = (id) =>
  request(`/projects/${id}`, { method: 'DELETE' });

export const getReview = (shareToken) =>
  request(`/review/${shareToken}`);

// Assets
export const uploadAsset = (projectId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return fetch(`${BASE}/projects/${projectId}/assets`, {
    method: 'POST',
    body: formData,
  }).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Upload failed');
    }
    return res.json();
  });
};

export const deleteAsset = (id) =>
  request(`/assets/${id}`, { method: 'DELETE' });

// Comments
export const getComments = (assetId) =>
  request(`/assets/${assetId}/comments`);

export const createComment = (assetId, data) =>
  request(`/assets/${assetId}/comments`, { method: 'POST', body: JSON.stringify(data) });

export const resolveComment = (id) =>
  request(`/comments/${id}/resolve`, { method: 'PATCH' });

export const deleteComment = (id) =>
  request(`/comments/${id}`, { method: 'DELETE' });

// Replies
export const getReplies = (commentId) =>
  request(`/comments/${commentId}/replies`);

export const createReply = (commentId, data) =>
  request(`/comments/${commentId}/replies`, { method: 'POST', body: JSON.stringify(data) });
