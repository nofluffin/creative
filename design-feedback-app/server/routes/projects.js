const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/setup');

const router = express.Router();

// Create project
router.post('/', (req, res) => {
  const { name, client_name } = req.body;
  if (!name || !client_name) {
    return res.status(400).json({ error: 'name and client_name are required' });
  }
  const id = uuidv4();
  const share_token = uuidv4();
  db.prepare(
    'INSERT INTO projects (id, name, client_name, share_token) VALUES (?, ?, ?, ?)'
  ).run(id, name, client_name, share_token);

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  res.status(201).json(project);
});

// List all projects
router.get('/', (req, res) => {
  const projects = db.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM assets WHERE project_id = p.id) AS asset_count,
      (SELECT COUNT(*) FROM comments c JOIN assets a ON c.asset_id = a.id WHERE a.project_id = p.id) AS comment_count,
      (SELECT a.filename FROM assets a WHERE a.project_id = p.id ORDER BY a.uploaded_at DESC LIMIT 1) AS thumbnail
    FROM projects p
    ORDER BY p.created_at DESC
  `).all();
  res.json(projects);
});

// Get single project
router.get('/:id', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const assets = db.prepare('SELECT * FROM assets WHERE project_id = ? ORDER BY uploaded_at DESC').all(req.params.id);
  res.json({ ...project, assets });
});

// Get project by share token (client review)
router.get('/review/:share_token', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE share_token = ?').get(req.params.share_token);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const assets = db.prepare('SELECT * FROM assets WHERE project_id = ? ORDER BY uploaded_at DESC').all(project.id);
  res.json({ ...project, assets });
});

// Delete project
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Project not found' });
  res.json({ success: true });
});

module.exports = router;
