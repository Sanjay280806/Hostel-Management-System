const express = require('express');
const router = express.Router();
const {
  getAllFees,
  getFeeById,
  createFee,
  markFeeAsPaid,
} = require('../controllers/feeController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);

// GET /api/fees?status=      → Admin, Warden
router.get('/', authorizeRoles('Admin', 'Warden'), getAllFees);

// GET /api/fees/:id          → Admin, Warden
router.get('/:id', authorizeRoles('Admin', 'Warden'), getFeeById);

// POST /api/fees             → Admin only
router.post('/', authorizeRoles('Admin'), createFee);

// PUT /api/fees/:id/pay      → Admin only
router.put('/:id/pay', authorizeRoles('Admin'), markFeeAsPaid);

module.exports = router;
