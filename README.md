---

```markdown
# Hostel Management System (HMS)

> A centralized, full-stack web application designed to automate and simplify hostel administration, including student registrations, room allocations, fee payments, complaints, visitor logs, and daily attendance[cite: 3].

---

## 📌 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Database Models](#-database-models)
- [Installation & Setup](#-installation--setup)
- [API Endpoints](#-api-endpoints)
- [Non-Functional Highlights](#-non-functional-highlights)
- [Authors](#-authors)

---

## 🏨 Overview
Traditional hostel management relies heavily on manual paper registers, leading to inefficient room allocation, difficult fee tracking, and delayed complaint handling[cite: 3]. The **Hostel Management System (HMS)** digitizes these processes into a single, secure role-based platform, reducing administrative workload and increasing operational transparency[cite: 3].

---

## ✨ Key Features

### 🔐 Role-Based Access Control (RBAC)
- **Admin:** Full system control (Student management, Room allocation, Fee management, Reports, Notice Board)[cite: 3].
- **Warden:** Student supervision, Attendance logging, Complaint resolution, Visitor approval[cite: 3].
- **Student:** View room details, Pay fee dues, Raise/track complaints, View notices[cite: 3].
- **Guest:** Read-only access to general hostel notices[cite: 3].

### 🛠️ Core Functional Modules
1. **Authentication & Authorization:** Secure registration and JWT-based authentication with bcrypt password hashing[cite: 3].
2. **Student Management:** Full CRUD operations and search functionality by Student ID or Name[cite: 3].
3. **Room Inventory & Allocation:** Automatic availability tracking, duplicate assignment prevention, and capacity checks (`occupiedCount < capacity`)[cite: 3].
4. **Fee Management:** Record payment history, generate payment receipts, and track pending dues[cite: 3].
5. **Complaint Management:** Lifecycle tracking (`Pending` → `In-Progress` → `Resolved`) for student grievances[cite: 3].
6. **Visitor & Attendance Logs:** Daily attendance registers and visitor entry check-in/check-out logs[cite: 3].
7. **Notice Board & Reports:** System-wide announcements and aggregated occupancy/financial analytics[cite: 3].

---

## 🏗️ System Architecture
The application follows a **Client-Server Architecture** operating over RESTful APIs[cite: 3]:


```

┌─────────────────┐       REST API (JSON)       ┌──────────────────┐
│   React.js      │ ──────────────────────────> │   Node.js /      │
│   Frontend      │ <────────────────────────── │   Express.js     │
└─────────────────┘                             └─────────┬────────┘
│ Mongoose ORM
v
┌──────────────────┐
│     MongoDB      │
└──────────────────┘

```

---

## 💻 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js, Bootstrap / Tailwind CSS, Axios[cite: 3] |
| **Backend** | Node.js, Express.js[cite: 3] |
| **Database** | MongoDB (Mongoose ORM)[cite: 3] |
| **Security** | JSON Web Tokens (JWT), bcrypt hashing, CORS, Helmet[cite: 3] |
| **Protocols** | HTTP / HTTPS, REST API[cite: 3] |

---

## 🗄️ Database Models

- **User:** `userId`, `email`, `passwordHash`, `role` (`Admin`, `Warden`, `Student`, `Guest`)[cite: 3]
- **Student:** `studentId`, `name`, `contact`, `rollNo`, `userId`[cite: 3]
- **Room:** `roomId`, `roomNumber`, `capacity`, `occupiedCount`, `status`[cite: 3]
- **Allocation:** `allocationId`, `studentId`, `roomId`, `startDate`, `endDate`[cite: 3]
- **FeePayment:** `paymentId`, `allocationId`, `amount`, `status`, `receiptId`[cite: 3]
- **Complaint:** `complaintId`, `studentId`, `title`, `description`, `status`, `assignedTo`[cite: 3]
- **Visitor:** `visitorId`, `visitorName`, `studentId`, `checkIn`, `checkOut`[cite: 3]
- **Attendance:** `attendanceId`, `studentId`, `date`, `status`[cite: 3]
- **Notice:** `noticeId`, `title`, `content`, `postedBy`, `createdAt`[cite: 3]

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Server running locally or a MongoDB Atlas URI
- Git

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/hostel-management-system.git](https://github.com/your-username/hostel-management-system.git)
cd hostel-management-system

```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hostel_db
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development

```

### 3. Backend Setup

```bash
cd backend
npm install
npm run dev

```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm start

```

---

## 📡 Key API Endpoints

### 🔑 Authentication

* `POST /api/auth/register` - Register a new user


* `POST /api/auth/login` - Authenticate & obtain JWT token



### 🏠 Room & Allocation (Admin)

* `GET /api/rooms` - View all rooms and availability


* `POST /api/rooms` - Create a new room


* `POST /api/allocations` - Allocate a room to a student


* `PUT /api/allocations/:id/vacate` - Vacate a room allocation



### 📋 Complaints & Attendance

* `POST /api/complaints` - Submit a complaint (Student)


* `PATCH /api/complaints/:id` - Update complaint status (Warden)


* `POST /api/attendance` - Batch log attendance (Warden)



---

## ⚡ Non-Functional Highlights

* **Performance:** Sub-2 second page loads and API responses under 500 ms.


* **Security:** Password encryption via `bcrypt`, RBAC, input sanitization, and XSS/CSRF protections.


* **Availability:** 99.5% uptime target with structured error logging.



---

## 👥 Authors

* **Samuthrika Shree S** (24BCS237)


* **Sanjay A** (24BCS239)


* **Shakthi Shree K G** (24BCS258)



---

Developed as part of the Software Engineering Mini Project at Kumaraguru College of Technology.

```

```
