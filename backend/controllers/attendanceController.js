const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get attendance records (optionally filter by date or student)
// @route   GET /api/attendance?date=YYYY-MM-DD
// @access  Admin, Warden
// ─────────────────────────────────────────────────────────────────────────────
const getAttendance = async (req, res) => {
  const { date, studentId } = req.query;
  const query = {};

  if (date) {
    // Exact date match (ignoring time) by matching the whole day range
    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);
    query.date = { $gte: startDate, $lte: endDate };
  }

  if (studentId) {
    query.studentId = studentId;
  }

  const attendance = await Attendance.find(query)
    .populate('studentId', 'studentId name rollNo')
    .sort({ date: -1, 'studentId.rollNo': 1 });

  res.status(200).json({
    success: true,
    count: attendance.length,
    data: attendance,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Mark attendance for a single student on a specific date
// @route   POST /api/attendance
// @access  Admin, Warden
// ─────────────────────────────────────────────────────────────────────────────
const markAttendance = async (req, res) => {
  const { studentId, date, status } = req.body;

  if (!studentId || !date || !status) {
    return res.status(400).json({ success: false, message: 'Student, date, and status are required.' });
  }

  const validStatuses = ['Present', 'Absent', 'Leave'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid attendance status.' });
  }

  const student = await Student.findById(studentId);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  // Normalize date to start of day for accurate upsert mapping
  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);

  // Use findOneAndUpdate with upsert to prevent duplicates for the same student+date
  const record = await Attendance.findOneAndUpdate(
    { studentId, date: targetDate },
    { status },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate('studentId', 'studentId name rollNo');

  res.status(200).json({
    success: true,
    message: 'Attendance recorded successfully.',
    data: record,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Batch mark attendance (optional feature)
// @route   POST /api/attendance/batch
// @access  Admin, Warden
// ─────────────────────────────────────────────────────────────────────────────
const batchMarkAttendance = async (req, res) => {
  const { date, records } = req.body; 
  // records: [{ studentId, status }, ...]

  if (!date || !Array.isArray(records)) {
    return res.status(400).json({ success: false, message: 'Date and an array of records are required.' });
  }

  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);

  const bulkOps = records.map(record => ({
    updateOne: {
      filter: { studentId: record.studentId, date: targetDate },
      update: { status: record.status },
      upsert: true
    }
  }));

  if (bulkOps.length > 0) {
    await Attendance.bulkWrite(bulkOps);
  }

  res.status(200).json({
    success: true,
    message: `Batch attendance recorded for ${records.length} students.`,
  });
};

module.exports = {
  getAttendance,
  markAttendance,
  batchMarkAttendance
};
