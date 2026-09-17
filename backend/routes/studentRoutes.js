const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const { protect, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// GET /api/students?search=&page=&limit=   → Admin, Warden
router.get('/', authorizeRoles('Admin', 'Warden'), getAllStudents);

// GET /api/students/:id                    → Admin, Warden
router.get('/:id', authorizeRoles('Admin', 'Warden'), getStudentById);

// POST /api/students                       → Admin only
router.post('/', authorizeRoles('Admin'), createStudent);

// PUT /api/students/:id                    → Admin only
router.put('/:id', authorizeRoles('Admin'), updateStudent);

// DELETE /api/students/:id                 → Admin only
router.delete('/:id', authorizeRoles('Admin'), deleteStudent);

module.exports = router;
