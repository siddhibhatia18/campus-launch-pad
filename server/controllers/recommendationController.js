import StudentProfile from '../models/StudentProfile.js';
import Opportunity from '../models/Opportunity.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';
import { calculateOpportunityMatch, calculateCandidateSkillMatch } from '../utils/matchingEngine.js';

// @desc    Get explainable recommendations based on real student skills and opportunities
// @route   GET /api/recommendations
// @access  Private (Student)
export const getRecommendations = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    const opportunities = await Opportunity.find().sort({ createdAt: -1 });

    if (!opportunities || opportunities.length === 0) {
      return res.json({
        status: 'success',
        count: 0,
        recommendations: [],
      });
    }

    const recommendations = opportunities.map((opp) => {
      const matchResult = calculateOpportunityMatch(profile, opp);
      return {
        _id: opp._id,
        id: opp._id,
        title: opp.title,
        organization: opp.organization,
        type: opp.type,
        domain: opp.domain,
        requiredSkills: opp.requiredSkills,
        location: opp.location,
        mode: opp.mode,
        deadline: opp.deadline,
        applicationLink: opp.applicationLink,
        description: opp.description,
        matchScore: matchResult.matchScore,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
        matchReasons: matchResult.matchReasons,
      };
    });

    // Sort descending by match score
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      status: 'success',
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error('GetRecommendations Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error computing recommendations',
    });
  }
};

// @desc    Get automatic student candidate recommendations for a project
// @route   GET /api/recommendations/project/:projectId
// @access  Private (Project Owner)
export const getProjectRecommendations = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project idea not found',
      });
    }

    // Only project creator can view candidate recommendations
    if (project.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the project creator can view candidate recommendations.',
      });
    }

    // Exclude existing team members
    const existingMemberIds = (project.teamMembers || []).map((m) =>
      (m.user?._id || m.user || '').toString()
    );
    // Also exclude project creator
    if (!existingMemberIds.includes(project.creator.toString())) {
      existingMemberIds.push(project.creator.toString());
    }

    // Fetch existing invitations for this project
    const existingInvitations = await Invitation.find({ project: project._id });

    // Fetch all registered student users and their profiles
    const studentUsers = await User.find({ role: 'student' }).select('name email role profileImageUrl createdAt');
    const studentUserIds = studentUsers.map((u) => u._id);

    const allProfiles = await StudentProfile.find({ user: { $in: studentUserIds } })
      .populate('user', 'name email role profileImageUrl createdAt');

    const profileMap = new Map();
    allProfiles.forEach((p) => {
      if (p.user?._id) {
        profileMap.set(p.user._id.toString(), p);
      }
    });

    // Eligible candidates (excluding creator & team members)
    const eligibleStudents = studentUsers.filter(
      (u) => !existingMemberIds.includes(u._id.toString())
    );

    const recommendationsList = [];
    const groupedRequirements = [];

    (project.skillRequirements || []).forEach((reqItem) => {
      const isReqFilled = reqItem.filledCount >= reqItem.requiredCount;

      const candidatesForRole = [];

      eligibleStudents.forEach((u) => {
        const prof = profileMap.get(u._id.toString());
        const studentData = {
          user: u,
          college: prof?.college || '',
          course: prof?.course || '',
          year: prof?.year || '',
          bio: prof?.bio || '',
          skills: prof?.skills || [],
          interestedDomains: prof?.interestedDomains || [],
          interests: prof?.interests || [],
          projects: prof?.projects || [],
          profileImageUrl: u.profileImageUrl || prof?.profileImageUrl || '',
          profileCompletion: prof?.profileCompletion || 0,
        };

        const matchResult = calculateCandidateSkillMatch(
          studentData,
          reqItem.skill,
          reqItem.level,
          project.category
        );

        // Check if student already has an active pending/accepted invitation for this role
        const activeInvite = existingInvitations.find((inv) => {
          const invStudentId = (inv.student?._id || inv.student || '').toString();
          const invReqId = (inv.requirementId || '').toString();
          return invStudentId === u._id.toString() && invReqId === reqItem._id.toString();
        });

        // Only recommend if candidate has suitable match (hasSkill or matchScore >= 50)
        if (matchResult.hasSkill || matchResult.matchScore >= 50) {
          const candidateItem = {
            student: {
              _id: u._id,
              id: u._id,
              name: u.name,
              email: u.email,
              college: prof?.college || '',
              course: prof?.course || '',
              year: prof?.year || '',
              profileImageUrl: u.profileImageUrl || prof?.profileImageUrl || '',
              bio: prof?.bio || '',
              skills: prof?.skills || [],
              profileCompletion: prof?.profileCompletion || 0,
            },
            role: reqItem.skill,
            requirementId: reqItem._id,
            requiredLevel: reqItem.level,
            matchedSkillName: matchResult.matchedSkillName,
            matchingSkills: matchResult.matchingSkills || [matchResult.matchedSkillName].filter(Boolean),
            studentLevel: matchResult.studentLevel,
            hasSkill: matchResult.hasSkill,
            matchScore: matchResult.matchScore,
            matchReasons: matchResult.matchReasons,
            invitation: activeInvite
              ? {
                  _id: activeInvite._id,
                  id: activeInvite._id,
                  status: activeInvite.status,
                  createdAt: activeInvite.createdAt,
                }
              : null,
          };

          candidatesForRole.push(candidateItem);

          // Add to flat recommendations list if not already invited/accepted
          if (!activeInvite || activeInvite.status === 'Declined') {
            recommendationsList.push(candidateItem);
          }
        }
      });

      // Sort candidates by matchScore descending
      candidatesForRole.sort((a, b) => b.matchScore - a.matchScore);

      groupedRequirements.push({
        requirementId: reqItem._id,
        skill: reqItem.skill,
        level: reqItem.level,
        requiredCount: reqItem.requiredCount,
        filledCount: reqItem.filledCount,
        isFilled: isReqFilled,
        candidates: candidatesForRole,
      });
    });

    // Sort flat list by matchScore descending
    recommendationsList.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      status: 'success',
      projectId: project._id,
      projectTitle: project.title,
      count: recommendationsList.length,
      recommendations: recommendationsList,
      requirements: groupedRequirements,
    });
  } catch (error) {
    console.error('GetProjectRecommendations Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error computing project recommendations',
    });
  }
};
