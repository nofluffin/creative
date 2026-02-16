const db = require('../db/setup');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Sign in required' });
  }

  const token = authHeader.split(' ')[1];
  const session = db.prepare(`
    SELECT u.id, u.name, u.email, u.picture, u.google_id
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `).get(token);

  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  req.user = session;
  next();
}

module.exports = { requireAuth };
