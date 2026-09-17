const express = require('express');
const router = express.Router();
const {
  getAllNotices,
  getPublicNotices,
  createNotice,
  deleteNotice
} = require('../controllers/noticeController');
const { protect, authorizeRoles } = require('../middleware/auth');

// Public route for Guests (no token needed if you want it on a public landing page)
// Or you can just rely on the protected one below. We expose this just in case.
router.get('/public', getPublicNotices);

router.use(protect);

// GET /api/notices           → All logged-in users (Admin, Warden, Student)
router.get('/', getAllNotices);

// POST /api/notices          → Admin, Warden
router.post('/', authorizeRoles('Admin', 'Warden'), createNotice);

// DELETE /api/notices/:id    → Admin
router.delete('/:id', authorizeRoles('Admin'), deleteNotice);

module.exports = router;
