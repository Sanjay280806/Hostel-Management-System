const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room reference is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Active', 'Vacated'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

// Index on studentId and roomId for allocation lookups
allocationSchema.index({ studentId: 1 });
allocationSchema.index({ roomId: 1 });

module.exports = mongoose.model('Allocation', allocationSchema);
