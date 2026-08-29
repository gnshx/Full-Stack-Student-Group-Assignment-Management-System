<div align="center">

# 🎓 JoinEasy — Enterprise Academic Assignment Management System

**An Enterprise-Grade, Full-Stack Academic Portal for Collaborative Student Group Management, Assignment Distribution, and Submission Verification.**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg?style=for-the-badge&logo=github-actions)](https://github.com/gnshx/Full-Stack-Student-Group-Assignment-Management-System)
[![Node.js](https://img.shields.io/badge/Node.js-v20.x-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18.x-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16.x-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.x-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

[Live Application Demo](https://full-stack-student-group-assignment-82sy.onrender.com/) • [System Architecture](#-system-architecture--topology) • [API Documentation](#-api-specification) • [Deployment Guide](#-getting-started--orchestration)

</div>

---

## 🌐 Live Production Access & Credentials

| Access Role | Production Web App | Demo Email Credentials | Password |
| :--- | :--- | :--- | :--- |
| **Faculty / Admin** | [Live Platform Portal](https://full-stack-student-group-assignment-82sy.onrender.com/) | `turing@university.edu` | `password123` |
| **Student** | [Live Platform Portal](https://full-stack-student-group-assignment-82sy.onrender.com/) | `alice@student.edu` | `password123` |

---

## 📌 Executive Summary

**JoinEasy** bridges the operational gap between collaborative academic teamwork and professor assignment tracking. Built with modern web architecture standards, JoinEasy enables students to form autonomous study groups, track project milestones, and verify external cloud submissions (e.g., OneDrive / SharePoint) via an authoritative **2-Step Group Leader Safeguard**. 

Professors access an executive dashboard featuring real-time submission metrics, targeted assignment distribution engines (*All Groups* vs. *Specific Targeted Groups*), and status-based analytical heatmaps.

---

## ✨ Engineering Highlights & Core Features

### 🛡️ 1. Cryptographic Authentication & Role-Based Access Control (RBAC)
- **Stateful Password Hashing**: Utilizes `bcryptjs` with salt-rounds to enforce cryptographically secure credential storage.
- **Signed JWT Tokens**: Issues signed JSON Web Tokens (`jsonwebtoken`) containing encrypted claims (`userId`, `role`).
- **Route Guards & Middleware**: Enforces strict privilege validation on both client-side React Router transitions and backend Express middleware stacks.

### 👑 2. Group Leader 2-Step Confirmation Safeguard
- **Single-Point Accountability**: Restricts final assignment completion confirmation exclusively to designated **Group Leaders** (`groups.created_by === req.user.userId`).
- **Transactional State Guarantee**: Eliminates premature or conflicting student confirmations by validating leader identity at the database layer.
- **2-Step Intent Verification**:
  1. **Intent Check**: Student leader reviews external OneDrive submission repository URL.
  2. **Final Acknowledgment**: Modal confirmation updates group status across all team members instantaneously.

### 🎯 3. Dynamic Assignment Scope Engine
- **Global Distribution**: Publish assignments broadly to all enrolled course groups (`target_type: 'all'`).
- **Targeted Scope**: Distribute assignments selectively to designated groups (`target_type: 'specific_groups'`) via relational link tables (`assignment_groups`).

### 📊 4. Real-Time Analytical Visualizer & Metric Engine
- **Completion Rate Heatmaps**: Custom SVG chart visualizer rendering real-time completion rates per assignment.
- **Administrative Status Filters**: Seamlessly filter assignments by *All*, *100% Fully Confirmed*, and *Pending Progress*.
- **Granular Group Drilldowns**: Inspect individual group roster statuses, confirming leader identities, and timestamps.

---

## 🏛️ System Architecture & Topology

### High-Level System Flow

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │                Client Layer (Vite + React)             │
                                  │   - Plus Jakarta Sans Typography & Surface Palette    │
                                  │   - Role-Aware Route Guards & JWT Context State        │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │
                                                              │ HTTPS / JSON REST API
                                                              │ (Authorization: Bearer <JWT>)
                                                              ▼
                                  ┌────────────────────────────────────────────────────────┐
                                  │              API Application Layer (Node.js)           │
                                  │  ┌──────────────────────────────────────────────────┐  │
                                  │  │ Express Router & Security Rate Limiters         │  │
                                  │  ├──────────────────────────────────────────────────┤  │
                                  │  │ JWT & RBAC Authorization Middleware Stack        │  │
                                  │  ├──────────────────────────────────────────────────┤  │
                                  │  │ Controllers: Auth | Users | Groups | Submissions │  │
                                  │  └──────────────────────────────────────────────────┘  │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │
                                                              │ Connection Pool SQL (pg)
                                                              ▼
                                  ┌────────────────────────────────────────────────────────┐
                                  │           Persistence Layer (PostgreSQL 16)            │
                                  │  - Transactional Integrity & Relational Foreign Keys   │
                                  │  - ENUM Role & Target Constraints                     │
                                  └────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Architecture & Relational ERD

### Relational Entity-Relationship Diagram (ERD)

![JoinEasy Entity-Relationship Diagram](docs/images/er_diagram.png)

```mermaid
erDiagram
    users ||--o{ groups : "creates or leads"
    users ||--o{ group_members : "joins"
    users ||--o{ assignments : "publishes"
    users ||--o{ submissions : "confirms"
    
    groups ||--o{ group_members : "contains"
    groups ||--o{ assignment_groups : "targeted by"
    groups ||--o{ submissions : "submits"

    assignments ||--o{ assignment_groups : "links"
    assignments ||--o{ submissions : "tracks"

    users {
        int id PK
        string name
        string email
        string password_hash
        string role
        timestamp created_at
    }

    groups {
        int id PK
        string name
        int created_by FK
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
        string target_type
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
        int confirmed_by FK
        string status
        timestamp confirmed_at
    }
```

### Relational Schema Field Reference

| Table Name | Field | Type | Constraints / References | Description |
| :--- | :--- | :--- | :--- | :--- |
| **`users`** | `id` | `SERIAL` | `PRIMARY KEY` | Unique user identity identifier |
| | `email` | `VARCHAR(255)` | `UNIQUE, NOT NULL` | University email credential |
| | `role` | `ENUM` | `'student' \| 'admin'` | System authorization role |
| **`groups`** | `id` | `SERIAL` | `PRIMARY KEY` | Study group identifier |
| | `created_by` | `INTEGER` | `FOREIGN KEY (users.id)` | Designated Group Leader |
| **`group_members`**| `group_id` | `INTEGER` | `FOREIGN KEY (groups.id)` | Group relation reference |
| | `student_id` | `INTEGER` | `FOREIGN KEY (users.id)` | Enrolled student reference |
| **`assignments`** | `target_type` | `ENUM` | `'all' \| 'specific_groups'`| Assignment scope indicator |
| | `onedrive_link`| `TEXT` | `NULLABLE` | External cloud submission repository URL |
| **`submissions`** | `confirmed_by`| `INTEGER` | `FOREIGN KEY (users.id)` | Leader ID who authorized completion |
| | `status` | `ENUM` | `'pending' \| 'confirmed'` | Atomic group submission status |

---

## 🎨 Enterprise UI/UX Design System

![JoinEasy Platform Preview](docs/images/dashboard_preview.png)

JoinEasy implements an enterprise dark surface theme built in accordance with modern visual guidelines:
- **Typography Stack**: Integrated **Plus Jakarta Sans** for crisp header authority and **Inter** for clean readability.
- **Curated Color Tokens**: Deep Slate backgrounds (`#0b1329`, `#111c38`), Royal Sapphire accents (`#0284c7`), Emerald success indicators (`#10b981`), and Amber pending warnings (`#f59e0b`).
- **Micro-Interactions**: Hover elevation transforms (`translate-y-0.5`), subtle glow shadows (`shadow-card-glow`, `shadow-modal-glow`), and smooth modal backdrop blurs (`backdrop-blur-md`).

---

## 🔌 API Specification

All protected endpoints require a valid JWT passed in the HTTP Authorization header: `Authorization: Bearer <TOKEN>`.

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Request Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | `{ name, email, password, role }` | Register new student or professor account |
| `POST` | `/api/auth/login` | Public | `{ email, password }` | Authenticate credentials & return JWT |

### Group Management Routes (`/api/groups`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/groups/mine` | Student | Retrieve groups where authenticated student is enrolled |
| `GET` | `/api/groups` | Public/Auth | Retrieve catalog of all course study groups |
| `POST` | `/api/groups` | Student | Create new study group (creator designated as Leader) |
| `GET` | `/api/groups/:id` | Auth | Retrieve detailed group roster and leader identity |
| `POST` | `/api/groups/:id/members` | Student | Add classmate to study group via email address |
| `DELETE` | `/api/groups/:id/members/:studentId` | Leader | Remove student member from group |

### Assignment Routes (`/api/assignments`)

| Method | Endpoint | Access | Request Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/assignments` | Auth | — | List assignments (filtered by group scope for students) |
| `POST` | `/api/assignments` | Admin | `{ title, description, due_date, onedrive_link, target_type, group_ids }` | Create new course assignment |
| `PUT` | `/api/assignments/:id` | Admin | `{ title, description, due_date, onedrive_link, target_type, group_ids }` | Update assignment specification |
| `DELETE` | `/api/assignments/:id` | Admin | — | Remove course assignment |

### Submissions & Analytics Routes (`/api/submissions`, `/api/analytics`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/submissions/:assignmentId/confirm` | Leader | Trigger 2-Step confirmation (Enforces Leader Check) |
| `GET` | `/api/analytics/overview` | Admin | Retrieve macro class metrics & recent assignment status |
| `GET` | `/api/analytics/assignment/:id` | Admin | Retrieve drill-down confirmation rates per group |

---

## 💻 Getting Started & Orchestration

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/) (Recommended for containerized execution)
- [Node.js (v20+)](https://nodejs.org/) & [PostgreSQL (v16+)](https://www.postgresql.org/) (For local manual execution)

---

### Option A: One-Command Docker Orchestration (Recommended)

Run the complete multi-container stack (PostgreSQL + Express Backend + Vite React Frontend) with a single command:

```bash
docker compose up --build
```

- **Frontend Interface**: [http://localhost:3000](http://localhost:3000)
- **Backend API Gateway**: [http://localhost:5000](http://localhost:5000)
- **Database Engine**: `localhost:5432` (`joineasy_db`)

---

### Option B: Local Micro-Service Development

#### 1. Database Initialization
Create a local PostgreSQL database and load the schema:
```bash
psql -U postgres -d joineasy_db -f backend/src/db/schema.sql
```

#### 2. Backend API Setup
```bash
cd backend
npm install

# Create environment configuration file (.env)
cat <<EOT > .env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/joineasy_db
JWT_SECRET=super_secret_jwt_key_development
CLIENT_ORIGIN=http://localhost:5173
EOT

npm run dev
```

#### 3. Frontend Web Application Setup
```bash
cd frontend
npm install
npm run dev
```
Access the Vite development server at [http://localhost:5173](http://localhost:5173).

---

## 📂 Project Directory Structure

```
ASSIGNMENT-JOINEASY/
├── backend/                        # Node.js + Express REST API Application
│   ├── src/
│   │   ├── controllers/            # Request handlers & domain logic
│   │   │   ├── analytics.js        # Admin analytical metrics controller
│   │   │   ├── assignments.js      # Assignment CRUD & targeting controller
│   │   │   ├── auth.js             # User registration & JWT authentication
│   │   │   ├── groups.js           # Group creation & membership controller
│   │   │   └── submissions.js      # Leader 2-step confirmation logic
│   │   ├── db/                     # Database client, schema & seed scripts
│   │   │   ├── index.js            # PostgreSQL connection pool configuration
│   │   │   ├── schema.sql          # DDL tables, ENUM types & constraints
│   │   │   └── seed.js            # Automated seed data generator
│   │   ├── middleware/             # Security & RBAC authentication guards
│   │   │   └── auth.js             # JWT verification middleware
│   │   ├── routes/                 # Express API endpoint definitions
│   │   └── index.js                # Server entrypoint & static frontend middleware
│   ├── Dockerfile                  # Container definition for Node API server
│   └── package.json
│
├── frontend/                       # React.js Single Page Application (SPA)
│   ├── src/
│   │   ├── components/             # Reusable UI component library
│   │   │   ├── Layout.jsx          # Top bar, breadcrumbs & sidebar viewport
│   │   │   ├── Modal.jsx           # Backdrop blur modal dialog container
│   │   │   ├── Navbar.jsx          # Sidebar navigation with active pills
│   │   │   ├── ProgressBar.jsx     # Gradient progress indicator with badges
│   │   │   └── StatCard.jsx        # Metric summary cards with Lucide icons
│   │   ├── context/                # Global state management
│   │   │   └── AuthContext.jsx     # Auth state context & local token storage
│   │   ├── pages/                  # Role-aware page views
│   │   │   ├── admin/              # Professor management views
│   │   │   │   ├── Analytics.jsx   # Visual completion chart & drilldown
│   │   │   │   ├── Assignments.jsx # Assignment editor & scope selector
│   │   │   │   ├── Dashboard.jsx   # System overview dashboard
│   │   │   │   └── Groups.jsx      # Course groups roster table
│   │   │   ├── student/            # Student portal views
│   │   │   │   ├── Assignments.jsx # Coursework list & 2-step confirm modal
│   │   │   │   ├── Dashboard.jsx   # Enrolled overview & deadline tracker
│   │   │   │   └── Groups.jsx      # Study group creation & member list
│   │   │   ├── Login.jsx           # Auth login portal view
│   │   │   └── Register.jsx        # Account registration & role selector
│   │   ├── services/               # Axios API HTTP client layer
│   │   │   └── api.js              # Centralized API service methods
│   │   ├── App.jsx                 # Client router & role protection guards
│   │   ├── index.css               # Tailwind layer utilities & design tokens
│   │   └── main.jsx
│   ├── index.html                  # HTML head with Plus Jakarta Sans fonts
│   ├── tailwind.config.js          # Color tokens, fonts, and animation utilities
│   ├── Dockerfile                  # Multi-stage Nginx build definition
│   └── package.json
│
├── docs/                           # Documentation media & architectural assets
│   └── images/                     # System ER diagram & platform preview images
├── docker-compose.yml              # Multi-container Docker orchestration manifest
├── package.json                    # Workspace root orchestration script
└── README.md                       # FAANG-Grade Technical Documentation
```

---

## 🔒 Security Compliance & Resilience

1. **Stateless JWT Authorization**: Avoids server memory overhead while maintaining cryptographically signed user claims (`userId`, `role`).
2. **CORS & Rate Limiting**: Implements `cors` whitelist policy and rate-limiting (`express-rate-limit`) on authentication endpoints to prevent brute-force attacks.
3. **Database Race Condition Prevention**: Utilizes `pg` connection pool with SQL upsert logic and unique indices (`UNIQUE(assignment_id, group_id)`) to enforce atomic submission states.

---

<div align="center">

**JoinEasy Academic Management System** • Built for Scale, Security, and Seamless User Experience.

</div>
