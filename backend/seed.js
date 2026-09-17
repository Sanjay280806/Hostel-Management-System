/**
 * seed.js – Creates the initial Admin user in the database.
 * Run once with: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const ADMIN_EMAIL    = 'admin@hms.com';
const ADMIN_PASSWORD = 'admin123';

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB:', process.env.MONGO_URI);

  // Check if admin already exists
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin already exists: ${ADMIN_EMAIL} (role: ${existing.role})`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await User.create({
    email: ADMIN_EMAIL,
    passwordHash,
    role: 'Admin',
  });

  console.log('✅ Admin user created successfully!');
  console.log('   Email   :', admin.email);
  console.log('   Password: admin123');
  console.log('   Role    :', admin.role);
  console.log('   ID      :', admin._id);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
