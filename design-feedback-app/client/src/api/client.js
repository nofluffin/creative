const BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

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
