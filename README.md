# Student, Group & Assignment Management System — JoinEasy

A full-stack, role-based web application where **Students** self-organize into groups, view assignments posted by **Professors (Admins)**, and confirm submissions made externally on OneDrive via a 2-step confirmation UX safeguard. Professors track student & group submission progress through an analytics dashboard.

---

## 🌐 Live Production Deployment

- **Live Web Application:** [https://full-stack-student-group-assignment.onrender.com/](https://full-stack-student-group-assignment.onrender.com/)
- **Demo Admin / Professor Login:** `turing@university.edu` / `password123`
- **Demo Student Login:** `alice@student.edu` / `password123`

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

### Relational Entity-Relationship Diagram (ERD)

![JoinEasy Entity-Relationship Diagram](docs/images/er_diagram.png)

```mermaid
erDiagram
    users ||--o{ groups : "creates (leader)"
    users ||--o{ group_members : "joins"
    users ||--o{ assignments : "creates (admin)"
    users ||--o{ submissions : "confirms"
    
    groups ||--o{ group_members : "has members"
    groups ||--o{ assignment_groups : "targeted by"
    groups ||--o{ submissions : "submits"

    assignments ||--o{ assignment_groups : "targets"
    assignments ||--o{ submissions : "has"

    users {
        int id PK
        string name
        string email UNIQUE
        string password_hash
        enum role "student | admin"
        timestamp created_at
    }

    groups {
        int id PK
        string name
        int created_by FK "users.id (Leader)"
        timestamp created_at
    }

    group_members {
        int id PK
        int group_id FK
        int student_id FK
        timestamp joined_at
    }

    assignments {
        int id PK
        string title
        string description
        timestamp due_date
        string onedrive_link
        int created_by FK
        enum target_type "all | specific_groups"
        timestamp created_at
    }

    assignment_groups {
        int id PK
        int assignment_id FK
        int group_id FK
    }

    submissions {
        int id PK
        int assignment_id FK
        int group_id FK
        int confirmed_by FK "users.id (Leader)"
        enum status "pending | confirmed"
        timestamp confirmed_at
    }
```

---

## 📸 Screenshots & UI Showcase

![JoinEasy Platform Preview](docs/images/dashboard_preview.png)

- **Student Workspace & Group Leader Safeguard:** Responsive dashboard where group leaders trigger the 2-step confirmation sequence while team members view real-time status.
- **Professor Analytics Dashboard:** Completion overview chart rendering group submission rates per assignment alongside filterable status controls.

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
| POST | `/api/submissions/:assignmentId/confirm` | Student | 2-step confirm assignment (Leader-only check) |
| GET | `/api/submissions/group/:groupId` | Auth | Get submission status for a group |
| GET | `/api/analytics/overview` | Admin | Overall admin metrics & recent assignments |
| GET | `/api/analytics/assignment/:id` | Admin | Per-assignment group confirmation stats |

---

## 🎨 Round 2 Enhancements & Architectural Rationale

### 1. Leader-Only 2-Step Confirmation Safeguard (Section 5.1)
- **Problem:** Previously, any group member could trigger confirmation for a group's assignment.
- **Solution:** Enforced strict group leader authorization on backend `POST /api/submissions/:assignmentId/confirm` by checking `groups.created_by === req.user.userId`.
- **UI UX:** Student assignment cards dynamically inspect leader status. Group leaders see the active **"✓ I have submitted"** button leading to the 2-step confirm modal sequence. Non-leader members see **"🔒 Waiting for group leader"** status pills. In the Group Members list, the leader is highlighted with a **"👑 Leader"** badge.

#### Sequence Diagram: Group Leader Confirmation Safeguard
```
Student (Leader)         Frontend App               Backend API              Database (PostgreSQL)
      │                        │                         │                            │
      │── Click "I've          │                         │                            │
      │   submitted" ─────────>│                         │                            │
      │                        │── Open Step 1 Modal ──>│                            │
      │── Confirm Intent ─────>│                         │                            │
      │                        │── Open Step 2 Modal ──>│                            │
      │── Final Confirmation ─>│                         │                            │
      │                        │── POST /confirm ───────>│                            │
      │                        │                         │── Query group & creator ──>│
      │                        │                         │<── Returns leaderId ───────│
      │                        │                         │── If leaderId != user: 403 │
      │                        │                         │── Else: UPSERT submission ─>│
      │                        │<── 201 Created ─────────│                            │
      │<── UI State Updates ───│                         │                            │
```

### 2. Status Filtering on Admin Portals (Section 5.4)
- Added live status filter pills on **Admin Assignments** and **Admin Analytics** pages.
- Professors can filter assignments by:
  - **All Assignments**
  - **Fully Confirmed (100% submission rate)**
  - **Pending Progress (Incomplete group submissions)**
- Updates both list views and the custom analytics bar chart seamlessly.

### 3. Domain Design Rationale (Section 5.2 & 5.3)

#### A. Groups-Instead-of-Courses Rationale
- **Design Decision:** The system adopts **Groups** as the primary organizing unit rather than introducing a separate `courses` catalog table.
- **Rationale:** JoinEasy focuses on collaborative, team-based submission tracking for shared OneDrive folders. Using groups as the atomic entity minimizes schema complexity while providing targeted assignment distribution (`target_type: all | specific_groups`).

#### B. Group-Level (Not Individual) Submissions Rationale
- **Design Decision:** All assignments are strictly group-scoped.
- **Rationale:** External submission happens on shared group OneDrive folders. Group-scoped assignment targeting aligns perfectly with team project deliverables.

#### C. Group-Level (Not Per-Student) Confirmation Tracking Rationale
- **Design Decision:** Confirmation status is stored as a single `submissions` row per `(assignment_id, group_id)`.
- **Rationale:** Group submission is an atomic action on behalf of the whole team. By recording `confirmed_by -> users.id` (the group leader) on the submission record, the system avoids redundant individual student status checks while ensuring single-point leader accountability.

---

## 🔒 Security & Design Considerations

1. **Stateless JWT Authentication & RBAC:** User claims (`userId`, `role`) are encoded in signed JWTs. Role guards enforce permissions on both frontend route transitions and backend API controllers.
2. **Data Integrity Constraints:** Database-level unique constraints (`UNIQUE(assignment_id, group_id)`, `UNIQUE(group_id, student_id)`) ensure transactional consistency and eliminate race conditions.
3. **UX Safeguard (2-Step Confirmation):** Prevents accidental marking of submissions by requiring initial intent check followed by explicit group-level confirmation by designated group leaders.


