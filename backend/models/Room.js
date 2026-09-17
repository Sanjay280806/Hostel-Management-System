const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Room capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    occupiedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Available', 'Full'],
      default: 'Available',
    },
  },
  { timestamps: true }
);

// Auto-update status based on occupiedCount vs capacity
roomSchema.pre('save', function () {
  this.status = this.occupiedCount >= this.capacity ? 'Full' : 'Available';
});

module.exports = mongoose.model('Room', roomSchema);
