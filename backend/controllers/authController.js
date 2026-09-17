const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helper: Sign JWT ─────────────────────────────────────────────────────────
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// ─── Helper: Build safe user object (strip passwordHash) ──────────────────────
const sanitizeUser = (user) => ({
  id: user._id,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  const { email, password, role } = req.body;

  // --- Input validation ---
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters.',
    });
  }

  // Prevent external callers from self-assigning Admin/Warden roles
  const allowedSelfRegisterRoles = ['Student', 'Guest'];
  const assignedRole =
    role && allowedSelfRegisterRoles.includes(role) ? role : 'Student';

  // --- Hash password ---
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // --- Create user ---
  const user = await User.create({ email, passwordHash, role: assignedRole });

  const token = signToken(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully.',
    token,
    user: sanitizeUser(user),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Login user & return JWT
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  // --- Input validation ---
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.',
    });
  }

  // --- Find user (include passwordHash for comparison) ---
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials.',
    });
  }

  // --- Compare passwords ---
  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials.',
    });
  }

  const token = signToken(user);

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    token,
    user: sanitizeUser(user),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get currently authenticated user profile
// @route   GET /api/auth/me
// @access  Private (requires valid JWT)
// ─────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  // req.user is populated by the protect middleware
  res.status(200).json({
    success: true,
    user: sanitizeUser(req.user),
  });
};

module.exports = { register, login, getMe };
