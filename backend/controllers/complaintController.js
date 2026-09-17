const Complaint = require('../models/Complaint');
const Student = require('../models/Student');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all complaints
// @route   GET /api/complaints?status=Pending|In-Progress|Resolved
// @access  Admin, Warden
// ─────────────────────────────────────────────────────────────────────────────
const getAllComplaints = async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};

  const complaints = await Complaint.find(query)
    .populate('studentId', 'studentId name rollNo roomNumber')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: complaints.length,
    data: complaints,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a single complaint by ID
// @route   GET /api/complaints/:id
// @access  Admin, Warden, Student (owner)
// ─────────────────────────────────────────────────────────────────────────────
const getComplaintById = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('studentId', 'studentId name rollNo');

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found.' });
  }

  res.status(200).json({ success: true, data: complaint });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Admin, Student
// ─────────────────────────────────────────────────────────────────────────────
const createComplaint = async (req, res) => {
  const { studentId, title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: 'Title and description are required.',
    });
  }

  let actualStudentId = studentId;

  // If a student is logged in, use their linked Student profile
  if (req.user.role === 'Student') {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }
    actualStudentId = student._id;
  } else if (!actualStudentId) {
    // If Admin is creating it on behalf of a student, studentId is required in the body
    return res.status(400).json({
      success: false,
      message: 'studentId is required when created by Admin.',
    });
  }

  const complaint = await Complaint.create({
    studentId: actualStudentId,
    title,
    description,
    status: 'Pending',
  });

  const populated = await complaint.populate('studentId', 'studentId name rollNo');

  res.status(201).json({
    success: true,
    message: 'Complaint submitted successfully.',
    data: populated,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update complaint status
// @route   PUT /api/complaints/:id
// @access  Admin, Warden
// ─────────────────────────────────────────────────────────────────────────────
const updateComplaint = async (req, res) => {
  const { status, assignedTo } = req.body;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found.' });
  }

  // Validate status transition if provided
  const validStatuses = ['Pending', 'In-Progress', 'Resolved'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be Pending, In-Progress, or Resolved.',
    });
  }

  if (status) complaint.status = status;
  if (assignedTo !== undefined) complaint.assignedTo = assignedTo;

  await complaint.save();

  const populated = await complaint.populate('studentId', 'studentId name rollNo');

  res.status(200).json({
    success: true,
    message: 'Complaint updated successfully.',
    data: populated,
  });
};

module.exports = {
  getAllComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
};
