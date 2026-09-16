# Hostel Management System (HMS) – Implementation Plan

> Detailed phase-by-phase execution roadmap for building the Hostel Management System using React.js, Node.js, Express.js, and MongoDB[cite: 3].

---

## 🎯 Project Overview & Strategy
The implementation is divided into **4 core development phases** designed to incrementally build and validate features[cite: 2]. Each phase delivers fully testable endpoints and UI components, ensuring foundational security and data integrity before higher-level modules are built.

---

## 📅 Execution Roadmap Overview


```

┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Project Setup & Authentication Subsystem           │
└──────────────────────────────┬──────────────────────────────┘
│
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 2: Core Admin Subsystem (Students, Rooms & Allocations)│
└──────────────────────────────┬──────────────────────────────┘
│
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 3: Financial & Operations Subsystem (Fees & Complaints)│
└──────────────────────────────┬──────────────────────────────┘
│
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 4: Attendance, Visitors, Reports & System Polishing    │
└─────────────────────────────────────────────────────────────┘

```

---

## 🚀 Phase 1: Project Setup & Authentication Subsystem

### 🎯 Objective
Establish the repository directory structure, configure backend database connections, build database schemas, and deploy JWT role-based authentication[cite: 3].

### 🛠️ Tasks & Deliverables

#### 1.1 Project & Environment Setup
- Initialize root workspace structure (`/backend` and `/frontend` directories).
- Set up Node.js project with `express`, `mongoose`, `dotenv`, `cors`, `jsonwebtoken`, and `bcryptjs`.
- Set up React frontend using Vite with Bootstrap / Tailwind CSS and Axios.
- Configure `.env` file handling for `PORT`, `MONGO_URI`, and `JWT_SECRET`[cite: 3].

#### 1.2 Mongoose Schema Setup
Create all Mongoose data models inside `/backend/models`:
- `User` Schema (fields: `email`, `passwordHash`, `role` [`Admin`, `Warden`, `Student`, `Guest`])[cite: 3].
- `Student` Schema (fields: `studentId`, `name`, `contact`, `rollNo`, `userId`)[cite: 3].
- `Room` Schema (fields: `roomNumber`, `capacity`, `occupiedCount`, `status`)[cite: 3].
- `Allocation` Schema (fields: `studentId`, `roomId`, `startDate`, `endDate`, `status`)[cite: 3].
- `FeePayment` Schema (fields: `allocationId`, `studentId`, `amount`, `status`, `receiptId`)[cite: 3].
- `Complaint` Schema (fields: `studentId`, `title`, `description`, `status`, `assignedTo`)[cite: 3].
- `Visitor` Schema (fields: `visitorName`, `studentId`, `checkIn`, `checkOut`, `status`)[cite: 3].
- `Attendance` Schema (fields: `studentId`, `date`, `status`)[cite: 3].
- `Notice` Schema (fields: `title`, `content`, `postedBy`, `createdAt`)[cite: 3].

#### 1.3 Security & Auth Middleware
- Build password hashing utilities using `bcryptjs`.
- Build JWT authentication middleware to verify tokens on incoming requests.
- Implement Role-Based Access Control (RBAC) middleware (`authorizeRoles(...)`)[cite: 3].

#### 1.4 Auth API Endpoints
- `POST /api/auth/register` – Register user with validated credentials[cite: 3].
- `POST /api/auth/login` – Authenticate user and return JWT bearer token[cite: 3].
- `GET /api/auth/me` – Fetch currently authenticated user profile[cite: 3].

#### 1.5 Frontend Auth Modules
- Create Auth Context in React to store user token and user role state.
- Build Login Page and Registration Form components.
- Setup Protected Routes based on user role (`Admin`, `Warden`, `Student`)[cite: 3].

---

## 🏠 Phase 2: Core Admin Subsystem (Students, Rooms & Allocations)

### 🎯 Objective
Implement complete administrative controls for student records, room inventory creation, automated room availability checks, and room assignments[cite: 3].

### 🛠️ Tasks & Deliverables

#### 2.1 Student Management Module
- Build CRUD API routes for Admin: `GET`, `POST`, `PUT`, `DELETE` on `/api/students`[cite: 3].
- Implement backend search and filter by Student ID or Name (`/api/students?search=...`)[cite: 3].
- Build Frontend Student Management Directory table with search and modal forms.

#### 2.2 Room Inventory Module
- Build CRUD API routes for Admin: `GET`, `POST`, `PUT` on `/api/rooms`[cite: 3].
- Implement room capacity validation (`occupiedCount` tracking)[cite: 3].
- Build Frontend Room Grid displaying live room availability status (`Available` vs `Full`)[cite: 3].

#### 2.3 Room Allocation Workflow
- Build API route: `POST /api/allocations` (Allocate room)[cite: 3].
  - *Validation Logic:* Verify `occupiedCount < capacity` before assigning[cite: 3].
  - *Validation Logic:* Check that student does not already have an active allocation[cite: 3].
  - *Transaction:* Increment `occupiedCount` on allocation.
- Build API route: `PUT /api/allocations/:id/vacate` (Vacate room)[cite: 3].
  - *Transaction:* Decrement `occupiedCount` on vacate action.
- Build Frontend Allocation Modal & Student Room Assignment UI.

---

## 💰 Phase 3: Financial & Operations Subsystem (Fees & Complaints)

### 🎯 Objective
Build financial tracking for hostel fee payments, receipt generation, and a complete grievance tracking system for students and wardens[cite: 3].

### 🛠️ Tasks & Deliverables

#### 3.1 Hostel Fee Management Module
- Build API route: `POST /api/fees` (Record fee payment)[cite: 3].
- Build API route: `GET /api/fees/dues` (Retrieve list of pending fee dues)[cite: 3].
- Build Receipt Generator utility (auto-generate `receiptId` upon completion)[cite: 3].
- Build Student Fee View & Admin Fee Overview table in React.

#### 3.2 Complaint Tracking System
- Build API route: `POST /api/complaints` (Student submits a complaint)[cite: 3].
- Build API route: `GET /api/complaints` (Fetch complaints filtered by user role)[cite: 3].
- Build API route: `PATCH /api/complaints/:id` (Warden updates status: `Pending` → `In-Progress` → `Resolved`)[cite: 3].
- Build Student Complaint Submission Form & Warden Complaint Resolution Dashboard.

---

## 📊 Phase 4: Attendance, Visitors, Reports & System Polishing

### 🎯 Objective
Complete operational monitoring tools (daily attendance, visitor registers), system notice board, analytics reporting, and final production testing[cite: 3].

### 🛠️ Tasks & Deliverables

#### 4.1 Attendance & Visitor Register Modules
- Build API route: `POST /api/attendance` (Batch log daily student attendance)[cite: 3].
- Build API route: `POST /api/visitors` (Log check-in and check-out timestamps)[cite: 3].
- Build Warden Attendance Checklist UI and Visitor Entry Logging UI.

#### 4.2 Notice Board & Analytics Reports Module
- Build API routes for Notice Board (`GET /api/notices`, `POST /api/notices`)[cite: 3].
- Build API route: `GET /api/reports/summary` (Aggregated statistics for total occupancy, total fees collected vs. pending, and open complaints)[cite: 3].
- Build Admin Dashboard Summary Cards & Charts.

#### 4.3 Final Polishing & Integration Testing
- Configure end-to-end error handling middleware across all Express routes.
- Verify sub-2 second page load performance and API execution times under 500 ms[cite: 3].
- Perform RBAC security review to confirm role-restricted API access[cite: 3].

---

## 📌 Phase Summary Matrix

| Phase | Core Modules | Target User Roles | Key Output |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Auth, Schemas, Security | All Roles | JWT Auth & Base Setup |
| **Phase 2** | Students, Rooms, Allocations | Admin | Core Inventory & Allocation Engine |
| **Phase 3** | Fees & Complaints | Student, Warden, Admin | Fee Dues & Grievance Dashboard |
| **Phase 4** | Attendance, Visitors, Reports | Warden, Admin, Guest | Complete Full-Stack HMS |
