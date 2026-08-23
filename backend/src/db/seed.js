const bcrypt = require('bcryptjs');
const db = require('./index');

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // 1. Clear existing data
    await db.query('TRUNCATE users, groups, group_members, assignments, assignment_groups, submissions RESTART IDENTITY CASCADE');

    const passHash = await bcrypt.hash('password123', 10);

    // 2. Insert Users (1 Admin / Professor, 3 Students)
    const profRes = await db.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ('Prof. Alan Turing', 'turing@university.edu', $1, 'admin') RETURNING id",
      [passHash]
    );
    const profId = profRes.rows[0].id;

    const s1 = await db.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ('Alice Johnson', 'alice@student.edu', $1, 'student') RETURNING id",
      [passHash]
    );
    const s2 = await db.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ('Bob Smith', 'bob@student.edu', $1, 'student') RETURNING id",
      [passHash]
    );
    const s3 = await db.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ('Charlie Davis', 'charlie@student.edu', $1, 'student') RETURNING id",
      [passHash]
    );

    const aliceId = s1.rows[0].id;
    const bobId = s2.rows[0].id;
    const charlieId = s3.rows[0].id;

    // 3. Insert Groups
    const g1 = await db.query(
      "INSERT INTO groups (name, created_by) VALUES ('Team Alpha - AI Project', $1) RETURNING id",
      [aliceId]
    );
    const g2 = await db.query(
      "INSERT INTO groups (name, created_by) VALUES ('Team Beta - Web Dev', $1) RETURNING id",
      [charlieId]
    );

    const group1Id = g1.rows[0].id;
    const group2Id = g2.rows[0].id;

    // Group 1 Members: Alice, Bob
    await db.query('INSERT INTO group_members (group_id, student_id) VALUES ($1, $2), ($1, $3)', [group1Id, aliceId, bobId]);
    // Group 2 Members: Charlie
    await db.query('INSERT INTO group_members (group_id, student_id) VALUES ($1, $2)', [group2Id, charlieId]);

    // 4. Insert Assignments
    const now = new Date();
    const future1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const future2 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const past = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    const a1 = await db.query(
      `INSERT INTO assignments (title, description, due_date, onedrive_link, created_by, target_type)
       VALUES ('Assignment 1: Distributed Systems Paper', 'Submit your group report on Raft consensus protocol.', $1, 'https://onedrive.live.com/sample_doc_1', $2, 'all') RETURNING id`,
      [past, profId]
    );

    const a2 = await db.query(
      `INSERT INTO assignments (title, description, due_date, onedrive_link, created_by, target_type)
       VALUES ('Assignment 2: Full-Stack System Architecture', 'Design HLD and ER diagrams for student group portal.', $1, 'https://onedrive.live.com/sample_doc_2', $2, 'all') RETURNING id`,
      [future1, profId]
    );

    const a3 = await db.query(
      `INSERT INTO assignments (title, description, due_date, onedrive_link, created_by, target_type)
       VALUES ('Assignment 3: Specific Group Milestone', 'Milestone for Team Alpha AI research.', $1, 'https://onedrive.live.com/sample_doc_3', $2, 'specific_groups') RETURNING id`,
      [future2, profId]
    );

    const asgn1Id = a1.rows[0].id;
    const asgn3Id = a3.rows[0].id;

    // Target Assignment 3 to Group 1
    await db.query('INSERT INTO assignment_groups (assignment_id, group_id) VALUES ($1, $2)', [asgn3Id, group1Id]);

    // 5. Insert Submissions
    // Group 1 confirmed Assignment 1
    await db.query(
      "INSERT INTO submissions (assignment_id, group_id, confirmed_by, status, confirmed_at) VALUES ($1, $2, $3, 'confirmed', NOW())",
      [asgn1Id, group1Id, aliceId]
    );

    console.log('✅ Seed successful!');
    console.log('----------------------------------------------------');
    console.log('Admin login:    turing@university.edu / password123');
    console.log('Student login:  alice@student.edu  / password123');
    console.log('Student login:  bob@student.edu    / password123');
    console.log('Student login:  charlie@student.edu / password123');
    console.log('----------------------------------------------------');

  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    process.exit(0);
  }
}

seed();
