const Room = require('../models/Room');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all rooms (with optional status filter)
// @route   GET /api/rooms?status=Available|Full
// @access  Admin, Warden, Student (read)
// ─────────────────────────────────────────────────────────────────────────────
const getAllRooms = async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};

  const rooms = await Room.find(query).sort({ roomNumber: 1 });

  res.status(200).json({
    success: true,
    count: rooms.length,
    data: rooms,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Admin, Warden
// ─────────────────────────────────────────────────────────────────────────────
const getRoomById = async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found.' });
  }
  res.status(200).json({ success: true, data: room });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new room
// @route   POST /api/rooms
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
const createRoom = async (req, res) => {
  const { roomNumber, capacity } = req.body;

  if (!roomNumber || !capacity) {
    return res.status(400).json({
      success: false,
      message: 'roomNumber and capacity are required.',
    });
  }

  if (capacity < 1) {
    return res.status(400).json({
      success: false,
      message: 'Capacity must be at least 1.',
    });
  }

  const room = await Room.create({ roomNumber, capacity });

  res.status(201).json({
    success: true,
    message: 'Room created successfully.',
    data: room,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update room details (capacity / roomNumber)
// @route   PUT /api/rooms/:id
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
const updateRoom = async (req, res) => {
  const { roomNumber, capacity } = req.body;

  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found.' });
  }

  // Prevent reducing capacity below current occupancy
  if (capacity !== undefined && Number(capacity) < room.occupiedCount) {
    return res.status(400).json({
      success: false,
      message: `Cannot reduce capacity below current occupancy (${room.occupiedCount}).`,
    });
  }

  if (roomNumber) room.roomNumber = roomNumber;
  if (capacity !== undefined) room.capacity = Number(capacity);

  await room.save(); // pre-save hook will update status

  res.status(200).json({
    success: true,
    message: 'Room updated successfully.',
    data: room,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a room (only if unoccupied)
// @route   DELETE /api/rooms/:id
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
const deleteRoom = async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found.' });
  }

  if (room.occupiedCount > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete a room with active occupants. Please vacate all allocations first.',
    });
  }

  await Room.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Room deleted successfully.',
  });
};

module.exports = { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom };
