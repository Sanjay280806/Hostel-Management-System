const express = require('express');
const router = express.Router();
const {
  getAttendance,
  markAttendance,
  batchMarkAttendance
} = require('../controllers/attendanceController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);

// GET /api/attendance?date=  → Admin, Warden
router.get('/', authorizeRoles('Admin', 'Warden'), getAttendance);

// POST /api/attendance       → Admin, Warden
router.post('/', authorizeRoles('Admin', 'Warden'), markAttendance);

// POST /api/attendance/batch → Admin, Warden
router.post('/batch', authorizeRoles('Admin', 'Warden'), batchMarkAttendance);

module.exports = router;
