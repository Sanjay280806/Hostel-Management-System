const Allocation = require('../models/Allocation');
const Room = require('../models/Room');
const Student = require('../models/Student');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all allocations (with optional status filter)
// @route   GET /api/allocations?status=Active|Vacated
// @access  Admin, Warden
// ─────────────────────────────────────────────────────────────────────────────
const getAllAllocations = async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};

  const allocations = await Allocation.find(query)
    .populate({ path: 'studentId', select: 'studentId name rollNo contact' })
    .populate({ path: 'roomId', select: 'roomNumber capacity occupiedCount status' })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: allocations.length,
    data: allocations,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a single allocation by ID
// @route   GET /api/allocations/:id
// @access  Admin, Warden
// ─────────────────────────────────────────────────────────────────────────────
const getAllocationById = async (req, res) => {
  const allocation = await Allocation.findById(req.params.id)
    .populate({ path: 'studentId', select: 'studentId name rollNo contact' })
    .populate({ path: 'roomId', select: 'roomNumber capacity occupiedCount status' });

  if (!allocation) {
    return res.status(404).json({ success: false, message: 'Allocation not found.' });
  }

  res.status(200).json({ success: true, data: allocation });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Allocate a room to a student
// @route   POST /api/allocations
// @access  Admin
//
// Business Rules (AGENTS.md):
//  1. occupiedCount < capacity  →  Room must not be Full
//  2. Student must not already have an Active allocation
//  3. Increment room occupiedCount on successful allocation
// ─────────────────────────────────────────────────────────────────────────────
const allocateRoom = async (req, res) => {
  const { studentId, roomId, startDate, endDate } = req.body;

  if (!studentId || !roomId) {
    return res.status(400).json({
      success: false,
      message: 'studentId and roomId are required.',
    });
  }

  // ── Rule 1: Verify student exists ─────────────────────────────────────────
  const student = await Student.findById(studentId);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  // ── Rule 2: Check student does not already have an active allocation ───────
  const existingAllocation = await Allocation.findOne({
    studentId,
    status: 'Active',
  });
  if (existingAllocation) {
    return res.status(409).json({
      success: false,
      message: 'This student already has an active room allocation. Please vacate the existing allocation first.',
    });
  }

  // ── Rule 3: Verify room exists and has capacity ───────────────────────────
  const room = await Room.findById(roomId);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found.' });
  }

  if (room.occupiedCount >= room.capacity) {
    return res.status(400).json({
      success: false,
      message: `Room ${room.roomNumber} is full (${room.occupiedCount}/${room.capacity}).`,
    });
  }

  // ── Create allocation ─────────────────────────────────────────────────────
  const allocation = await Allocation.create({
    studentId,
    roomId,
    startDate: startDate || Date.now(),
    endDate: endDate || null,
    status: 'Active',
  });

  // ── Increment occupiedCount ───────────────────────────────────────────────
  room.occupiedCount += 1;
  await room.save(); // pre-save hook will auto-update room.status

  const populated = await allocation.populate([
    { path: 'studentId', select: 'studentId name rollNo contact' },
    { path: 'roomId', select: 'roomNumber capacity occupiedCount status' },
  ]);

  res.status(201).json({
    success: true,
    message: `Room ${room.roomNumber} successfully allocated to ${student.name}.`,
    data: populated,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Vacate a room allocation
// @route   PUT /api/allocations/:id/vacate
// @access  Admin
//
// Business Rule: Decrement room occupiedCount on vacate
// ─────────────────────────────────────────────────────────────────────────────
const vacateRoom = async (req, res) => {
  const allocation = await Allocation.findById(req.params.id);

  if (!allocation) {
    return res.status(404).json({ success: false, message: 'Allocation not found.' });
  }

  if (allocation.status === 'Vacated') {
    return res.status(400).json({
      success: false,
      message: 'This allocation is already vacated.',
    });
  }

  // ── Update allocation status ──────────────────────────────────────────────
  allocation.status = 'Vacated';
  allocation.endDate = req.body.endDate || Date.now();
  await allocation.save();

  // ── Decrement occupiedCount ───────────────────────────────────────────────
  const room = await Room.findById(allocation.roomId);
  if (room && room.occupiedCount > 0) {
    room.occupiedCount -= 1;
    await room.save(); // pre-save hook auto-updates room.status
  }

  const populated = await allocation.populate([
    { path: 'studentId', select: 'studentId name rollNo contact' },
    { path: 'roomId', select: 'roomNumber capacity occupiedCount status' },
  ]);

  res.status(200).json({
    success: true,
    message: 'Room vacated successfully.',
    data: populated,
  });
};

module.exports = {
  getAllAllocations,
  getAllocationById,
  allocateRoom,
  vacateRoom,
};
