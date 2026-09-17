const Student = require('../models/Student');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all students (with optional search by name or rollNo)
// @route   GET /api/students?search=&page=&limit=
// @access  Admin, Warden
// ─────────────────────────────────────────────────────────────────────────────
const getAllStudents = async (req, res) => {
  const { search = '', page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { rollNo: { $regex: search, $options: 'i' } },
          { studentId: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  const [students, total] = await Promise.all([
    Student.find(query)
      .populate('userId', 'email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Student.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: students.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: students,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Admin, Warden
// ─────────────────────────────────────────────────────────────────────────────
const getStudentById = async (req, res) => {
  const student = await Student.findById(req.params.id).populate(
    'userId',
    'email role'
  );

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  res.status(200).json({ success: true, data: student });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new student (Admin also creates their User account)
// @route   POST /api/students
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
const createStudent = async (req, res) => {
  const { name, contact, rollNo, email, password } = req.body;

  if (!name || !contact || !rollNo || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'name, contact, rollNo, email, and password are all required.',
    });
  }

  // Check for existing roll number
  const existingStudent = await Student.findOne({ rollNo: rollNo.toUpperCase() });
  if (existingStudent) {
    return res.status(409).json({
      success: false,
      message: `Roll number '${rollNo}' is already registered.`,
    });
  }

  // Check for existing email
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: `Email '${email}' is already in use.`,
    });
  }

  // Create User account for the student
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, role: 'Student' });

  // Create Student profile linked to the User
  const student = await Student.create({ name, contact, rollNo, userId: user._id });

  const populated = await student.populate('userId', 'email role');

  res.status(201).json({
    success: true,
    message: 'Student created successfully.',
    data: populated,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
const updateStudent = async (req, res) => {
  const { name, contact, rollNo } = req.body;

  const student = await Student.findById(req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  // Check rollNo uniqueness if changing
  if (rollNo && rollNo.toUpperCase() !== student.rollNo) {
    const conflict = await Student.findOne({ rollNo: rollNo.toUpperCase() });
    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Roll number '${rollNo}' is already taken.`,
      });
    }
  }

  if (name) student.name = name;
  if (contact) student.contact = contact;
  if (rollNo) student.rollNo = rollNo.toUpperCase();

  await student.save();
  const populated = await student.populate('userId', 'email role');

  res.status(200).json({
    success: true,
    message: 'Student updated successfully.',
    data: populated,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete student and their User account
// @route   DELETE /api/students/:id
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
const deleteStudent = async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  // Remove linked User account
  await User.findByIdAndDelete(student.userId);
  await Student.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Student and associated user account deleted.',
  });
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
