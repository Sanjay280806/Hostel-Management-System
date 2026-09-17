const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const feePaymentSchema = new mongoose.Schema(
  {
    allocationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Allocation',
      required: [true, 'Allocation reference is required'],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Pending',
    },
    receiptId: {
      type: String,
      unique: true,
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index on studentId for fast dues lookup
feePaymentSchema.index({ studentId: 1 });
feePaymentSchema.index({ status: 1 });

// Auto-generate receiptId when status is set to Paid
feePaymentSchema.pre('save', function () {
  if (this.status === 'Paid' && !this.receiptId) {
    this.receiptId = `RCP-${uuidv4().split('-')[0].toUpperCase()}`;
    this.paidAt = new Date();
  }
});

module.exports = mongoose.model('FeePayment', feePaymentSchema);
