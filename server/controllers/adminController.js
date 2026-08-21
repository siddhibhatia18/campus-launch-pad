import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';

// @desc    Get real platform statistics from database
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalOpportunities = await Opportunity.countDocuments();
    const activeApplications = await Application.countDocuments();

    // Calculate unique skills count from actual profiles
    const profiles = await StudentProfile.find({}, 'skills');
    const skillSet = new Set();
    profiles.forEach((p) => {
      if (p.skills && Array.isArray(p.skills)) {
        p.skills.forEach((s) => {
          if (s.name) skillSet.add(s.name.trim().toLowerCase());
        });
      }
    });

    res.json({
      status: 'success',
      stats: {
        totalStudents,
        totalOpportunities,
        activeApplications,
        totalSkills: skillSet.size,
      },
    });
  } catch (error) {
    console.error('GetAdminStats Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error fetching admin statistics',
    });
  }
};

// @desc    Get all registered students with profile data
// @route   GET /api/admin/students
// @access  Private (Admin)
export const getRegisteredStudents = async (req, res) => {
  try {
    const studentUsers = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    const studentIds = studentUsers.map((u) => u._id);
    const profiles = await StudentProfile.find({ user: { $in: studentIds } });

    const profileMap = new Map();
    profiles.forEach((p) => {
      profileMap.set(p.user.toString(), p);
    });

    const students = studentUsers.map((u) => {
      const p = profileMap.get(u._id.toString());
      return {
        id: u._id,
        name: u.name,
        email: u.email,
        college: p?.college || 'Not specified',
        course: p?.course || 'Not specified',
        year: p?.year || 'Not specified',
        skills: p?.skills ? p.skills.map((s) => s.name) : [],
        profileImageUrl: p?.profileImageUrl || '',
        profileCompletion: p?.profileCompletion || 0,
        joinedAt: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : 'Recent',
      };
    });

    res.json({
      status: 'success',
      count: students.length,
      students,
    });
  } catch (error) {
    console.error('GetRegisteredStudents Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error fetching registered students',
    });
  }
};
