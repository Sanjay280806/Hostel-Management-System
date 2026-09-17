const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    contact: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    rollNo: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Index for fast lookup on userId and rollNo
studentSchema.index({ userId: 1 });
studentSchema.index({ rollNo: 1 });

// Auto-generate studentId before saving (Mongoose 9: async hooks resolve via Promise, no next())
studentSchema.pre('save', async function () {
  if (!this.studentId) {
    const count = await mongoose.model('Student').countDocuments();
    this.studentId = `STU${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Student', studentSchema);
