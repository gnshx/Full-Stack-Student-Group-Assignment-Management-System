const db = require('../db');

async function getMe(req, res, next) {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id=$1',
      [req.user.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
}

async function getAllStudents(req, res, next) {
  try {
    const result = await db.query(
      "SELECT id, name, email FROM users WHERE role='student' ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) { next(err); }
}

module.exports = { getMe, getAllStudents };
