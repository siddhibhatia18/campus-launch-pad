import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get current student's profile
// @route   GET /api/profile
// @access  Private (Student)
export const getProfile = async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user._id }).populate(
      'user',
      'name email role createdAt'
    );

    // If profile record doesn't exist yet, create one
    if (!profile) {
      profile = await StudentProfile.create({ user: req.user._id });
      profile = await profile.populate('user', 'name email role createdAt');
    }

    // Ensure completion score is recalculated
    profile.calculateCompletion();
    await profile.save();

    res.json({
      status: 'success',
      profile,
    });
  } catch (error) {
    console.error('GetProfile Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error fetching profile',
    });
  }
};

// @desc    Update current student's profile
// @route   PUT /api/profile
// @access  Private (Student)
export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      college,
      course,
      year,
      bio,
      skills,
      interestedDomains,
      interests,
      projects,
      profileImageUrl,
    } = req.body;

    // If student updated their display name or profileImageUrl, update User document
    const userUpdates = {};
    if (name && name.trim()) userUpdates.name = name.trim();
    if (profileImageUrl !== undefined) userUpdates.profileImageUrl = profileImageUrl;

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userUpdates);
    }

    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new StudentProfile({ user: req.user._id });
    }

    if (college !== undefined) profile.college = college.trim();
    if (course !== undefined) profile.course = course.trim();
    if (year !== undefined) profile.year = year.trim();
    if (bio !== undefined) profile.bio = bio.trim();
    if (skills !== undefined) profile.skills = skills;
    if (interestedDomains !== undefined) profile.interestedDomains = interestedDomains;
    if (interests !== undefined) profile.interests = interests;
    if (projects !== undefined) profile.projects = projects;
    if (profileImageUrl !== undefined) profile.profileImageUrl = profileImageUrl;

    // Recalculate dynamic completion score
    profile.calculateCompletion();
    await profile.save();

    profile = await profile.populate('user', 'name email role profileImageUrl createdAt');

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    console.error('UpdateProfile Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error updating profile',
    });
  }
};

// @desc    Upload profile picture
// @route   POST /api/profile/picture
// @access  Private (Student)
export const uploadPicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid image file.',
      });
    }

    const imageUrl = `/uploads/profiles/${req.file.filename}`;

    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new StudentProfile({ user: req.user._id });
    }

    // If there was an existing local picture, clean it up
    if (profile.profileImageUrl && profile.profileImageUrl.startsWith('/uploads/profiles/')) {
      const oldFilename = path.basename(profile.profileImageUrl);
      const oldPath = path.join(__dirname, '../uploads/profiles', oldFilename);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (err) {
          console.error('Error deleting old avatar:', err);
        }
      }
    }

    profile.profileImageUrl = imageUrl;
    profile.calculateCompletion();
    await profile.save();

    // Also sync to User document for creator/member/invitation lookups
    await User.findByIdAndUpdate(req.user._id, { profileImageUrl: imageUrl });

    profile = await profile.populate('user', 'name email role profileImageUrl createdAt');

    res.json({
      status: 'success',
      message: 'Profile picture uploaded successfully',
      profileImageUrl: imageUrl,
      profile,
    });
  } catch (error) {
    console.error('UploadPicture Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error uploading profile picture',
    });
  }
};

// @desc    Delete/Remove profile picture
// @route   DELETE /api/profile/picture
// @access  Private (Student)
export const removePicture = async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found',
      });
    }

    if (profile.profileImageUrl && profile.profileImageUrl.startsWith('/uploads/profiles/')) {
      const oldFilename = path.basename(profile.profileImageUrl);
      const oldPath = path.join(__dirname, '../uploads/profiles', oldFilename);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (err) {
          console.error('Error removing avatar file:', err);
        }
      }
    }

    profile.profileImageUrl = '';
    profile.calculateCompletion();
    await profile.save();

    await User.findByIdAndUpdate(req.user._id, { profileImageUrl: '' });

    profile = await profile.populate('user', 'name email role profileImageUrl createdAt');

    res.json({
      status: 'success',
      message: 'Profile picture removed successfully',
      profile,
    });
  } catch (error) {
    console.error('RemovePicture Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error removing profile picture',
    });
  }
};

// @desc    Discover and search all registered students
// @route   GET /api/profile/students
// @access  Private (Student/User)
export const getStudents = async (req, res) => {
  try {
    const { search, skill, domain, college } = req.query;

    const studentUsers = await User.find({ role: 'student' }).select('name email role createdAt');
    const studentUserIds = studentUsers.map((u) => u._id);

    const profiles = await StudentProfile.find({ user: { $in: studentUserIds } })
      .populate('user', 'name email role createdAt');

    const profileMap = new Map();
    profiles.forEach((p) => {
      if (p.user?._id) {
        profileMap.set(p.user._id.toString(), p);
      }
    });

    let studentList = studentUsers.map((user) => {
      const p = profileMap.get(user._id.toString());
      return {
        id: user._id,
        _id: user._id,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        name: user.name,
        email: user.email,
        college: p?.college || '',
        course: p?.course || '',
        year: p?.year || '',
        bio: p?.bio || '',
        skills: p?.skills || [],
        interestedDomains: p?.interestedDomains || [],
        interests: p?.interests || [],
        projects: p?.projects || [],
        profileImageUrl: p?.profileImageUrl || '',
        profileCompletion: p?.profileCompletion || 0,
        joinedAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
        isCurrentUser: req.user && user._id.toString() === req.user._id.toString(),
      };
    });

    // Apply filtering
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      studentList = studentList.filter((std) => {
        const matchName = std.name?.toLowerCase().includes(s);
        const matchCollege = std.college?.toLowerCase().includes(s);
        const matchCourse = std.course?.toLowerCase().includes(s);
        const matchBio = std.bio?.toLowerCase().includes(s);
        const matchSkills = std.skills?.some((sk) => sk.name?.toLowerCase().includes(s));
        const matchDomains = std.interestedDomains?.some((d) => d.toLowerCase().includes(s));
        const matchInterests = std.interests?.some((i) => i.toLowerCase().includes(s));
        return matchName || matchCollege || matchCourse || matchBio || matchSkills || matchDomains || matchInterests;
      });
    }

    if (skill && skill !== 'All') {
      const sLower = skill.trim().toLowerCase();
      studentList = studentList.filter((std) =>
        std.skills?.some((sk) => sk.name?.toLowerCase().includes(sLower) || sLower.includes(sk.name?.toLowerCase()))
      );
    }

    if (domain && domain !== 'All') {
      const dLower = domain.trim().toLowerCase();
      studentList = studentList.filter((std) =>
        std.interestedDomains?.some((dom) => dom.toLowerCase().includes(dLower) || dLower.includes(dom.toLowerCase()))
      );
    }

    if (college && college.trim()) {
      const cLower = college.trim().toLowerCase();
      studentList = studentList.filter((std) => std.college?.toLowerCase().includes(cLower));
    }

    res.json({
      status: 'success',
      count: studentList.length,
      students: studentList,
    });
  } catch (error) {
    console.error('GetStudents Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error fetching student directory',
    });
  }
};

// @desc    Get public profile of a specific student by user ID
// @route   GET /api/profile/students/:id
// @access  Private (Student/User)
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if id is a User ID or StudentProfile ID
    let user = await User.findById(id).select('name email role createdAt');
    let profile = null;

    if (user) {
      profile = await StudentProfile.findOne({ user: user._id }).populate('user', 'name email role createdAt');
    } else {
      profile = await StudentProfile.findById(id).populate('user', 'name email role createdAt');
      if (profile?.user) {
        user = profile.user;
      }
    }

    if (!user && !profile) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found',
      });
    }

    // Fetch projects pitched by this student
    const Project = (await import('../models/Project.js')).default;
    const pitchedProjects = await Project.find({ creator: user ? user._id : profile.user._id })
      .select('title shortDescription category teamSize teamMembers deadline skillRequirements status');

    const studentData = {
      id: user ? user._id : profile.user._id,
      _id: user ? user._id : profile.user._id,
      name: user ? user.name : profile.user.name,
      email: user ? user.email : profile.user.email,
      role: user ? user.role : 'student',
      college: profile?.college || '',
      course: profile?.course || '',
      year: profile?.year || '',
      bio: profile?.bio || '',
      skills: profile?.skills || [],
      interestedDomains: profile?.interestedDomains || [],
      interests: profile?.interests || [],
      projects: profile?.projects || [],
      profileImageUrl: profile?.profileImageUrl || '',
      profileCompletion: profile?.profileCompletion || 0,
      joinedAt: user?.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
      pitchedProjects: pitchedProjects || [],
      isCurrentUser: req.user && (user ? user._id.toString() === req.user._id.toString() : false),
    };

    res.json({
      status: 'success',
      student: studentData,
    });
  } catch (error) {
    console.error('GetStudentById Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error fetching student profile',
    });
  }
};

