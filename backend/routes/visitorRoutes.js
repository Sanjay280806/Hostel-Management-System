const express = require('express');
const router = express.Router();
const {
  getAllVisitors,
  logVisitor,
  checkoutVisitor
} = require('../controllers/visitorController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);

// GET /api/visitors?status=  → Admin, Warden
router.get('/', authorizeRoles('Admin', 'Warden'), getAllVisitors);

// POST /api/visitors         → Admin, Warden
router.post('/', authorizeRoles('Admin', 'Warden'), logVisitor);

// PUT /api/visitors/:id/checkout → Admin, Warden
router.put('/:id/checkout', authorizeRoles('Admin', 'Warden'), checkoutVisitor);

module.exports = router;
