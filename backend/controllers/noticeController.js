const Notice = require('../models/Notice');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all notices
// @route   GET /api/notices
// @access  Public (All logged-in roles)
// ─────────────────────────────────────────────────────────────────────────────
const getAllNotices = async (req, res) => {
  const notices = await Notice.find({})
    .populate('postedBy', 'email role')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: notices.length,
    data: notices,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get public notices (For Guest role or landing page)
// @route   GET /api/notices/public
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getPublicNotices = async (req, res) => {
  const notices = await Notice.find({})
    .select('-postedBy') // Hide poster details for fully public route
    .sort({ createdAt: -1 })
    .limit(10); // Limit public notices

  res.status(200).json({
    success: true,
    data: notices,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new notice
// @route   POST /api/notices
// @access  Admin, Warden
// ─────────────────────────────────────────────────────────────────────────────
const createNotice = async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required.' });
  }

  const notice = await Notice.create({
    title,
    content,
    postedBy: req.user.id // From JWT protect middleware
  });

  const populated = await notice.populate('postedBy', 'email role');

  res.status(201).json({
    success: true,
    message: 'Notice posted successfully.',
    data: populated,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
const deleteNotice = async (req, res) => {
  const notice = await Notice.findById(req.params.id);

  if (!notice) {
    return res.status(404).json({ success: false, message: 'Notice not found.' });
  }

  await notice.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Notice deleted successfully.'
  });
};

module.exports = {
  getAllNotices,
  getPublicNotices,
  createNotice,
  deleteNotice
};
