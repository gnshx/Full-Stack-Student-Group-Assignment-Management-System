const db = require('../db');

// POST /api/groups — student creates a group
async function createGroup(req, res, next) {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(422).json({ error: 'Group name required' });

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const grp = await client.query(
        'INSERT INTO groups (name, created_by) VALUES ($1,$2) RETURNING *',
        [name.trim(), req.user.userId]
      );
      // Creator auto-joins
      await client.query(
        'INSERT INTO group_members (group_id, student_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [grp.rows[0].id, req.user.userId]
      );
      await client.query('COMMIT');
      res.status(201).json(grp.rows[0]);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) { next(err); }
}

// POST /api/groups/:id/members — add member by email
async function addMember(req, res, next) {
  try {
    const groupId = parseInt(req.params.id);
    const { email } = req.body;
    if (!email) return res.status(422).json({ error: 'Email required' });

    // Verify the group exists and the requester is a member
    const membership = await db.query(
      'SELECT 1 FROM group_members WHERE group_id=$1 AND student_id=$2',
      [groupId, req.user.userId]
    );
    if (!membership.rows.length) return res.status(403).json({ error: 'You are not a member of this group' });

    const userRes = await db.query(
      "SELECT id FROM users WHERE email=$1 AND role='student'",
      [email.toLowerCase()]
    );
    if (!userRes.rows.length) return res.status(404).json({ error: 'Student with that email not found' });

    const studentId = userRes.rows[0].id;
    try {
      await db.query(
        'INSERT INTO group_members (group_id, student_id) VALUES ($1,$2)',
        [groupId, studentId]
      );
    } catch (e) {
      if (e.code === '23505') return res.status(409).json({ error: 'Student already in group' });
      throw e;
    }

    res.status(201).json({ message: 'Member added' });
  } catch (err) { next(err); }
}

// GET /api/groups/mine — groups the logged-in student belongs to
async function getMyGroups(req, res, next) {
  try {
    const result = await db.query(
      `SELECT g.id, g.name, g.created_at, g.created_by,
              COUNT(gm2.student_id)::int AS member_count
       FROM groups g
       JOIN group_members gm ON gm.group_id = g.id AND gm.student_id = $1
       JOIN group_members gm2 ON gm2.group_id = g.id
       GROUP BY g.id ORDER BY g.created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
}

// GET /api/groups — all groups (admin)
async function getAllGroups(req, res, next) {
  try {
    const result = await db.query(
      `SELECT g.id, g.name, g.created_at,
              u.name AS creator_name,
              COUNT(gm.student_id)::int AS member_count
       FROM groups g
       JOIN users u ON u.id = g.created_by
       LEFT JOIN group_members gm ON gm.group_id = g.id
       GROUP BY g.id, u.name ORDER BY g.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) { next(err); }
}

// GET /api/groups/:id — group detail + members
async function getGroup(req, res, next) {
  try {
    const groupId = parseInt(req.params.id);
    const grpRes = await db.query(
      `SELECT g.*, u.name AS creator_name FROM groups g
       JOIN users u ON u.id = g.created_by WHERE g.id=$1`,
      [groupId]
    );
    if (!grpRes.rows.length) return res.status(404).json({ error: 'Group not found' });

    const membersRes = await db.query(
      `SELECT u.id, u.name, u.email, gm.joined_at FROM users u
       JOIN group_members gm ON gm.student_id = u.id
       WHERE gm.group_id=$1 ORDER BY gm.joined_at`,
      [groupId]
    );

    res.json({ ...grpRes.rows[0], members: membersRes.rows });
  } catch (err) { next(err); }
}

// DELETE /api/groups/:id/members/:studentId — remove member (group creator only)
async function removeMember(req, res, next) {
  try {
    const groupId = parseInt(req.params.id);
    const studentId = parseInt(req.params.studentId);

    const grp = await db.query('SELECT created_by FROM groups WHERE id=$1', [groupId]);
    if (!grp.rows.length) return res.status(404).json({ error: 'Group not found' });
    if (grp.rows[0].created_by !== req.user.userId) {
      return res.status(403).json({ error: 'Only the group creator can remove members' });
    }
    if (studentId === req.user.userId) {
      return res.status(400).json({ error: 'Creator cannot remove themselves' });
    }

    await db.query('DELETE FROM group_members WHERE group_id=$1 AND student_id=$2', [groupId, studentId]);
    res.json({ message: 'Member removed' });
  } catch (err) { next(err); }
}

module.exports = { createGroup, addMember, getMyGroups, getAllGroups, getGroup, removeMember };
