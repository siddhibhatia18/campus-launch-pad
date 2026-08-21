import Project from '../models/Project.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';
import { calculateCandidateSkillMatch } from '../utils/matchingEngine.js';

// @desc    Create a new project idea
// @route   POST /api/projects
// @access  Private (Student/User)
export const createProject = async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      description,
      category,
      tags,
      deadline,
      teamSize,
      skillRequirements,
    } = req.body;

    if (!title || !shortDescription || !description || !category || !teamSize) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required project details and team size.',
      });
    }

    const parsedTeamSize = parseInt(teamSize, 10);
    if (isNaN(parsedTeamSize) || parsedTeamSize < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Team size must be at least 1.',
      });
    }

    // Format skill requirements (mapping Medium to Intermediate if needed)
    const formattedRequirements = (skillRequirements || []).map((reqItem) => ({
      skill: reqItem.skill.trim(),
      level: reqItem.level === 'Medium' ? 'Intermediate' : reqItem.level || 'Intermediate',
      requiredCount: parseInt(reqItem.requiredCount, 10) || 1,
      filledCount: 0,
    }));

    const project = new Project({
      creator: req.user._id,
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      category: category.trim(),
      tags: tags || [],
      deadline: deadline ? deadline.trim() : '',
      teamSize: parsedTeamSize,
      skillRequirements: formattedRequirements,
      // Automatically add creator as the first member
      teamMembers: [
        {
          user: req.user._id,
          role: 'Creator',
          joinedAt: new Date(),
        },
      ],
    });

    const savedProject = await project.save();
    const populatedProject = await Project.findById(savedProject._id)
      .populate('creator', 'name email')
      .populate('teamMembers.user', 'name email');

    res.status(201).json({
      status: 'success',
      message: 'Project idea created successfully!',
      project: populatedProject,
    });
  } catch (error) {
    console.error('CreateProject Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error creating project',
    });
  }
};

// @desc    Get all public / student project ideas
// @route   GET /api/projects
// @access  Public / Private
export const getProjects = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { shortDescription: searchRegex },
        { category: searchRegex },
        { 'skillRequirements.skill': searchRegex },
      ];
    }

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .populate('creator', 'name email')
      .populate('teamMembers.user', 'name email');

    // Batch fetch creator profiles for avatar enrichment
    const creatorIds = projects.map((p) => p.creator?._id).filter(Boolean);
    const creatorProfiles = await StudentProfile.find({ user: { $in: creatorIds } });
    const profileMap = new Map(creatorProfiles.map((cp) => [cp.user.toString(), cp]));

    const projectsWithAvatars = projects.map((p) => {
      const pObj = p.toObject();
      if (pObj.creator) {
        const cProfile = profileMap.get(pObj.creator._id.toString());
        pObj.creator.profileImageUrl = cProfile?.profileImageUrl || '';
      }
      return pObj;
    });

    res.json({
      status: 'success',
      count: projectsWithAvatars.length,
      projects: projectsWithAvatars,
    });
  } catch (error) {
    console.error('GetProjects Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error fetching projects',
    });
  }
};

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
// @access  Public / Private
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('teamMembers.user', 'name email');

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found',
      });
    }

    const projectObj = project.toObject();

    // Collect all involved user IDs for batch profile query
    const involvedUserIds = [
      project.creator?._id,
      ...project.teamMembers.map((m) => m.user?._id),
    ].filter(Boolean);

    const profiles = await StudentProfile.find({ user: { $in: involvedUserIds } });
    const profileMap = new Map(profiles.map((pr) => [pr.user.toString(), pr]));

    // Populate profile pictures and info for creator and team members
    if (projectObj.creator) {
      const cProfile = profileMap.get(projectObj.creator._id.toString());
      projectObj.creator.profileImageUrl = cProfile?.profileImageUrl || '';
      projectObj.creator.college = cProfile?.college || '';
    }

    projectObj.teamMembers = projectObj.teamMembers.map((member) => {
      const memProfile = member.user ? profileMap.get(member.user._id.toString()) : null;
      return {
        ...member,
        user: member.user
          ? {
              ...member.user,
              profileImageUrl: memProfile?.profileImageUrl || '',
              college: memProfile?.college || '',
              course: memProfile?.course || '',
            }
          : member.user,
      };
    });

    res.json({
      status: 'success',
      project: projectObj,
    });
  } catch (error) {
    console.error('GetProjectById Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error fetching project',
    });
  }
};

// @desc    Get current student's projects (Created and Joined)
// @route   GET /api/projects/me/all
// @access  Private (Student)
export const getMyProjects = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Projects created by current user
    const createdProjects = await Project.find({ creator: userId })
      .sort({ createdAt: -1 })
      .populate('creator', 'name email')
      .populate('teamMembers.user', 'name email');

    // 2. Projects joined by current user (where member is user, but user is not creator)
    const joinedProjects = await Project.find({
      'teamMembers.user': userId,
      creator: { $ne: userId },
    })
      .sort({ createdAt: -1 })
      .populate('creator', 'name email')
      .populate('teamMembers.user', 'name email');

    // Collect all involved user IDs
    const allUserIds = new Set();
    [...createdProjects, ...joinedProjects].forEach((p) => {
      if (p.creator?._id) allUserIds.add(p.creator._id.toString());
      p.teamMembers.forEach((m) => {
        if (m.user?._id) allUserIds.add(m.user._id.toString());
      });
    });

    const allProfiles = await StudentProfile.find({ user: { $in: Array.from(allUserIds) } });
    const profileMap = new Map(allProfiles.map((pr) => [pr.user.toString(), pr]));

    // Populate avatars helper
    const enrichProjects = (list) => {
      return list.map((p) => {
        const pObj = p.toObject();
        if (pObj.creator) {
          const cProfile = profileMap.get(pObj.creator._id.toString());
          pObj.creator.profileImageUrl = cProfile?.profileImageUrl || '';
        }
        // Enrich team members avatars
        pObj.teamMembers = pObj.teamMembers.map((m) => {
          const mProfile = m.user ? profileMap.get(m.user._id.toString()) : null;
          return {
            ...m,
            user: m.user
              ? {
                  ...m.user,
                  profileImageUrl: mProfile?.profileImageUrl || '',
                }
              : m.user,
          };
        });
        // Find student's specific role in this project
        const myMemberRecord = pObj.teamMembers.find(
          (m) => m.user?._id?.toString() === userId.toString()
        );
        pObj.myRole = myMemberRecord?.role || 'Team Member';
        return pObj;
      });
    };

    const formattedCreated = enrichProjects(createdProjects);
    const formattedJoined = enrichProjects(joinedProjects);

    // Batch fetch invitation counts for creator projects
    const createdProjectIds = formattedCreated.map((p) => p._id);
    const allInvites = await Invitation.find({ project: { $in: createdProjectIds } }).populate('student', 'name email');

    const invitesByProject = new Map();
    allInvites.forEach((inv) => {
      const pId = inv.project.toString();
      if (!invitesByProject.has(pId)) invitesByProject.set(pId, []);
      invitesByProject.get(pId).push(inv);
    });

    const createdWithInvites = formattedCreated.map((p) => {
      const invites = invitesByProject.get(p._id.toString()) || [];
      const pending = invites.filter((i) => i.status === 'Pending');
      const accepted = invites.filter((i) => i.status === 'Accepted');
      const declined = invites.filter((i) => i.status === 'Declined');
      return {
        ...p,
        invitationStats: {
          total: invites.length,
          pending: pending.length,
          accepted: accepted.length,
          declined: declined.length,
        },
        invitations: invites,
      };
    });

    res.json({
      status: 'success',
      created: createdWithInvites,
      joined: formattedJoined,
    });
  } catch (error) {
    console.error('GetMyProjects Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error fetching your projects',
    });
  }
};

// @desc    Find matched candidate students grouped by requirement for a project
// @route   GET /api/projects/:id/candidates
// @access  Private (Project Creator)
export const getProjectCandidates = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found',
      });
    }

    // Only project creator can view candidate recommendations
    if (project.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the project creator can view and invite candidate matches.',
      });
    }

    // Get all team member user IDs to exclude from candidate lists
    const existingMemberIds = project.teamMembers.map((m) => m.user.toString());

    // Fetch all student users and their profiles
    const studentUsers = await User.find({ role: 'student' }).select('name email role createdAt');
    const studentUserIds = studentUsers.map((u) => u._id);

    const allProfiles = await StudentProfile.find({ user: { $in: studentUserIds } })
      .populate('user', 'name email role createdAt');

    const profileMap = new Map();
    allProfiles.forEach((p) => {
      if (p.user?._id) {
        profileMap.set(p.user._id.toString(), p);
      }
    });

    // Build eligible profiles excluding current team members
    const eligibleProfiles = studentUsers
      .filter((u) => !existingMemberIds.includes(u._id.toString()))
      .map((u) => {
        const prof = profileMap.get(u._id.toString());
        return {
          user: u,
          college: prof?.college || '',
          course: prof?.course || '',
          year: prof?.year || '',
          bio: prof?.bio || '',
          skills: prof?.skills || [],
          interestedDomains: prof?.interestedDomains || [],
          interests: prof?.interests || [],
          projects: prof?.projects || [],
          profileImageUrl: prof?.profileImageUrl || '',
          profileCompletion: prof?.profileCompletion || 0,
        };
      });

    // Fetch all existing invitations for this project to determine status
    const existingInvitations = await Invitation.find({ project: project._id });

    // Group candidates by each skill requirement
    const groupedRequirements = project.skillRequirements.map((reqItem) => {
      const candidates = eligibleProfiles
        .map((prof) => {
          const matchResult = calculateCandidateSkillMatch(
            prof,
            reqItem.skill,
            reqItem.level,
            project.category
          );

          // Check if student has an existing invitation for this requirement
          const existingInvite = existingInvitations.find(
            (inv) =>
              inv.student.toString() === prof.user._id.toString() &&
              inv.requirementId.toString() === reqItem._id.toString()
          );

          return {
            student: {
              id: prof.user._id,
              _id: prof.user._id,
              name: prof.user.name,
              email: prof.user.email,
              college: prof.college,
              course: prof.course,
              year: prof.year,
              profileImageUrl: prof.profileImageUrl || '',
              skills: prof.skills,
              profileCompletion: prof.profileCompletion,
            },
            matchedSkillName: matchResult.matchedSkillName,
            studentLevel: matchResult.studentLevel,
            hasSkill: matchResult.hasSkill,
            matchScore: matchResult.matchScore,
            matchReasons: matchResult.matchReasons,
            invitation: existingInvite
              ? {
                  id: existingInvite._id,
                  _id: existingInvite._id,
                  status: existingInvite.status,
                  createdAt: existingInvite.createdAt,
                }
              : null,
          };
        })
        .sort((a, b) => {
          // Sort by hasSkill first, then by matchScore descending
          if (a.hasSkill && !b.hasSkill) return -1;
          if (!a.hasSkill && b.hasSkill) return 1;
          return b.matchScore - a.matchScore;
        });

      return {
        requirementId: reqItem._id,
        skill: reqItem.skill,
        level: reqItem.level,
        requiredCount: reqItem.requiredCount,
        filledCount: reqItem.filledCount,
        isFilled: reqItem.filledCount >= reqItem.requiredCount,
        candidates,
      };
    });

    res.json({
      status: 'success',
      project: {
        id: project._id,
        title: project.title,
        teamSize: project.teamSize,
        currentTeamCount: project.teamMembers.length,
        isTeamFull: project.teamMembers.length >= project.teamSize,
      },
      requirements: groupedRequirements,
    });
  } catch (error) {
    console.error('GetProjectCandidates Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error computing candidate recommendations',
    });
  }
};

// @desc    Delete a project idea
// @route   DELETE /api/projects/:id
// @access  Private (Project Creator)
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found',
      });
    }

    if (project.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized to delete this project',
      });
    }

    await Project.findByIdAndDelete(req.params.id);
    await Invitation.deleteMany({ project: req.params.id });

    res.json({
      status: 'success',
      message: 'Project and associated invitations deleted successfully',
    });
  } catch (error) {
    console.error('DeleteProject Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error deleting project',
    });
  }
};
