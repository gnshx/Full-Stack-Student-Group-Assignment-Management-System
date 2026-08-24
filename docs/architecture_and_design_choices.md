# Architecture & Design Choices — JoinEasy

This document outlines the architectural patterns, technical decisions, data model rationale, and deployment strategies chosen for the **Student, Group & Assignment Management System**.

---

## 1. System Architecture & Component Interaction

The application follows a **Decoupled 3-Tier Architecture**:

```
 ┌──────────────────────────────────────────────────────────┐
 │                  Client Tier (Frontend)                  │
 │   React.js 18 + Tailwind CSS (Vite SPA)                  │
 │   - AuthContext (JWT state & auto-logout)                │
 │   - Student Portal & Admin Analytics Dashboards          │
 │   - Dynamic SVG Charting & Two-Step Safeguard Modals     │
 └────────────────────────────┬─────────────────────────────┘
                              │ HTTPS / REST (JSON)
                              │ Authorization: Bearer <JWT>
                              ▼
 ┌──────────────────────────────────────────────────────────┐
 │                Application Tier (Backend)               │
 │   Node.js 20 + Express.js REST API                       │
 │   - Middleware: CORS, Rate Limiter, JWT Verification     │
 │   - RBAC Guards: requireRole('student' | 'admin')        │
 │   - Controllers: Auth, Users, Groups, Assignments,       │
 │                  Submissions, Analytics                  │
 └────────────────────────────┬─────────────────────────────┘
                              │ SQL (pg Pool Connection)
                              ▼
 ┌──────────────────────────────────────────────────────────┐
 │                 Database Tier (Storage)                  │
 │   PostgreSQL 16 Relational Database                      │
 │   - Foreign Key Cascades & ENUM Types                    │
 │   - Unique Multi-Column Constraints (No Race Conditions) │
 └──────────────────────────────────────────────────────────┘
```

---

## 2. Key Technical & Architectural Decisions

### 2.1 Database Schema & Data Integrity
- **Relational Integrity over Application Logic**: Unique constraints (`UNIQUE(assignment_id, group_id)`, `UNIQUE(group_id, student_id)`) are enforced directly in PostgreSQL. This guarantees transactional integrity and eliminates duplicate submissions or memberships, even under heavy concurrent requests.
- **Flexible Assignment Targeting**: Using a join table (`assignment_groups`) combined with an ENUM `target_type ('all', 'specific_groups')` allows professors to target either all groups or arbitrary multi-selected groups without duplicating assignment data.

### 2.2 Security & Authentication
- **Stateless JWT Authentication**: Tokens contain `{ userId, role }` and are signed with a server-side secret.
- **Role-Based Access Control (RBAC)**: Enforced via Express middleware (`requireRole('admin')`, `requireRole('student')`). Routes are protected on both the API server layer and the React Router client layer (`PrivateRoute.jsx`).
- **Bcrypt Password Hashing**: Passwords are salted and hashed (10-12 rounds) before persistence.

### 2.3 Two-Step Confirmation UX Safeguard
- **Rationale**: Since assignment files are uploaded externally on OneDrive, one-click accidental submissions could corrupt submission status metrics.
- **Implementation**:
  1. **Step 1**: Student views the assignment details and clicks *"I have submitted"*, bringing up OneDrive link verification.
  2. **Step 2**: Student explicitly confirms in a modal warning *"Are you sure? This will mark your group's submission as complete"*.

---

## 3. Containerization & Deployment Strategy

```
                          ┌──────────────────────────┐
                          │    docker-compose.yml    │
                          └────────────┬─────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
 ┌──────────────┐               ┌──────────────┐               ┌──────────────┐
 │   frontend   │               │   backend    │               │      db      │
 │  (Nginx 80)  │               │ (Node 5000)  │               │(Postgres 5432│
 └──────────────┘               └──────────────┘               └──────────────┘
```

- **Multi-Stage Docker Builds**: The frontend image uses Node 20 Alpine for Vite compilation and stages the production static assets into a ultra-lightweight Nginx container (~25MB).
- **Reverse Proxy Routing**: Nginx proxies API calls (`/api/*`) directly to the backend container while serving static assets with fallback for client-side React SPA routing.
- **Health Checks & Resilience**: `docker-compose.yml` configures PostgreSQL health checks (`pg_isready`) ensuring the API wait for database readiness prior to starting.
