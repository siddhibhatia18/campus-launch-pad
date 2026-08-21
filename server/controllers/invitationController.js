import Invitation from '../models/Invitation.js';
import Project from '../models/Project.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import { calculateCandidateSkillMatch } from '../utils/matchingEngine.js';

// @desc    Send team invitation or join request for a specific project requirement
// @route   POST /api/invitations
// @access  Private (Student/Creator)
export const sendInvitation = async (req, res) => {
  try {
    const { projectId, studentId, requirementId, skill, level, matchScore } = req.body;

    if (!projectId || !requirementId || !skill) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required invitation parameters (projectId, requirementId, skill).',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found.',
      });
    }

    const isCreator = project.creator.toString() === req.user._id.toString();

    // Determine target student, sender, and recipient
    let targetStudentId;
    let senderId = req.user._id;
    let recipientId;

    if (isCreator) {
      // Creator inviting a candidate
      if (!studentId) {
        return res.status(400).json({
          status: 'error',
          message: 'Please specify the student to invite.',
        });
      }
      if (studentId.toString() === req.user._id.toString()) {
        return res.status(400).json({
          status: 'error',
          message: 'You cannot send an invitation to yourself.',
        });
      }
      targetStudentId = studentId;
      recipientId = studentId;
    } else {
      // Student sending join request / invitation to project creator
      targetStudentId = req.user._id;
      recipientId = project.creator;
    }

    // Verify team overall capacity
    if (project.teamMembers.length >= project.teamSize) {
      return res.status(400).json({
        status: 'error',
        message: 'Project team is already at full capacity.',
      });
    }

    // Verify requirement exists and has available positions
    const reqItem = project.skillRequirements.id(requirementId);
    if (!reqItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Skill requirement not found on this project.',
      });
    }

    if (reqItem.filledCount >= reqItem.requiredCount) {
      return res.status(400).json({
        status: 'error',
        message: `The position for "${reqItem.skill}" is already filled.`,
      });
    }

    // Check if student is already a team member
    const isAlreadyMember = project.teamMembers.some(
      (m) => m.user.toString() === targetStudentId.toString()
    );
    if (isAlreadyMember) {
      return res.status(400).json({
        status: 'error',
        message: isCreator
          ? 'This student is already a member of the project team.'
          : 'You are already a member of this project team.',
      });
    }

    // Check for existing pending invitation
    const existingPending = await Invitation.findOne({
      project: projectId,
      student: targetStudentId,
      requirementId,
      status: 'Pending',
    });

    if (existingPending) {
      return res.status(400).json({
        status: 'error',
        message: 'An active pending invitation already exists for this role.',
      });
    }

    // Compute match score if not provided
    let calculatedScore = matchScore;
    if (!calculatedScore) {
      const studentProf = await StudentProfile.findOne({ user: targetStudentId });
      const matchResult = calculateCandidateSkillMatch(
        studentProf,
        skill,
        level || reqItem.level,
        project.category
      );
      calculatedScore = matchResult.matchScore;
    }

    const invitation = new Invitation({
      project: projectId,
      creator: project.creator,
      student: targetStudentId,
      sender: senderId,
      recipient: recipientId,
      requirementId,
      skill: skill.trim(),
      level: level || reqItem.level,
      matchScore: calculatedScore || 75,
      status: 'Pending',
    });

    await invitation.save();

    res.status(201).json({
      status: 'success',
      message: isCreator
        ? 'Team invitation sent to candidate successfully!'
        : 'Request to join project team sent to project owner successfully!',
      invitation,
    });
  } catch (error) {
    console.error('SendInvitation Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error sending team invitation',
    });
  }
};

// @desc    Get all invitations for the logged-in student (incoming and sent)
// @route   GET /api/invitations/me
// @access  Private (Student)
export const getMyInvitations = async (req, res) => {
  try {
    const userId = req.user._id;

    const invitations = await Invitation.find({
      $or: [
        { recipient: userId },
        { student: userId },
        { creator: userId },
        { sender: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'project',
        select: 'title shortDescription category teamSize teamMembers deadline',
      })
      .populate({
        path: 'creator',
        select: 'name email',
      })
      .populate({
        path: 'student',
        select: 'name email',
      })
      .populate({
        path: 'sender',
        select: 'name email',
      })
      .populate({
        path: 'recipient',
        select: 'name email',
      });

    // Batch enrich profiles for all involved users
    const allUserIds = new Set();
    invitations.forEach((inv) => {
      if (inv.creator?._id) allUserIds.add(inv.creator._id.toString());
      if (inv.student?._id) allUserIds.add(inv.student._id.toString());
      if (inv.sender?._id) allUserIds.add(inv.sender._id.toString());
      if (inv.recipient?._id) allUserIds.add(inv.recipient._id.toString());
    });

    const profiles = await StudentProfile.find({ user: { $in: Array.from(allUserIds) } });
    const profileMap = new Map(profiles.map((p) => [p.user.toString(), p]));

    const currentStudentProfile = profileMap.get(userId.toString());

    const invitationsWithDetails = invitations.map((inv) => {
      const invObj = inv.toObject();

      const creatorProfile = invObj.creator?._id ? profileMap.get(invObj.creator._id.toString()) : null;
      const studentProfile = invObj.student?._id ? profileMap.get(invObj.student._id.toString()) : null;
      const senderProfile = invObj.sender?._id ? profileMap.get(invObj.sender._id.toString()) : null;

      if (invObj.creator) {
        invObj.creator.profileImageUrl = creatorProfile?.profileImageUrl || '';
        invObj.creator.college = creatorProfile?.college || '';
      }

      if (invObj.student) {
        invObj.student.profileImageUrl = studentProfile?.profileImageUrl || '';
        invObj.student.college = studentProfile?.college || '';
        invObj.student.course = studentProfile?.course || '';
      }

      if (invObj.sender) {
        invObj.sender.profileImageUrl = senderProfile?.profileImageUrl || '';
        invObj.sender.college = senderProfile?.college || '';
      }

      // Check student proficiency in requested skill
      const studentSkill = studentProfile?.skills?.find(
        (s) => s.name?.toLowerCase() === inv.skill?.toLowerCase()
      );
      invObj.studentLevel = studentSkill?.level || 'Not Listed';

      // Determine if this invitation is incoming to current user or sent by current user
      const isRecipient = invObj.recipient
        ? invObj.recipient._id?.toString() === userId.toString()
        : invObj.sender
        ? invObj.sender._id?.toString() !== userId.toString()
        : invObj.student?._id?.toString() === userId.toString();

      invObj.isIncoming = isRecipient;
      invObj.canRespond = isRecipient && invObj.status === 'Pending';

      return invObj;
    });

    res.json({
      status: 'success',
      count: invitationsWithDetails.length,
      invitations: invitationsWithDetails,
    });
  } catch (error) {
    console.error('GetMyInvitations Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error fetching invitations',
    });
  }
};

// @desc    Accept or Decline a team invitation / join request
// @route   PUT /api/invitations/:id/respond
// @access  Private (Student)
export const respondToInvitation = async (req, res) => {
  try {
    const { status } = req.body; // 'Accepted' | 'Declined'
    const userId = req.user._id.toString();

    if (!['Accepted', 'Declined'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid response status. Must be "Accepted" or "Declined".',
      });
    }

    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) {
      return res.status(404).json({
        status: 'error',
        message: 'Invitation not found.',
      });
    }

    // Determine authorization: Recipient must be current user
    let isAuthorized = false;
    if (invitation.recipient) {
      isAuthorized = invitation.recipient.toString() === userId;
    } else if (invitation.sender) {
      isAuthorized = invitation.sender.toString() !== userId &&
        (invitation.student.toString() === userId || invitation.creator.toString() === userId);
    } else {
      isAuthorized = invitation.student.toString() === userId || invitation.creator.toString() === userId;
    }

    if (!isAuthorized) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: You do not have permission to respond to this invitation.',
      });
    }

    if (invitation.status !== 'Pending') {
      return res.status(400).json({
        status: 'error',
        message: `This invitation has already been ${invitation.status.toLowerCase()}.`,
      });
    }

    if (status === 'Declined') {
      invitation.status = 'Declined';
      await invitation.save();

      return res.json({
        status: 'success',
        message: 'Invitation declined.',
        invitation,
      });
    }

    // For 'Accepted': Perform atomic checks on capacity and skill position
    const project = await Project.findById(invitation.project);
    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Associated project no longer exists.',
      });
    }

    // 1. Verify project total team capacity
    if (project.teamMembers.length >= project.teamSize) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot accept: The project team has already reached maximum capacity.',
      });
    }

    // 2. Verify skill requirement position is still available
    const reqItem = project.skillRequirements.id(invitation.requirementId);
    if (!reqItem) {
      return res.status(404).json({
        status: 'error',
        message: 'The required skill position no longer exists on this project.',
      });
    }

    if (reqItem.filledCount >= reqItem.requiredCount) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot accept: The position for "${reqItem.skill}" has already been filled.`,
      });
    }

    const joiningStudentId = invitation.student.toString();

    // 2.5 Verify student is not already an accepted team member
    if (project.teamMembers.some((m) => m.user.toString() === joiningStudentId)) {
      invitation.status = 'Accepted';
      await invitation.save();
      return res.status(400).json({
        status: 'error',
        message: 'Student is already a member of this project squad.',
      });
    }

    // 3. Add student to project team members
    project.teamMembers.push({
      user: invitation.student,
      role: reqItem.skill,
      joinedAt: new Date(),
    });

    // 4. Increment requirement filled count
    reqItem.filledCount += 1;

    await project.save();

    // 5. Mark invitation as accepted
    invitation.status = 'Accepted';
    await invitation.save();

    const joiningUser = await User.findById(invitation.student);

    res.json({
      status: 'success',
      message: `${joiningUser?.name || 'Student'} has successfully joined the team for "${project.title}" as ${reqItem.skill}!`,
      invitation,
    });
  } catch (error) {
    console.error('RespondToInvitation Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error processing invitation response',
    });
  }
};

