import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import Avatar from '../../components/Avatar';
import { useAuth } from '../../context/AuthContext';
import {
  fetchStudentsApi,
  fetchMyProjectsApi,
  sendTeamInvitationApi,
} from '../../services/api';

export default function DiscoverStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [loading, setLoading] = useState(true);

  // Profile View Modal State
  const [selectedStudentForView, setSelectedStudentForView] = useState(null);

  // Invite Modal State
  const [inviteModalStudent, setInviteModalStudent] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [loadingMyProjects, setLoadingMyProjects] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedRequirementId, setSelectedRequirementId] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedSkill !== 'All') params.skill = selectedSkill;
      if (selectedDomain !== 'All') params.domain = selectedDomain;

      const data = await fetchStudentsApi(params);
      setStudents(data.students || []);
    } catch (err) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [selectedSkill, selectedDomain]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Extract unique skills and domains across all loaded students for quick filter dropdowns
  const availableSkills = ['All'];
  const availableDomains = ['All'];
  students.forEach((s) => {
    (s.skills || []).forEach((sk) => {
      if (sk.name && !availableSkills.includes(sk.name)) {
        availableSkills.push(sk.name);
      }
    });
    (s.interestedDomains || []).forEach((d) => {
      if (d && !availableDomains.includes(d)) {
        availableDomains.push(d);
      }
    });
  });

  const handleOpenInviteModal = async (student) => {
    setInviteModalStudent(student);
    setSelectedProjectId('');
    setSelectedRequirementId('');
    setErrorMessage('');
    setLoadingMyProjects(true);

    try {
      const data = await fetchMyProjectsApi();
      const created = data.created || [];
      setMyProjects(created);

      if (created.length > 0) {
        setSelectedProjectId(created[0]._id);
        const openReqs = (created[0].skillRequirements || []).filter(
          (r) => r.filledCount < r.requiredCount
        );
        if (openReqs.length > 0) {
          setSelectedRequirementId(openReqs[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching my projects:', err);
    } finally {
      setLoadingMyProjects(false);
    }
  };

  const handleProjectSelectChange = (projectId) => {
    setSelectedProjectId(projectId);
    const chosenProject = myProjects.find((p) => p._id === projectId);
    if (chosenProject) {
      const openReqs = (chosenProject.skillRequirements || []).filter(
        (r) => r.filledCount < r.requiredCount
      );
      if (openReqs.length > 0) {
        setSelectedRequirementId(openReqs[0]._id);
      } else {
        setSelectedRequirementId('');
      }
    }
  };

  const handleSendInviteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !selectedRequirementId || !inviteModalStudent) {
      setErrorMessage('Please select a project and open role position.');
      return;
    }

    const chosenProject = myProjects.find((p) => p._id === selectedProjectId);
    const chosenReq = chosenProject?.skillRequirements?.find(
      (r) => r._id === selectedRequirementId
    );

    if (!chosenReq) {
      setErrorMessage('Please select an open position.');
      return;
    }

    setSendingInvite(true);
    setErrorMessage('');

    try {
      const payload = {
        projectId: selectedProjectId,
        studentId: inviteModalStudent.id || inviteModalStudent._id,
        requirementId: selectedRequirementId,
        skill: chosenReq.skill,
        level: chosenReq.level,
      };

      await sendTeamInvitationApi(payload);
      setSuccessMessage(`Team invitation sent to ${inviteModalStudent.name} for "${chosenReq.skill}"!`);
      setTimeout(() => setSuccessMessage(''), 5000);
      setInviteModalStudent(null);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to send team invitation.');
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Discover Students & Teammates"
        subtitle="Explore collegiate talent across engineering domains, inspect student skill profiles, and recruit squad members for your projects."
      >
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/student/projects" className="btn btn-secondary btn-sm">
            💡 Project Ideas
          </Link>
          <Link to="/student/create-project" className="btn btn-accent btn-sm">
            + Pitch Project
          </Link>
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

      {/* Filter and Search Bar */}
      <div className="filter-toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search students by name, college, skill (e.g. UI/UX, React, Python), or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-row">
          {availableSkills.length > 1 && (
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Skill
              </label>
              <select
                className="filter-select"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
              >
                {availableSkills.map((sk) => (
                  <option key={sk} value={sk}>
                    {sk}
                  </option>
                ))}
              </select>
            </div>
          )}

          {availableDomains.length > 1 && (
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Domain
              </label>
              <select
                className="filter-select"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
              >
                {availableDomains.map((dom) => (
                  <option key={dom} value={dom}>
                    {dom}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(searchTerm || selectedSkill !== 'All' || selectedDomain !== 'All') && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ alignSelf: 'flex-end', height: '36px' }}
              onClick={() => {
                setSearchTerm('');
                setSelectedSkill('All');
                setSelectedDomain('All');
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Student Cards Grid */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
          Searching registered student database...
        </p>
      ) : students.length > 0 ? (
        <div className="opportunities-grid">
          {students.map((std) => {
            const isSelf = std.isCurrentUser || (user && std.id === user._id);

            return (
              <div
                key={std.id || std._id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: isSelf ? '4px solid var(--accent-blue)' : '4px solid var(--primary-dark-blue)',
                }}
              >
                <div>
                  {/* Top: Avatar, Name, College */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
                    <Avatar
                      src={std.profileImageUrl}
                      name={std.name}
                      size="lg"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex-between" style={{ alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.125rem', color: 'var(--primary-dark-blue)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {std.name}
                        </h3>
                        {isSelf && <span className="badge badge-accent" style={{ fontSize: '0.6875rem' }}>You</span>}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {std.college || 'Collegiate Student'}
                      </div>
                      {std.course && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {std.course} {std.year ? `• ${std.year}` : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {std.bio && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-dark)', marginBottom: '1rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      "{std.bio}"
                    </p>
                  )}

                  {/* Skills Section */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-dark-blue)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                      Technical Skills:
                    </div>
                    {std.skills && std.skills.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {std.skills.slice(0, 5).map((sk, idx) => (
                          <span
                            key={idx}
                            className={`badge ${sk.level === 'Advanced' ? 'badge-success' : 'badge-neutral'}`}
                            style={{ fontSize: '0.75rem' }}
                          >
                            {sk.name} <span style={{ opacity: 0.7 }}>({sk.level || 'Intermediate'})</span>
                          </span>
                        ))}
                        {std.skills.length > 5 && (
                          <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                            +{std.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        No skills listed yet
                      </span>
                    )}
                  </div>

                  {/* Interested Domains */}
                  {std.interestedDomains && std.interestedDomains.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Domains:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {std.interestedDomains.slice(0, 3).map((dom, idx) => (
                          <span key={idx} className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>
                            {dom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="flex-between" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.875rem', marginTop: '0.5rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedStudentForView(std)}
                  >
                    👤 View Profile
                  </button>

                  {!isSelf && (
                    <button
                      type="button"
                      className="btn btn-accent btn-sm"
                      onClick={() => handleOpenInviteModal(std)}
                    >
                      📬 Invite to Project
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="👥"
          title="No Students Found"
          description="Try broadening your search term or clearing filters to discover collegiate talent."
          actionText="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setSelectedSkill('All');
            setSelectedDomain('All');
          }}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* FULL STUDENT PROFILE MODAL                                     */}
      {/* ------------------------------------------------------------- */}
      {selectedStudentForView && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
          onClick={() => setSelectedStudentForView(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'var(--white)',
              padding: '2rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex-between" style={{ marginBottom: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Avatar
                  src={selectedStudentForView.profileImageUrl}
                  name={selectedStudentForView.name}
                  size="xl"
                />
                <div>
                  <h2 style={{ fontSize: '1.375rem', color: 'var(--primary-dark-blue)', margin: 0 }}>
                    {selectedStudentForView.name}
                  </h2>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {selectedStudentForView.college || 'Collegiate Student'}
                  </div>
                  {selectedStudentForView.course && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-dark)' }}>
                      {selectedStudentForView.course} • {selectedStudentForView.year || '1st Year'}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedStudentForView(null)}
                style={{ padding: '0.35rem 0.65rem' }}
              >
                ✕ Close
              </button>
            </div>

            {/* Student Bio */}
            {selectedStudentForView.bio && (
              <div style={{ backgroundColor: 'var(--background-gray)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Student Bio:
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-dark)', margin: 0, lineHeight: 1.5 }}>
                  {selectedStudentForView.bio}
                </p>
              </div>
            )}

            {/* Technical Skills */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9375rem', color: 'var(--primary-dark-blue)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ⚡ Technical Skills & Proficiency ({selectedStudentForView.skills?.length || 0})
              </h4>
              {selectedStudentForView.skills && selectedStudentForView.skills.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.6rem' }}>
                  {selectedStudentForView.skills.map((sk, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.6rem 0.8rem',
                        backgroundColor: 'var(--background-gray)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary-dark-blue)' }}>
                        {sk.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 500 }}>
                        {sk.level || 'Intermediate'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No technical skills declared yet.</p>
              )}
            </div>

            {/* Interested Domains & Personal Interests */}
            <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h4 style={{ fontSize: '0.875rem', color: 'var(--primary-dark-blue)', marginBottom: '0.5rem' }}>
                  Preferred Domains
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {selectedStudentForView.interestedDomains && selectedStudentForView.interestedDomains.length > 0 ? (
                    selectedStudentForView.interestedDomains.map((dom, idx) => (
                      <span key={idx} className="badge badge-primary">
                        {dom}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None listed</span>
                  )}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.875rem', color: 'var(--primary-dark-blue)', marginBottom: '0.5rem' }}>
                  Personal Interests
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {selectedStudentForView.interests && selectedStudentForView.interests.length > 0 ? (
                    selectedStudentForView.interests.map((int, idx) => (
                      <span key={idx} className="badge badge-neutral">
                        #{int}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None listed</span>
                  )}
                </div>
              </div>
            </div>

            {/* Portfolio Projects */}
            {selectedStudentForView.projects && selectedStudentForView.projects.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9375rem', color: 'var(--primary-dark-blue)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  💻 Portfolio Projects ({selectedStudentForView.projects.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {selectedStudentForView.projects.map((proj, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: 'var(--background-gray)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div className="flex-between">
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary-dark-blue)' }}>
                          {proj.title}
                        </span>
                        {proj.githubLink && (
                          <a
                            href={proj.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            🔗 GitHub
                          </a>
                        )}
                      </div>
                      {proj.description && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-dark)', margin: '0.35rem 0 0 0' }}>
                          {proj.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pitched Project Ideas by this Student */}
            {selectedStudentForView.pitchedProjects && selectedStudentForView.pitchedProjects.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9375rem', color: 'var(--primary-dark-blue)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  💡 Pitched Project Ideas ({selectedStudentForView.pitchedProjects.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {selectedStudentForView.pitchedProjects.map((pProj, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: 'var(--background-gray)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div className="flex-between">
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary-dark-blue)' }}>
                          {pProj.title}
                        </span>
                        <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>
                          {pProj.category}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-dark)', margin: '0.25rem 0 0.5rem 0' }}>
                        {pProj.shortDescription}
                      </p>
                      <Link
                        to={`/student/projects/${pProj._id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', display: 'inline-block' }}
                        onClick={() => setSelectedStudentForView(null)}
                      >
                        View Project →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedStudentForView(null)}
              >
                Close
              </button>
              {(!user || selectedStudentForView.id !== user._id) && (
                <button
                  type="button"
                  className="btn btn-accent btn-sm"
                  onClick={() => {
                    const std = selectedStudentForView;
                    setSelectedStudentForView(null);
                    handleOpenInviteModal(std);
                  }}
                >
                  📬 Invite to Project
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* INVITE TO PROJECT MODAL                                       */}
      {/* ------------------------------------------------------------- */}
      {inviteModalStudent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
          onClick={() => setInviteModalStudent(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              backgroundColor: 'var(--white)',
              padding: '2rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-dark-blue)', margin: 0 }}>
                📬 Invite {inviteModalStudent.name} to Project
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setInviteModalStudent(null)}
                style={{ padding: '0.25rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-dark)', marginBottom: '1.25rem' }}>
              Select one of your pitched project ideas and the open role you'd like to offer to <strong>{inviteModalStudent.name}</strong>.
            </p>

            {loadingMyProjects ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                Loading your pitched projects...
              </p>
            ) : myProjects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  You haven't created any project ideas yet to invite teammates to.
                </p>
                <Link to="/student/create-project" className="btn btn-primary btn-sm">
                  + Create a Project Idea
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSendInviteSubmit}>
                {/* Project Selection */}
                <div className="form-group">
                  <label className="form-label">Select Project</label>
                  <select
                    className="form-select"
                    value={selectedProjectId}
                    onChange={(e) => handleProjectSelectChange(e.target.value)}
                  >
                    {myProjects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.title} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role Position Selection */}
                {(() => {
                  const currProj = myProjects.find((p) => p._id === selectedProjectId);
                  const openRoles = (currProj?.skillRequirements || []).filter(
                    (r) => r.filledCount < r.requiredCount
                  );

                  return (
                    <div className="form-group">
                      <label className="form-label">Available Role Position</label>
                      {openRoles.length > 0 ? (
                        <select
                          className="form-select"
                          value={selectedRequirementId}
                          onChange={(e) => setSelectedRequirementId(e.target.value)}
                        >
                          {openRoles.map((r) => (
                            <option key={r._id} value={r._id}>
                              {r.skill} (Required: {r.level}) • {r.filledCount}/{r.requiredCount} Filled
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--danger)', margin: 0 }}>
                          All declared skill positions in this project are already filled.
                        </p>
                      )}
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setInviteModalStudent(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-accent btn-sm"
                    disabled={sendingInvite || !selectedRequirementId}
                  >
                    {sendingInvite ? 'Sending...' : '📬 Send Team Invitation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
