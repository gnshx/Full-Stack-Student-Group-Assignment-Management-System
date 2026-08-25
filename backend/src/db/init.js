const db = require('./index');
const bcrypt = require('bcryptjs');

async function initDB() {
  try {
    console.log('🔄 Checking database tables...');

    // 1. Create Enums if not exist
    await db.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('student', 'admin');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE target_type AS ENUM ('all', 'specific_groups');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE submission_status AS ENUM ('pending', 'confirmed');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // 2. Create Tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        email       VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role        user_role NOT NULL DEFAULT 'student',
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS groups (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        created_by  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS group_members (
        id          SERIAL PRIMARY KEY,
        group_id    INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        student_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at   TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (group_id, student_id)
      );

      CREATE TABLE IF NOT EXISTS assignments (
        id             SERIAL PRIMARY KEY,
        title          VARCHAR(255) NOT NULL,
        description    TEXT,
        due_date       TIMESTAMPTZ,
        onedrive_link  TEXT,
        created_by     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        target_type    target_type NOT NULL DEFAULT 'all',
        created_at     TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS assignment_groups (
        id             SERIAL PRIMARY KEY,
        assignment_id  INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
        group_id       INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        UNIQUE (assignment_id, group_id)
      );

      CREATE TABLE IF NOT EXISTS submissions (
        id             SERIAL PRIMARY KEY,
        assignment_id  INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
        group_id       INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        confirmed_by   INTEGER REFERENCES users(id),
        status         submission_status NOT NULL DEFAULT 'pending',
        confirmed_at   TIMESTAMPTZ,
        UNIQUE (assignment_id, group_id)
      );
    `);

    console.log('✅ Database schema verified.');

    // 3. Auto-seed if users table is empty
    const userCount = await db.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count, 10) === 0) {
      console.log('🌱 Database is empty. Seeding initial demo data...');
      const hash = await bcrypt.hash('password123', 10);

      // Create Admin
      const prof = await db.query(
        "INSERT INTO users (name, email, password_hash, role) VALUES ('Prof. Alan Turing', 'turing@university.edu', $1, 'admin') RETURNING id",
        [hash]
      );
      const profId = prof.rows[0].id;

      // Create Students
      const alice = await db.query("INSERT INTO users (name, email, password_hash, role) VALUES ('Alice Johnson', 'alice@student.edu', $1, 'student') RETURNING id", [hash]);
      const bob = await db.query("INSERT INTO users (name, email, password_hash, role) VALUES ('Bob Smith', 'bob@student.edu', $1, 'student') RETURNING id", [hash]);
      const charlie = await db.query("INSERT INTO users (name, email, password_hash, role) VALUES ('Charlie Brown', 'charlie@student.edu', $1, 'student') RETURNING id", [hash]);

      const aliceId = alice.rows[0].id;
      const bobId = bob.rows[0].id;
      const charlieId = charlie.rows[0].id;

      // Create Groups
      const g1 = await db.query("INSERT INTO groups (name, created_by) VALUES ('Team Alpha - AI Research', $1) RETURNING id", [aliceId]);
      const g2 = await db.query("INSERT INTO groups (name, created_by) VALUES ('Team Beta - Web Dev', $1) RETURNING id", [charlieId]);

      const group1Id = g1.rows[0].id;
      const group2Id = g2.rows[0].id;

      await db.query('INSERT INTO group_members (group_id, student_id) VALUES ($1, $2), ($1, $3)', [group1Id, aliceId, bobId]);
      await db.query('INSERT INTO group_members (group_id, student_id) VALUES ($1, $2)', [group2Id, charlieId]);

      // Create Assignments
      const pastDate = new Date(Date.now() - 2 * 86400000);
      const future1 = new Date(Date.now() + 7 * 86400000);
      const future2 = new Date(Date.now() + 14 * 86400000);

      const a1 = await db.query(
        "INSERT INTO assignments (title, description, due_date, onedrive_link, created_by, target_type) VALUES ('Assignment 1: Distributed Systems Paper', 'Submit report on Raft consensus.', $1, 'https://onedrive.live.com/sample_doc_1', $2, 'all') RETURNING id",
        [pastDate, profId]
      );
      await db.query(
        "INSERT INTO assignments (title, description, due_date, onedrive_link, created_by, target_type) VALUES ('Assignment 2: Full-Stack System Architecture', 'Design HLD and ER diagrams.', $1, 'https://onedrive.live.com/sample_doc_2', $2, 'all') RETURNING id",
        [future1, profId]
      );
      const a3 = await db.query(
        "INSERT INTO assignments (title, description, due_date, onedrive_link, created_by, target_type) VALUES ('Assignment 3: Specific Group Milestone', 'Milestone for Team Alpha.', $1, 'https://onedrive.live.com/sample_doc_3', $2, 'specific_groups') RETURNING id",
        [future2, profId]
      );

      await db.query('INSERT INTO assignment_groups (assignment_id, group_id) VALUES ($1, $2)', [a3.rows[0].id, group1Id]);
      await db.query("INSERT INTO submissions (assignment_id, group_id, confirmed_by, status, confirmed_at) VALUES ($1, $2, $3, 'confirmed', NOW())", [a1.rows[0].id, group1Id, aliceId]);

      console.log('🎉 Seed complete! Turing and Student accounts ready.');
    }
  } catch (err) {
    console.error('❌ DB init/seed error:', err.message);
  }
}

module.exports = initDB;
