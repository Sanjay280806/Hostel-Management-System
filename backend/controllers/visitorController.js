const Visitor = require('../models/Visitor');
const Student = require('../models/Student');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all visitors
// @route   GET /api/visitors?status=In|Out
// @access  Admin, Warden
// ─────────────────────────────────────────────────────────────────────────────
const getAllVisitors = async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};

  const visitors = await Visitor.find(query)
    .populate('studentId', 'studentId name rollNo roomNumber')
    .sort({ checkIn: -1 });

  res.status(200).json({
    success: true,
    count: visitors.length,
    data: visitors,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Log a new visitor (check-in)
// @route   POST /api/visitors
// @access  Admin, Warden
// ─────────────────────────────────────────────────────────────────────────────
const logVisitor = async (req, res) => {
  const { studentId, visitorName } = req.body;

  if (!studentId || !visitorName) {
    return res.status(400).json({ success: false, message: 'Student and visitor name are required.' });
  }

  const student = await Student.findById(studentId);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  const visitor = await Visitor.create({
    studentId,
    visitorName,
    checkIn: new Date(),
    status: 'In'
  });

  const populated = await visitor.populate('studentId', 'studentId name rollNo');

  res.status(201).json({
    success: true,
    message: 'Visitor logged successfully.',
    data: populated,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Check-out a visitor
// @route   PUT /api/visitors/:id/checkout
// @access  Admin, Warden
// ─────────────────────────────────────────────────────────────────────────────
const checkoutVisitor = async (req, res) => {
  const visitor = await Visitor.findById(req.params.id);

  if (!visitor) {
    return res.status(404).json({ success: false, message: 'Visitor record not found.' });
  }

  if (visitor.status === 'Out') {
    return res.status(400).json({ success: false, message: 'Visitor has already checked out.' });
  }

  visitor.status = 'Out';
  visitor.checkOut = new Date();
  await visitor.save();

  const populated = await visitor.populate('studentId', 'studentId name rollNo');

  res.status(200).json({
    success: true,
    message: 'Visitor checked out successfully.',
    data: populated,
  });
};

module.exports = {
  getAllVisitors,
  logVisitor,
  checkoutVisitor
};
