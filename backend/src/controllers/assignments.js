const db = require('../db');

// POST /api/assignments
async function createAssignment(req, res, next) {
  try {
    const { title, description, due_date, onedrive_link, target_type = 'all', group_ids = [] } = req.body;
    if (!title?.trim()) return res.status(422).json({ error: 'Title required' });

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const asgn = await client.query(
        `INSERT INTO assignments (title, description, due_date, onedrive_link, created_by, target_type)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [title.trim(), description, due_date || null, onedrive_link, req.user.userId, target_type]
      );
      const assignment = asgn.rows[0];

      if (target_type === 'specific_groups' && group_ids.length > 0) {
        for (const gid of group_ids) {
          await client.query(
            'INSERT INTO assignment_groups (assignment_id, group_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
            [assignment.id, gid]
          );
        }
      }

      await client.query('COMMIT');
      res.status(201).json(assignment);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) { next(err); }
}

// PUT /api/assignments/:id
async function updateAssignment(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { title, description, due_date, onedrive_link, target_type, group_ids = [] } = req.body;

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const asgn = await client.query(
        `UPDATE assignments SET
          title=COALESCE($1,title),
          description=COALESCE($2,description),
          due_date=COALESCE($3,due_date),
          onedrive_link=COALESCE($4,onedrive_link),
          target_type=COALESCE($5,target_type)
         WHERE id=$6 AND created_by=$7 RETURNING *`,
        [title, description, due_date, onedrive_link, target_type, id, req.user.userId]
      );
      if (!asgn.rows.length) return res.status(404).json({ error: 'Assignment not found or not yours' });

      if (target_type === 'specific_groups') {
        await client.query('DELETE FROM assignment_groups WHERE assignment_id=$1', [id]);
        for (const gid of group_ids) {
          await client.query(
            'INSERT INTO assignment_groups (assignment_id, group_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
            [id, gid]
          );
        }
      }

      await client.query('COMMIT');
      res.json(asgn.rows[0]);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) { next(err); }
}

// DELETE /api/assignments/:id
async function deleteAssignment(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const result = await db.query(
      'DELETE FROM assignments WHERE id=$1 AND created_by=$2 RETURNING id',
      [id, req.user.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Assignment not found or not yours' });
    res.json({ message: 'Assignment deleted' });
  } catch (err) { next(err); }
}

// GET /api/assignments — list (filtered by role)
async function listAssignments(req, res, next) {
  try {
    let rows;
    if (req.user.role === 'admin') {
      const result = await db.query(
        `SELECT a.*, u.name AS creator_name,
                COUNT(DISTINCT s.group_id) FILTER (WHERE s.status='confirmed')::int AS confirmed_count,
                CASE WHEN a.target_type='all' THEN (SELECT COUNT(*) FROM groups)::int
                     ELSE (SELECT COUNT(*) FROM assignment_groups ag WHERE ag.assignment_id=a.id)::int
                END AS total_groups
         FROM assignments a
         JOIN users u ON u.id = a.created_by
         LEFT JOIN submissions s ON s.assignment_id = a.id
         GROUP BY a.id, u.name ORDER BY a.created_at DESC`
      );
      rows = result.rows;
    } else {
      // Student: only assignments targeted at their groups or 'all'
      const result = await db.query(
        `SELECT DISTINCT a.*,
                s.status AS submission_status, s.confirmed_at
         FROM assignments a
         JOIN group_members gm ON gm.student_id = $1
         LEFT JOIN assignment_groups ag ON ag.assignment_id = a.id AND ag.group_id = gm.group_id
         LEFT JOIN submissions s ON s.assignment_id = a.id AND s.group_id = gm.group_id
         WHERE a.target_type = 'all' OR ag.assignment_id IS NOT NULL
         ORDER BY a.due_date ASC NULLS LAST, a.created_at DESC`,
        [req.user.userId]
      );
      rows = result.rows;
    }
    res.json(rows);
  } catch (err) { next(err); }
}

// GET /api/assignments/:id
async function getAssignment(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const result = await db.query(
      `SELECT a.*, u.name AS creator_name FROM assignments a
       JOIN users u ON u.id = a.created_by WHERE a.id=$1`,
      [id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Assignment not found' });

    const groups = await db.query(
      `SELECT g.id, g.name FROM groups g
       JOIN assignment_groups ag ON ag.group_id = g.id WHERE ag.assignment_id=$1`,
      [id]
    );

    res.json({ ...result.rows[0], targeted_groups: groups.rows });
  } catch (err) { next(err); }
}

module.exports = { createAssignment, updateAssignment, deleteAssignment, listAssignments, getAssignment };
