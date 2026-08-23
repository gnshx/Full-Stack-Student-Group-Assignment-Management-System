const db = require('../db');

// GET /api/analytics/assignment/:id
async function assignmentStats(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const asgn = await db.query('SELECT * FROM assignments WHERE id=$1', [id]);
    if (!asgn.rows.length) return res.status(404).json({ error: 'Assignment not found' });
    const assignment = asgn.rows[0];

    const totalRes = await db.query(
      assignment.target_type === 'all'
        ? 'SELECT COUNT(*)::int AS count FROM groups'
        : 'SELECT COUNT(*)::int AS count FROM assignment_groups WHERE assignment_id=$1',
      assignment.target_type === 'all' ? [] : [id]
    );

    const confirmedRes = await db.query(
      `SELECT COUNT(*)::int AS count FROM submissions
       WHERE assignment_id=$1 AND status='confirmed'`,
      [id]
    );

    // Per-group breakdown
    const groupsRes = await db.query(
      `SELECT g.id, g.name,
              COALESCE(s.status, 'pending') AS status,
              s.confirmed_at,
              u.name AS confirmed_by
       FROM groups g
       ${assignment.target_type === 'specific_groups'
         ? 'JOIN assignment_groups ag ON ag.group_id=g.id AND ag.assignment_id=' + id
         : ''}
       LEFT JOIN submissions s ON s.group_id=g.id AND s.assignment_id=${id}
       LEFT JOIN users u ON u.id=s.confirmed_by
       ORDER BY g.name`
    );

    res.json({
      assignment,
      total_groups: totalRes.rows[0].count,
      confirmed_groups: confirmedRes.rows[0].count,
      groups: groupsRes.rows,
    });
  } catch (err) { next(err); }
}

// GET /api/analytics/overview
async function overview(req, res, next) {
  try {
    const [
      totalStudents,
      totalGroups,
      totalAssignments,
      totalConfirmed,
      recentAssignments,
    ] = await Promise.all([
      db.query("SELECT COUNT(*)::int AS count FROM users WHERE role='student'"),
      db.query('SELECT COUNT(*)::int AS count FROM groups'),
      db.query('SELECT COUNT(*)::int AS count FROM assignments'),
      db.query("SELECT COUNT(*)::int AS count FROM submissions WHERE status='confirmed'"),
      db.query(
        `SELECT a.id, a.title, a.due_date,
                COUNT(DISTINCT s.group_id) FILTER (WHERE s.status='confirmed')::int AS confirmed,
                CASE WHEN a.target_type='all' THEN (SELECT COUNT(*)::int FROM groups)
                     ELSE (SELECT COUNT(*)::int FROM assignment_groups ag WHERE ag.assignment_id=a.id)
                END AS total
         FROM assignments a
         LEFT JOIN submissions s ON s.assignment_id=a.id
         GROUP BY a.id ORDER BY a.created_at DESC LIMIT 5`
      ),
    ]);

    res.json({
      totalStudents: totalStudents.rows[0].count,
      totalGroups: totalGroups.rows[0].count,
      totalAssignments: totalAssignments.rows[0].count,
      totalConfirmed: totalConfirmed.rows[0].count,
      recentAssignments: recentAssignments.rows,
    });
  } catch (err) { next(err); }
}

module.exports = { assignmentStats, overview };
