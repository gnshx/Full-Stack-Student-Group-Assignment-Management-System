# Student, Group & Assignment Management System — JoinEasy

A full-stack, role-based web application where **Students** self-organize into groups, view assignments posted by **Professors (Admins)**, and confirm submissions made externally on OneDrive via a 2-step confirmation UX safeguard. Professors track student & group submission progress through an analytics dashboard.

---

## 🚀 Stack & Technologies

- **Frontend:** React.js (Vite) + Tailwind CSS (Custom Dark Surface Design System)
- **Backend:** Node.js + Express REST API
- **Database:** PostgreSQL 16 (Relational DB with ENUM types & foreign key constraints)
- **Authentication:** JWT (JSON Web Tokens) with role-based middleware access control (RBAC) + Bcrypt password hashing
- **Containerization:** Docker & Docker Compose (Multi-container architecture: Frontend, Backend, PostgreSQL)

---

## 📌 Features

### 📚 Student Portal
- **Authentication & RBAC:** Student registration and login.
- **Group Management:** Create study groups, become implicit creator, invite members via email, and manage membership.
- **Assignment View:** View targeted assignments (All Groups vs. Specific Groups) with due dates and external OneDrive submission links.
- **2-Step Submission Safeguard:** 
  1. Click *"I have submitted"* to review OneDrive link.
  2. Confirm in modal *"Are you sure? This will mark your group's submission as complete"*.
- **Group Submission Tracking:** Real-time completion progress bar relative to assigned work.

### 🎓 Admin / Professor Portal
- **Dashboard:** System-wide metrics (Total Students, Groups, Assignments, Confirmation counts).
- **Assignment CRUD & Flexible Targeting:**
  - Create/Edit/Delete assignments with titles, descriptions, due dates, and OneDrive links.
  - Choose target type: **All Groups** or **Specific Groups** (multi-select).
- **Group Oversight:** View all student-created groups and inspect member lists.
- **Analytics & Tracking:** Per-assignment progress bars and drill-down views showing submission status and timestamps per group.

---

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────┐
│           React + Tailwind              │   (SPA, Role-aware routing & route guards)
│      Student Portal  |  Admin UI        │
└────────────────────┬────────────────────┘
                     │ REST API (JSON) / JWT Bearer Header
                     ▼
┌─────────────────────────────────────────┐
│         Node.js + Express API           │
│  ┌───────────────────────────────────┐  │
│  │ JWT & RBAC Middleware             │  │
│  ├───────────────────────────────────┤  │
│  │ Controllers & Routes              │  │
│  │  - Auth      - Users              │  │
│  │  - Groups    - Assignments        │  │
│  │  - Submissions - Analytics        │  │
│  └───────────────────────────────────┘  │
└────────────────────┬────────────────────┘
                     │ SQL Queries (pg Pool)
                     ▼
┌─────────────────────────────────────────┐
│              PostgreSQL DB              │
└─────────────────────────────────────────┘
```

---

## 🗄️ Database Schema & Data Model (ER)

```sql
users (id, name, email [UNIQUE], password_hash, role ['student','admin'], created_at)
groups (id, name, created_by -> users.id, created_at)
group_members (id, group_id -> groups.id, student_id -> users.id, joined_at) -- UNIQUE(group_id, student_id)
assignments (id, title, description, due_date, onedrive_link, created_by -> users.id, target_type ['all','specific_groups'], created_at)
assignment_groups (id, assignment_id -> assignments.id, group_id -> groups.id) -- UNIQUE(assignment_id, group_id)
submissions (id, assignment_id -> assignments.id, group_id -> groups.id, confirmed_by -> users.id, status ['pending','confirmed'], confirmed_at) -- UNIQUE(assignment_id, group_id)
```

---

## ⚡ Quick Start with Docker Compose

Run the entire application (Frontend + Backend + PostgreSQL) with a single command:

```bash
docker-compose up --build
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **PostgreSQL:** `localhost:5432` (`joineasy_db`)

---

## 🛠️ Local Development Setup (Without Docker)

### 1. PostgreSQL Database
Ensure PostgreSQL is running locally and execute `backend/src/db/schema.sql`.

### 2. Backend Setup
```bash
cd backend
npm install
# Create a .env file with:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/joineasy_db
# JWT_SECRET=your_jwt_secret_key
# PORT=5000
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Access Vite dev server at [http://localhost:5173](http://localhost:5173).

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user with role (`student` / `admin`) |
| POST | `/api/auth/login` | Public | Authenticate user & receive JWT |
| GET | `/api/users/me` | Auth | Get current authenticated user profile |
| GET | `/api/users/students` | Auth | List all registered students |
| GET | `/api/groups/mine` | Student | List groups student belongs to |
| GET | `/api/groups` | Auth | List all groups |
| POST | `/api/groups` | Student | Create new group (creator automatically joins) |
| GET | `/api/groups/:id` | Auth | Get group details & members |
| POST | `/api/groups/:id/members` | Student | Add student to group by email |
| DELETE | `/api/groups/:id/members/:studentId` | Student | Remove student from group (Creator only) |
| GET | `/api/assignments` | Auth | List assignments (filtered by target for students) |
| GET | `/api/assignments/:id` | Auth | Assignment details & targeted groups |
| POST | `/api/assignments` | Admin | Create assignment (all / specific groups) |
| PUT | `/api/assignments/:id` | Admin | Edit assignment |
| DELETE | `/api/assignments/:id` | Admin | Delete assignment |
| POST | `/api/submissions/:assignmentId/confirm` | Student | 2-step confirm assignment for student's group |
| GET | `/api/submissions/group/:groupId` | Auth | Get submission status for a group |
| GET | `/api/analytics/overview` | Admin | Overall admin metrics & recent assignments |
| GET | `/api/analytics/assignment/:id` | Admin | Per-assignment group confirmation stats |

---

## 🔒 Security & Design Considerations

1. **Stateless JWT Authentication & RBAC:** User claims (`userId`, `role`) are encoded in signed JWTs. Role guards enforce permissions on both frontend route transitions and backend API controllers.
2. **Data Integrity Constraints:** Database-level unique constraints (`UNIQUE(assignment_id, group_id)`, `UNIQUE(group_id, student_id)`) ensure transactional consistency and eliminate race conditions.
3. **UX Safeguard (2-Step Confirmation):** Prevents accidental marking of submissions by requiring initial intent check followed by explicit group-level confirmation.
