import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Avatar from '../../components/Avatar';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import {
  fetchProjectByIdApi,
  fetchProjectCandidatesApi,
  fetchProjectRecommendationsApi,
  sendTeamInvitationApi,
  fetchMyInvitationsApi,
  respondToInvitationApi,
} from '../../services/api';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [project, setProject] = useState(null);
  const [candidateData, setCandidateData] = useState(null);
  const [recommendationData, setRecommendationData] = useState(null);
  const [myInvitations, setMyInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [sendingInviteId, setSendingInviteId] = useState(null);
  const [respondingInviteId, setRespondingInviteId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isCreator = user && project && (project.creator?._id === user._id || project.creator === user._id);
  const isMember = user && project && (project.teamMembers || []).some(
    (m) => m.user?._id === user._id || m.user === user._id
  );

  const loadProject = async () => {
    setLoading(true);
    try {
      const data = await fetchProjectByIdApi(id);
      setProject(data.project);

      // Load user invitations to see if current user has invited/been invited to this project
      try {
        const invRes = await fetchMyInvitationsApi();
        setMyInvitations(invRes.invitations || []);
      } catch (iErr) {
        console.error('Error fetching user invitations:', iErr);
      }

      // If logged-in user is creator, fetch candidate recommendations
      const creatorId = data.project.creator?._id || data.project.creator;
      if (user && creatorId === user._id) {
        loadRecommendations();
      }
    } catch (err) {
      console.error('Error loading project details:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    setCandidatesLoading(true);
    try {
      // First try dedicated recommendation endpoint, fallback to candidate endpoint
      try {
        const recData = await fetchProjectRecommendationsApi(id);
        setRecommendationData(recData);
        setCandidateData(recData);
      } catch (rErr) {
        const candData = await fetchProjectCandidatesApi(id);
        setCandidateData(candData);
        setRecommendationData(candData);
      }
    } catch (err) {
      console.error('Error loading recommendations:', err);
    } finally {
      setCandidatesLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id, user]);

  // Handle creator sending invitation to a candidate OR student applying to join
  const handleSendInvite = async (studentId, requirementId, skill, level, matchScore) => {
    const actionKey = `${studentId || user?._id}-${requirementId}`;
    setSendingInviteId(actionKey);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        projectId: id,
        studentId: studentId || user?._id,
        requirementId,
        skill,
        level,
        matchScore,
      };

      const res = await sendTeamInvitationApi(payload);
      setSuccessMessage(res.message || `Team invitation for "${skill}" submitted successfully!`);
      setTimeout(() => setSuccessMessage(''), 5000);

      // Refresh data
      if (isCreator) {
        loadRecommendations();
      }
      const invRes = await fetchMyInvitationsApi();
      setMyInvitations(invRes.invitations || []);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSendingInviteId(null);
    }
  };

  const handleRespond = async (invitationId, status) => {
    setRespondingInviteId(invitationId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await respondToInvitationApi(invitationId, status);
      setSuccessMessage(res.message || `Invitation ${status.toLowerCase()} successfully!`);
      setTimeout(() => setSuccessMessage(''), 5000);
      loadProject();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || `Failed to ${status.toLowerCase()} invitation`);
    } finally {
      setRespondingInviteId(null);
    }
  };

  // Helper to calculate current student's match for a requirement
  const getMySkillMatchForRequirement = (reqSkill, reqLevel) => {
    const studentSkills = profile?.skills || [];
    const normalizedReq = (reqSkill || '').trim().toLowerCase();
    const normalizedLevel = (reqLevel || 'Intermediate').toLowerCase() === 'medium' ? 'intermediate' : (reqLevel || 'Intermediate').toLowerCase();

    const foundSkill = studentSkills.find((s) => {
      if (!s.name) return false;
      const sName = s.name.trim().toLowerCase();
      return sName === normalizedReq || sName.includes(normalizedReq) || normalizedReq.includes(sName);
    });

    const levelValues = { beginner: 1, medium: 2, intermediate: 2, advanced: 3 };
    const reqVal = levelValues[normalizedLevel] || 2;

    if (foundSkill) {
      const studentVal = levelValues[foundSkill.level?.toLowerCase()] || 2;
      let score = 75;
      if (studentVal >= reqVal) {
        score += studentVal > reqVal ? 15 : 10;
      } else {
        score -= (reqVal - studentVal) * 12;
      }
      return {
        hasSkill: true,
        skillName: foundSkill.name,
        studentLevel: foundSkill.level,
        matchScore: Math.min(98, Math.max(55, score)),
      };
    }

    return {
      hasSkill: false,
      skillName: null,
      studentLevel: 'Not Listed',
      matchScore: 35,
    };
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading project details and team configuration from database...
      </div>
    );
  }

  if (!project) {
    return (
      <EmptyState
        icon="💡"
        title="Project Idea Not Found"
        description="This project may have been removed or does not exist."
        actionText="Back to Project Ideas"
        onAction={() => navigate('/student/projects')}
      />
    );
  }

  const teamCount = project.teamMembers?.length || 1;
  const totalCapacity = project.teamSize || 1;
  const isTeamFull = teamCount >= totalCapacity;

  // Find invitations related to this project for current user
  const relatedInvitations = myInvitations.filter(
    (inv) => (inv.project?._id || inv.project) === project._id
  );

  return (
    <div>
      <PageHeader
        title={project.title}
        subtitle={`Pitched by ${project.creator?.name || 'Student'} • ${project.category}`}
      >
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/student/projects" className="btn btn-secondary btn-sm">
            ← Explore Ideas
          </Link>
          {isCreator ? (
            <Link to="/student/my-projects" className="btn btn-accent btn-sm">
              📁 My Projects
            </Link>
          ) : (
            <Link to="/student/discover" className="btn btn-secondary btn-sm">
              👥 Find Students
            </Link>
          )}
        </div>
      </PageHeader>

      {successMessage && (
        <div style={{ padding: '0.875rem 1.25rem', backgroundColor: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontWeight: 600 }}>
          ✓ {successMessage}
        </div>
      )}

      {errorMessage && (
        <div style={{ padding: '0.875rem 1.25rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontWeight: 600 }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Main Project Content Grid */}
      <div className="dashboard-columns">
        {/* Left Column: Project Overview & Team Requirements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Overview Card */}
          <div className="card">
            <div className="flex-between" style={{ marginBottom: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Avatar
                  src={project.creator?.profileImageUrl}
                  name={project.creator?.name || 'Creator'}
                  size="md"
                />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-dark-blue)' }}>
                    {project.creator?.name} {isCreator ? '(You)' : ''}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {project.creator?.college || 'Collegiate Creator'}
                  </div>
                </div>
              </div>
              <span className="badge badge-primary">{project.category}</span>
            </div>

            <h3 style={{ fontSize: '1.125rem', color: 'var(--primary-dark-blue)', marginBottom: '0.5rem' }}>
              About the Project
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-dark)', lineHeight: 1.6, marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>
              {project.description}
            </p>

            {project.tags && project.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.875rem' }}>
                {project.tags.map((tag, idx) => (
                  <span key={idx} className="badge badge-neutral">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Skill Requirements Breakdown Card */}
          <div className="card">
            <div className="flex-between" style={{ marginBottom: '1rem', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', color: 'var(--primary-dark-blue)' }}>
                ⚡ Required Skills & Team Composition
              </h3>
              <span className="badge badge-accent">Independent Roles</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {project.skillRequirements && project.skillRequirements.length > 0 ? (
                project.skillRequirements.map((req, idx) => {
                  const isFilled = req.filledCount >= req.requiredCount;
                  const myMatch = !isCreator && user ? getMySkillMatchForRequirement(req.skill, req.level) : null;

                  // Find existing invitation for current user on this requirement
                  const myInvite = relatedInvitations.find(
                    (inv) => (inv.requirementId?.toString() === req._id?.toString())
                  );

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '1rem',
                        backgroundColor: isFilled ? 'var(--success-bg)' : 'var(--background-gray)',
                        border: isFilled ? '1px solid var(--success-border)' : '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--primary-dark-blue)', fontSize: '1rem' }}>
                            {req.skill}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            Proficiency Required: <strong>{req.level}</strong>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span className={`badge ${isFilled ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.8125rem' }}>
                            {req.filledCount} / {req.requiredCount} Filled {isFilled ? '✓' : ''}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {isFilled ? 'Role Complete' : `${req.requiredCount - req.filledCount} open position(s)`}
                          </div>
                        </div>
                      </div>

                      {/* Non-Creator Student Match & Application Action */}
                      {!isCreator && user && (
                        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="badge badge-accent" style={{ fontSize: '0.75rem' }}>
                              ⚡ {myMatch?.matchScore}% Fit
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Your Skill: <strong>{myMatch?.hasSkill ? `${myMatch.skillName} (${myMatch.studentLevel})` : 'Not listed'}</strong>
                            </span>
                          </div>

                          <div>
                            {isMember ? (
                              <span className="badge badge-success">✓ You're on this Team</span>
                            ) : myInvite?.status === 'Accepted' ? (
                              <span className="badge badge-success">✓ Joined Squad</span>
                            ) : myInvite?.status === 'Pending' ? (
                              myInvite.isIncoming ? (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleRespond(myInvite._id, 'Declined')}
                                    disabled={respondingInviteId === myInvite._id}
                                  >
                                    ✕ Decline
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-accent btn-sm"
                                    onClick={() => handleRespond(myInvite._id, 'Accepted')}
                                    disabled={respondingInviteId === myInvite._id || isFilled || isTeamFull}
                                  >
                                    {respondingInviteId === myInvite._id ? 'Joining...' : '✓ Accept Invite'}
                                  </button>
                                </div>
                              ) : (
                                <span className="badge badge-warning">⏳ Request Pending Approval</span>
                              )
                            ) : myInvite?.status === 'Declined' ? (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleSendInvite(user._id, req._id, req.skill, req.level, myMatch?.matchScore)}
                                disabled={isFilled || isTeamFull || sendingInviteId === `${user._id}-${req._id}`}
                              >
                                Re-Apply for Role
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => handleSendInvite(user._id, req._id, req.skill, req.level, myMatch?.matchScore)}
                                disabled={isFilled || isTeamFull || sendingInviteId === `${user._id}-${req._id}`}
                              >
                                {sendingInviteId === `${user._id}-${req._id}`
                                  ? 'Applying...'
                                  : isFilled
                                  ? 'Position Filled'
                                  : isTeamFull
                                  ? 'Team Full'
                                  : '📬 Apply / Request to Join'}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  No specific skill prerequisites declared.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Team Members & Capacity Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Team Capacity Card */}
          <div className="card">
            <h4 style={{ fontSize: '1rem', color: 'var(--primary-dark-blue)', marginBottom: '0.75rem' }}>
              👥 Team Progress & Capacity
            </h4>

            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Squad Members</span>
              <span style={{ fontWeight: 800, color: isTeamFull ? 'var(--success)' : 'var(--accent-blue)' }}>
                {teamCount} / {totalCapacity} Filled {isTeamFull ? '(Full)' : ''}
              </span>
            </div>

            <div className="progress-container" style={{ marginBottom: '1.25rem' }}>
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(100, Math.round((teamCount / totalCapacity) * 100))}%`,
                  backgroundColor: isTeamFull ? 'var(--success)' : 'var(--accent-blue)',
                }}
              ></div>
            </div>

            {/* Team Members List */}
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Current Squad:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {project.teamMembers && project.teamMembers.map((member, mIdx) => (
                <div
                  key={mIdx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'var(--background-gray)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Avatar
                      src={member.user?.profileImageUrl}
                      name={member.user?.name || 'Member'}
                      size="sm"
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary-dark-blue)' }}>
                        {member.user?.name} {member.role === 'Creator' ? '👑' : ''}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {member.user?.college || 'Student'}
                      </div>
                    </div>
                  </div>

                  <span className={`badge ${member.role === 'Creator' ? 'badge-primary' : 'badge-success'}`}>
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CREATOR CANDIDATE MATCHING ENGINE SECTION                     */}
      {/* ------------------------------------------------------------- */}
      {isCreator && (
        <div style={{ marginTop: '2.5rem' }}>
          <div
            style={{
              backgroundColor: 'var(--primary-dark-blue)',
              color: 'var(--white)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            }}
          >
            <div className="flex-between" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ color: 'var(--white)', fontSize: '1.375rem', marginBottom: '0.25rem' }}>
                  ✨ Recommended Team Members
                </h3>
                <p style={{ color: '#CBD5E1', fontSize: '0.875rem', margin: 0 }}>
                  Automatically matched registered students based on your project's required roles and technical skills.
                </p>
              </div>
              <span className="badge badge-accent">Automatic Skill Match Engine</span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--white)',
              border: '1px solid var(--border-gray)',
              borderTop: 'none',
              borderRadius: '0 0 var(--radius-md) var(--radius-md)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
            }}
          >
            {candidatesLoading ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                Computing candidate match scores across registered student profiles...
              </p>
            ) : candidateData?.requirements && candidateData.requirements.length > 0 ? (
              candidateData.requirements.map((reqGroup) => {
                const isGroupFilled = reqGroup.isFilled;

                return (
                  <div
                    key={reqGroup.requirementId}
                    style={{
                      border: '1px solid var(--border-gray)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1.25rem',
                      backgroundColor: 'var(--background-gray)',
                    }}
                  >
                    {/* Requirement Header */}
                    <div className="flex-between" style={{ marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.125rem', color: 'var(--primary-dark-blue)', marginBottom: '0.2rem' }}>
                          Role: {reqGroup.skill} — <span style={{ fontWeight: 500 }}>Required: {reqGroup.level}</span>
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Positions: <strong>{reqGroup.filledCount} / {reqGroup.requiredCount} Filled</strong>
                        </span>
                      </div>

                      <span className={`badge ${isGroupFilled ? 'badge-success' : 'badge-neutral'}`}>
                        {isGroupFilled ? '✓ Role Fully Filled' : `${reqGroup.requiredCount - reqGroup.filledCount} Open Slot(s)`}
                      </span>
                    </div>

                    {/* Candidate Cards Grid */}
                    {reqGroup.candidates && reqGroup.candidates.length > 0 ? (
                      <div className="grid-2" style={{ gap: '1rem' }}>
                        {reqGroup.candidates.map((cand) => {
                          const actionKey = `${cand.student.id || cand.student._id}-${reqGroup.requirementId}`;
                          const isSending = sendingInviteId === actionKey;
                          const inviteStatus = cand.invitation?.status;

                          return (
                            <div
                              key={cand.student.id || cand.student._id}
                              style={{
                                backgroundColor: 'var(--white)',
                                border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                boxShadow: 'var(--shadow-sm)',
                              }}
                            >
                              <div>
                                {/* Candidate Top Row */}
                                <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Avatar
                                      src={cand.student.profileImageUrl}
                                      name={cand.student.name}
                                      size="md"
                                    />
                                    <div>
                                      <div style={{ fontWeight: 700, color: 'var(--primary-dark-blue)', fontSize: '0.9375rem' }}>
                                        {cand.student.name}
                                      </div>
                                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {cand.student.college || 'Student'} • {cand.student.course || 'Degree'}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Match Score Badge */}
                                  <div className="match-score-badge high" style={{ fontSize: '0.8125rem', padding: '0.35rem 0.65rem' }}>
                                    ⚡ {cand.matchScore}% Match
                                  </div>
                                </div>

                                {/* Student Skill Level Tag */}
                                <div style={{ fontSize: '0.8125rem', marginBottom: '0.6rem' }}>
                                  <strong>{reqGroup.skill} Proficiency:</strong>{' '}
                                  <span className={`badge ${cand.studentLevel === 'Advanced' ? 'badge-success' : cand.studentLevel === 'Not Listed' ? 'badge-neutral' : 'badge-primary'}`}>
                                    {cand.studentLevel}
                                  </span>
                                </div>

                                {/* Matching Skills List */}
                                {cand.matchingSkills && cand.matchingSkills.length > 0 && (
                                  <div style={{ marginBottom: '0.75rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                      Matching Skills:
                                    </span>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                                      {cand.matchingSkills.map((sk, skIdx) => (
                                        <span key={skIdx} className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
                                          ✓ {sk}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Explainable Match Reasons */}
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-dark)', marginBottom: '1rem', padding: 0 }}>
                                  {cand.matchReasons.map((r, rIdx) => (
                                    <li key={rIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                      <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span>
                                      <span>{r}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Invite Button Action */}
                              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                                {inviteStatus === 'Accepted' ? (
                                  <span className="badge badge-success">✓ Already Accepted</span>
                                ) : inviteStatus === 'Pending' ? (
                                  <span className="badge badge-warning">⏳ Invitation Pending</span>
                                ) : inviteStatus === 'Declined' ? (
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    disabled={isGroupFilled || isTeamFull || isSending}
                                    onClick={() => handleSendInvite(cand.student.id || cand.student._id, reqGroup.requirementId, reqGroup.skill, reqGroup.level, cand.matchScore)}
                                  >
                                    Re-Invite Candidate
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    disabled={isGroupFilled || isTeamFull || isSending}
                                    onClick={() => handleSendInvite(cand.student.id || cand.student._id, reqGroup.requirementId, reqGroup.skill, reqGroup.level, cand.matchScore)}
                                  >
                                    {isSending ? 'Sending...' : isGroupFilled ? 'Position Filled' : isTeamFull ? 'Team Full' : '📬 Invite to Project'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)' }}>
                        <p style={{ fontSize: '0.875rem', margin: 0, fontWeight: 500 }}>
                          No matching students found yet for {reqGroup.skill}.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✨</div>
                <h4 style={{ color: 'var(--primary-dark-blue)', marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                  No matching students found yet.
                </h4>
                <p style={{ fontSize: '0.875rem', maxWidth: '450px', margin: '0 auto', color: 'var(--text-muted)' }}>
                  As more students register and list skills matching your project requirements, automatic recommendations will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

