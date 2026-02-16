const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/setup');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Create comment on asset (requires auth)
router.post('/assets/:asset_id/comments', requireAuth, (req, res) => {
  const { pin_x, pin_y, content } = req.body;
  if (pin_x == null || pin_y == null || !content) {
    return res.status(400).json({ error: 'pin_x, pin_y, and content are required' });
  }

  const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.asset_id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });

  const id = uuidv4();
  db.prepare(
    'INSERT INTO comments (id, asset_id, author_name, content, pin_x, pin_y, user_id, author_avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, req.params.asset_id, req.user.name, content, pin_x, pin_y, req.user.id, req.user.picture);

  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(id);
  res.status(201).json(comment);
});

// Get comments for asset
router.get('/assets/:asset_id/comments', (req, res) => {
  const comments = db.prepare(
    'SELECT * FROM comments WHERE asset_id = ? ORDER BY created_at ASC'
  ).all(req.params.asset_id);

  // Attach replies to each comment
  const getReplies = db.prepare('SELECT * FROM replies WHERE comment_id = ? ORDER BY created_at ASC');
  const result = comments.map((c, index) => ({
    ...c,
    pin_number: index + 1,
    replies: getReplies.all(c.id),
  }));

  res.json(result);
});

// Mark comment as resolved
router.patch('/comments/:id/resolve', (req, res) => {
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });

  const newValue = comment.is_resolved ? 0 : 1;
  db.prepare('UPDATE comments SET is_resolved = ? WHERE id = ?').run(newValue, req.params.id);

  const updated = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// Delete comment
router.delete('/comments/:id', (req, res) => {
  const result = db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Comment not found' });
  res.json({ success: true });
});

// Create reply (requires auth)
router.post('/comments/:comment_id/replies', requireAuth, (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'content is required' });
  }

  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.comment_id);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });

  const id = uuidv4();
  db.prepare(
    'INSERT INTO replies (id, comment_id, author_name, content, user_id, author_avatar) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, req.params.comment_id, req.user.name, content, req.user.id, req.user.picture);

  const reply = db.prepare('SELECT * FROM replies WHERE id = ?').get(id);
  res.status(201).json(reply);
});

// Get replies for comment
router.get('/comments/:comment_id/replies', (req, res) => {
  const replies = db.prepare(
    'SELECT * FROM replies WHERE comment_id = ? ORDER BY created_at ASC'
  ).all(req.params.comment_id);
  res.json(replies);
});

module.exports = router;
