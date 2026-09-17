const FeePayment = require('../models/FeePayment');
const Allocation = require('../models/Allocation');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all fees (with optional status filter)
// @route   GET /api/fees?status=Paid|Pending
// @access  Admin, Warden
// ─────────────────────────────────────────────────────────────────────────────
const getAllFees = async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};

  const fees = await FeePayment.find(query)
    .populate({ path: 'studentId', select: 'studentId name rollNo' })
    .populate({
      path: 'allocationId',
      populate: { path: 'roomId', select: 'roomNumber' }
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: fees.length,
    data: fees,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a single fee by ID
// @route   GET /api/fees/:id
// @access  Admin, Warden
// ─────────────────────────────────────────────────────────────────────────────
const getFeeById = async (req, res) => {
  const fee = await FeePayment.findById(req.params.id)
    .populate({ path: 'studentId', select: 'studentId name rollNo email contact' })
    .populate({
      path: 'allocationId',
      populate: { path: 'roomId', select: 'roomNumber capacity' }
    });

  if (!fee) {
    return res.status(404).json({ success: false, message: 'Fee record not found.' });
  }

  res.status(200).json({ success: true, data: fee });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new fee record
// @route   POST /api/fees
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
const createFee = async (req, res) => {
  const { allocationId, amount } = req.body;

  if (!allocationId || amount === undefined) {
    return res.status(400).json({
      success: false,
      message: 'allocationId and amount are required.',
    });
  }

  // Get the allocation to automatically link the student
  const allocation = await Allocation.findById(allocationId);
  if (!allocation) {
    return res.status(404).json({ success: false, message: 'Allocation not found.' });
  }

  const fee = await FeePayment.create({
    allocationId,
    studentId: allocation.studentId,
    amount,
    status: 'Pending',
  });

  const populated = await fee.populate([
    { path: 'studentId', select: 'studentId name rollNo' },
    { path: 'allocationId', populate: { path: 'roomId', select: 'roomNumber' } }
  ]);

  res.status(201).json({
    success: true,
    message: 'Fee record created successfully.',
    data: populated,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Mark a fee as Paid
// @route   PUT /api/fees/:id/pay
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
const markFeeAsPaid = async (req, res) => {
  const fee = await FeePayment.findById(req.params.id);

  if (!fee) {
    return res.status(404).json({ success: false, message: 'Fee record not found.' });
  }

  if (fee.status === 'Paid') {
    return res.status(400).json({
      success: false,
      message: 'This fee is already marked as Paid.',
    });
  }

  fee.status = 'Paid';
  await fee.save(); // pre-save hook automatically generates receiptId and paidAt

  const populated = await fee.populate([
    { path: 'studentId', select: 'studentId name rollNo email' },
    { path: 'allocationId', populate: { path: 'roomId', select: 'roomNumber' } }
  ]);

  res.status(200).json({
    success: true,
    message: 'Payment recorded successfully.',
    data: populated,
  });
};

module.exports = {
  getAllFees,
  getFeeById,
  createFee,
  markFeeAsPaid,
};
