const express = require('express');
const cors = require('cors');
const path = require('path');

const projectsRouter = require('./routes/projects');
const assetsRouter = require('./routes/assets');
const commentsRouter = require('./routes/comments');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/projects', projectsRouter);
// Asset routes are mounted at /api so the full paths work:
// POST /api/projects/:id/assets, GET /api/assets/:id, DELETE /api/assets/:id
app.use('/api', assetsRouter);
// Comment routes at /api:
// POST /api/assets/:asset_id/comments, GET /api/assets/:asset_id/comments
// PATCH /api/comments/:id/resolve, DELETE /api/comments/:id
// POST /api/comments/:comment_id/replies, GET /api/comments/:comment_id/replies
app.use('/api', commentsRouter);

// Review route needs special mounting since it's under /api/review
app.get('/api/review/:share_token', (req, res) => {
  const db = require('./db/setup');
  const project = db.prepare('SELECT * FROM projects WHERE share_token = ?').get(req.params.share_token);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const assets = db.prepare('SELECT * FROM assets WHERE project_id = ? ORDER BY uploaded_at DESC').all(project.id);
  res.json({ ...project, assets });
});

// In production, serve the built React frontend
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
// All non-API routes fall through to the React app (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
