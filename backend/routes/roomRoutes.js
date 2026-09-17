const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController');
const { protect, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// GET /api/rooms?status=   → Admin, Warden, Student (all authenticated users)
router.get('/', getAllRooms);

// GET /api/rooms/:id       → Admin, Warden
router.get('/:id', authorizeRoles('Admin', 'Warden'), getRoomById);

// POST /api/rooms          → Admin only
router.post('/', authorizeRoles('Admin'), createRoom);

// PUT /api/rooms/:id       → Admin only
router.put('/:id', authorizeRoles('Admin'), updateRoom);

// DELETE /api/rooms/:id    → Admin only
router.delete('/:id', authorizeRoles('Admin'), deleteRoom);

module.exports = router;
