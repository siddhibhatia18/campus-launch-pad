import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';

// Helper to generate signed JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'campus_launch_pad_super_secret_jwt_dev_key_2026',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Register a new user & create initial profile
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, college, course, year } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, email, and password',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        status: 'error',
        message: 'An account with this email address already exists',
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role === 'admin' ? 'admin' : 'student',
    });

    let profile = null;
    // If student, initialize profile
    if (user.role === 'student') {
      profile = await StudentProfile.create({
        user: user._id,
        college: college ? college.trim() : '',
        course: course ? course.trim() : '',
        year: year ? year.trim() : '',
        skills: [],
        interestedDomains: [],
        interests: [],
        projects: [],
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImageUrl: user.profileImageUrl || profile?.profileImageUrl || '',
      },
      profile,
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id });
      // If profile doesn't exist, create it on the fly
      if (!profile) {
        profile = await StudentProfile.create({ user: user._id });
      }
    }

    const token = generateToken(user._id);

    res.json({
      status: 'success',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImageUrl: user.profileImageUrl || profile?.profileImageUrl || '',
      },
      profile,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Get current logged in user & profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id });
    }

    res.json({
      status: 'success',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImageUrl: user.profileImageUrl || profile?.profileImageUrl || '',
      },
      profile,
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error fetching user profile',
    });
  }
};
