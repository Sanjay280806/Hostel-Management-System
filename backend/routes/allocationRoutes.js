const express = require('express');
const router = express.Router();
const {
  getAllAllocations,
  getAllocationById,
  allocateRoom,
  vacateRoom,
} = require('../controllers/allocationController');
const { protect, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// GET /api/allocations?status=    → Admin, Warden
router.get('/', authorizeRoles('Admin', 'Warden'), getAllAllocations);

// GET /api/allocations/:id        → Admin, Warden
router.get('/:id', authorizeRoles('Admin', 'Warden'), getAllocationById);

// POST /api/allocations           → Admin only
router.post('/', authorizeRoles('Admin'), allocateRoom);

// PUT /api/allocations/:id/vacate → Admin only
router.put('/:id/vacate', authorizeRoles('Admin'), vacateRoom);

module.exports = router;
