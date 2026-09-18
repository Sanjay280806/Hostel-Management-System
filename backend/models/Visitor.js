const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    visitorName: {
      type: String,
      required: [true, 'Visitor name is required'],
      trim: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in time is required'],
      default: Date.now,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['In', 'Out'],
      default: 'In',
    },
  },
  { timestamps: true }
);

// Index on studentId for visitor log queries
visitorSchema.index({ studentId: 1 });

module.exports = mongoose.model('Visitor', visitorSchema);
