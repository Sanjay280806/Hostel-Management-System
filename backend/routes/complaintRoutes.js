const express = require('express');
const router = express.Router();
const {
  getAllComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
} = require('../controllers/complaintController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);

// GET /api/complaints?status=  → Admin, Warden
router.get('/', authorizeRoles('Admin', 'Warden'), getAllComplaints);

// GET /api/complaints/:id      → Admin, Warden, Student
router.get('/:id', authorizeRoles('Admin', 'Warden', 'Student'), getComplaintById);

// POST /api/complaints         → Admin, Student
router.post('/', authorizeRoles('Admin', 'Student'), createComplaint);

// PUT /api/complaints/:id      → Admin, Warden
router.put('/:id', authorizeRoles('Admin', 'Warden'), updateComplaint);

module.exports = router;
