const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const sizeOf = require('image-size');
const db = require('../db/setup');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uuidv4() + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only .png, .jpg, .jpeg, .webp files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Upload asset to project
router.post('/projects/:id/assets', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) {
    fs.unlinkSync(req.file.path);
    return res.status(404).json({ error: 'Project not found' });
  }

  let width = null;
  let height = null;
  try {
    const dimensions = sizeOf(req.file.path);
    width = dimensions.width;
    height = dimensions.height;
  } catch (e) {
    // dimensions optional
  }

  const id = uuidv4();
  db.prepare(
    'INSERT INTO assets (id, project_id, filename, original_name, file_path, width, height) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, req.params.id, req.file.filename, req.file.originalname, req.file.path, width, height);

  const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
  res.status(201).json(asset);
});

// Get single asset
router.get('/assets/:id', (req, res) => {
  const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  res.json(asset);
});

// Delete asset
router.delete('/assets/:id', (req, res) => {
  const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });

  try { fs.unlinkSync(asset.file_path); } catch (e) { /* file may already be gone */ }
  db.prepare('DELETE FROM assets WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
