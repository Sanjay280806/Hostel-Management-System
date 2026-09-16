# AGENTS.md – AI Agent Guidelines for Hostel Management System (HMS)

This document defines the instructions, architectural patterns, tech stack rules, and coding standards for AI agents (AntiGravity, Cursor, Copilot) working on this codebase.

---

## 1. Project Context & Objectives
- **Project Name:** Hostel Management System (HMS)
- **Domain:** Web Application for Hostel Administration
- **Goal:** Automate student registration, room allocations, fee payments, complaints, visitor logs, and daily attendance.
- **Reference Docs:** Refer strictly to `README.md` and the SRS document in the root directory for functional definitions.

---

## 2. Technical Stack Constraints

| Layer | Technology | Rules & Guidelines |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | Functional components, React Hooks, Axios for API calls, Bootstrap / Tailwind CSS. |
| **Backend** | Node.js + Express.js | Modular REST API, Controller-Service-Route structure, Express async handler. |
| **Database** | MongoDB + Mongoose | Strict schema validation, proper indexing on foreign keys (`studentId`, `roomId`). |
| **Security** | JWT + bcrypt | Store passwords hashed using `bcryptjs`. Protect private endpoints using JWT middleware. |

---

## 3. Core Architectural Rules

### Directory Structure
```text
hostel-management-system/
├── backend/
│   ├── config/          # DB connection & environment setups
│   ├── controllers/     # Request handlers & response logic
│   ├── middleware/      # Auth, RBAC, Error handling middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route definitions
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth Context / State Management
│   │   ├── pages/       # Dashboard & Module views
│   │   ├── services/    # Axios API client modules
│   │   └── App.js       # React Router setup
└── README.md

Role-Based Access Control (RBAC) Matrix

Always enforce RBAC at the API route level using middleware:

    Admin: Full CRUD access (Admin, Student, Room, Allocation, FeePayment, Notice, Reports).

    Warden: Access to Attendance, Visitor, Complaint (status updates), and Notice.

    Student: Access to view own Allocation, pay FeePayment, submit/track Complaint, view Notice.

    Guest: Read-only access to /api/notices/public.

4. Key Business Logic Rules

    Room Allocation Checks:

        Before allocating a room, check occupiedCount < capacity. If full, throw an error.

        Verify that the student does not already have an active allocation.

        Increment occupiedCount on allocation; decrement on vacating.

    Error Handling:

        Do not let backend routes crash silently. Wrap controllers with error-handling middleware.

        Return standardized JSON response format:
        JSON

        {
          "success": false,
          "message": "Error description here"
        }

    Frontend API Calls:

        Attach JWT Bearer tokens to Axios headers automatically via request interceptors.

5. Agent Workflow Execution Rules

    Incremental Edits: Write code modularly. Do not rewrite whole files unnecessarily.

    Environment Variables: Use process environment variables (process.env.MONGO_URI, process.env.JWT_SECRET) instead of hardcoding sensitive keys.

    Consistency: Maintain existing formatting, linting rules, and naming conventions (camelCase for variables/functions, PascalCase for React components and Mongoose models).