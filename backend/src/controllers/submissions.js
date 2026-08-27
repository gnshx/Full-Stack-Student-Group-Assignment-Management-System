const db = require('../db');

// POST /api/submissions/:assignmentId/confirm
async function confirmSubmission(req, res, next) {
  try {
    const assignmentId = parseInt(req.params.assignmentId);
    const studentId = req.user.userId;

    // Find the student's group that this assignment targets and check group leader (created_by)
    const groupRes = await db.query(
      `SELECT g.id AS group_id, g.created_by
       FROM group_members gm
       JOIN groups g ON g.id = gm.group_id
       JOIN assignments a ON a.id = $1
       WHERE gm.student_id = $2
         AND (
           a.target_type = 'all'
           OR EXISTS (
             SELECT 1 FROM assignment_groups ag
             WHERE ag.assignment_id = a.id AND ag.group_id = gm.group_id
           )
         )
       LIMIT 1`,
      [assignmentId, studentId]
    );

    if (!groupRes.rows.length) {
      return res.status(403).json({ error: 'No eligible group found for this assignment' });
    }

    const { group_id: groupId, created_by: leaderId } = groupRes.rows[0];

    // Enforce leader-only submission confirmation safeguard
    if (leaderId !== studentId) {
      return res.status(403).json({ error: 'Only the group leader can confirm submissions' });
    }

    const result = await db.query(
      `INSERT INTO submissions (assignment_id, group_id, confirmed_by, status, confirmed_at)
       VALUES ($1,$2,$3,'confirmed',NOW())
       ON CONFLICT (assignment_id, group_id)
       DO UPDATE SET status='confirmed', confirmed_by=$3, confirmed_at=NOW()
       RETURNING *`,
      [assignmentId, groupId, studentId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
}

// GET /api/submissions/group/:groupId
async function getGroupSubmissions(req, res, next) {
  try {
    const groupId = parseInt(req.params.groupId);

    // Verify requester is a member of this group (or admin)
    if (req.user.role !== 'admin') {
      const mem = await db.query(
        'SELECT 1 FROM group_members WHERE group_id=$1 AND student_id=$2',
        [groupId, req.user.userId]
      );
      if (!mem.rows.length) return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.query(
      `SELECT a.id AS assignment_id, a.title, a.due_date,
              s.status, s.confirmed_at, u.name AS confirmed_by_name
       FROM assignments a
       JOIN group_members gm ON gm.group_id = $1
       LEFT JOIN assignment_groups ag ON ag.assignment_id = a.id AND ag.group_id = $1
       LEFT JOIN submissions s ON s.assignment_id = a.id AND s.group_id = $1
       LEFT JOIN users u ON u.id = s.confirmed_by
       WHERE a.target_type = 'all' OR ag.assignment_id IS NOT NULL
       GROUP BY a.id, s.status, s.confirmed_at, u.name
       ORDER BY a.due_date ASC NULLS LAST`,
      [groupId]
    );

    res.json(result.rows);
  } catch (err) { next(err); }
}

module.exports = { confirmSubmission, getGroupSubmissions };
