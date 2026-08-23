-- ============================================================
-- JoinEasy DB Schema
-- ============================================================

CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE target_type AS ENUM ('all', 'specific_groups');
CREATE TYPE submission_status AS ENUM ('pending', 'confirmed');

-- Users
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'student',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Groups
CREATE TABLE IF NOT EXISTS groups (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  created_by  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Group Members
CREATE TABLE IF NOT EXISTS group_members (
  id          SERIAL PRIMARY KEY,
  group_id    INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  student_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (group_id, student_id)
);

-- Assignments
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

-- Assignment <-> Group targeting
CREATE TABLE IF NOT EXISTS assignment_groups (
  id             SERIAL PRIMARY KEY,
  assignment_id  INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  group_id       INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  UNIQUE (assignment_id, group_id)
);

-- Submissions
CREATE TABLE IF NOT EXISTS submissions (
  id             SERIAL PRIMARY KEY,
  assignment_id  INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  group_id       INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  confirmed_by   INTEGER REFERENCES users(id),
  status         submission_status NOT NULL DEFAULT 'pending',
  confirmed_at   TIMESTAMPTZ,
  UNIQUE (assignment_id, group_id)
);
