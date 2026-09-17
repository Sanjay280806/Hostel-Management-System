require('dotenv').config();
require('express-async-errors'); // Patches async route handlers to forward errors to next()

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ─── Route Imports ─────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const roomRoutes = require('./routes/roomRoutes');
const allocationRoutes = require('./routes/allocationRoutes');

const feeRoutes = require('./routes/feeRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const noticeRoutes = require('./routes/noticeRoutes');

// ─── Database Connection ────────────────────────────────────────────────────────
connectDB();

// ─── Express App ────────────────────────────────────────────────────────────────
const app = express();

// ─── Security Middleware ─────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// ─── Body Parsers ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HMS API Server is running.',
    environment: process.env.NODE_ENV,
  });
});

// ─── API Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
// Phase 2
app.use('/api/students', studentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/allocations', allocationRoutes);
// Phase 3+ (will be mounted as implemented)
app.use('/api/fees', feeRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notices', noticeRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// ─── Global Error Handler (MUST be last) ─────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `[HMS Server] Running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});

module.exports = app;
