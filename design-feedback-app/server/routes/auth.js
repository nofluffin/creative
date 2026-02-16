const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/setup');

const router = express.Router();

// GET /auth/config - Returns Google Client ID for the frontend
router.get('/config', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  res.json({ clientId });
});

// POST /auth/google - Sign in with Google credential
router.post('/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ error: 'Missing credential' });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ error: 'Google OAuth not configured' });
  }

  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Upsert user
    const existingUser = db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
    let userId;

    if (existingUser) {
      userId = existingUser.id;
      db.prepare('UPDATE users SET email = ?, name = ?, picture = ? WHERE id = ?')
        .run(email, name, picture, userId);
    } else {
      userId = uuidv4();
      db.prepare('INSERT INTO users (id, google_id, email, name, picture) VALUES (?, ?, ?, ?, ?)')
        .run(userId, googleId, email, name, picture);
    }

    // Create session (expires in 7 days)
    const token = uuidv4();
    db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, datetime('now', '+7 days'))")
      .run(token, userId);

    res.json({
      token,
      user: { id: userId, name, email, picture },
    });
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(401).json({ error: 'Invalid Google credential' });
  }
});

// GET /auth/me - Get current user from session
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const token = authHeader.split(' ')[1];
  const user = db.prepare(`
    SELECT u.id, u.name, u.email, u.picture
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `).get(token);

  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  res.json({ user });
});

// POST /auth/logout - Sign out
router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  res.json({ ok: true });
});

module.exports = router;
