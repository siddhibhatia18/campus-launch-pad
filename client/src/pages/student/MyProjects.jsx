import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import Avatar from '../../components/Avatar';
import { fetchMyProjectsApi } from '../../services/api';

export default function MyProjects() {
  const [activeTab, setActiveTab] = useState('created'); // 'created' | 'joined'
  const [createdProjects, setCreatedProjects] = useState([]);
  const [joinedProjects, setJoinedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await fetchMyProjectsApi();
      setCreatedProjects(data.created || []);
      setJoinedProjects(data.joined || []);
    } catch (err) {
      console.error('Error loading my projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div>
      <PageHeader
        title="My Projects & Teams"
        subtitle="Manage the startup ideas you've pitched and collaborate with the engineering squads you've joined."
      >
        <Link to="/student/create-project" className="btn btn-accent btn-sm">
          + Create Project Idea
        </Link>
      </PageHeader>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'created' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('created')}
        >
          👑 Pitched by Me ({createdProjects.length})
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'joined' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('joined')}
        >
          🤝 Joined Squads ({joinedProjects.length})
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
          Loading your projects from database...
        </p>
      ) : activeTab === 'created' ? (
        /* Tab 1: Created Projects */
        createdProjects.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {createdProjects.map((project) => {
              const teamCount = project.teamMembers?.length || 1;
              const totalSize = project.teamSize || 1;
              const isFull = teamCount >= totalSize;

              return (
                <div
                  key={project._id}
                  className="card"
                  style={{
                    borderLeft: '5px solid var(--accent-blue)',
                  }}
                >
                  {/* Top Bar */}
                  <div className="flex-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {project.category}
                      </div>
                      <h3 style={{ fontSize: '1.375rem', color: 'var(--primary-dark-blue)', marginTop: '0.2rem' }}>
                        {project.title}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-dark)', marginTop: '0.35rem' }}>
                        {project.shortDescription}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${isFull ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.875rem' }}>
                        👥 Team: {teamCount} / {totalSize} {isFull ? '(Full)' : 'Members'}
                      </span>
                    </div>
                  </div>

                  {/* Skills Status Grid */}
                  <div
                    style={{
                      backgroundColor: 'var(--background-gray)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1rem',
                      marginBottom: '1rem',
                      border: '1px solid var(--border-light)',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-dark-blue)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                      Skill Requirements & Filled Positions:
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {project.skillRequirements && project.skillRequirements.map((req, idx) => {
                        const filled = req.filledCount >= req.requiredCount;
                        return (
                          <span
                            key={idx}
                            className={`badge ${filled ? 'badge-success' : 'badge-neutral'}`}
                            style={{ fontSize: '0.8125rem', padding: '0.35rem 0.65rem' }}
                          >
                            {req.skill} ({req.level}) • {req.filledCount}/{req.requiredCount} {filled ? '✓' : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Invitation Activity & Action Bar */}
                  <div className="flex-between" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.875rem', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.8125rem' }}>
                      <span className="badge badge-warning">
                        ⏳ {project.invitationStats?.pending || 0} Pending Invites
                      </span>
                      <span className="badge badge-success">
                        ✓ {project.invitationStats?.accepted || 0} Accepted
                      </span>
                    </div>

                    <Link to={`/student/projects/${project._id}`} className="btn btn-primary btn-sm">
                      🔍 Find Candidates & Manage Team →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="👑"
            title="You Haven't Created Any Project Ideas Yet"
            description="Pitch a software project, hackathon concept, or startup idea to start recruiting teammates."
            actionText="+ Create Project Idea"
            onAction={() => window.location.href = '/student/create-project'}
          />
        )
      ) : (
        /* Tab 2: Joined Projects */
        joinedProjects.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {joinedProjects.map((project) => (
              <div
                key={project._id}
                className="card"
                style={{
                  borderLeft: '5px solid var(--success)',
                }}
              >
                <div className="flex-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {project.category}
                    </div>
                    <h3 style={{ fontSize: '1.375rem', color: 'var(--primary-dark-blue)', marginTop: '0.2rem' }}>
                      {project.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                      <Avatar
                        src={project.creator?.profileImageUrl}
                        name={project.creator?.name || 'Creator'}
                        size="xs"
                      />
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        Created by <strong>{project.creator?.name}</strong>
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.875rem' }}>
                      Your Role: {project.myRole}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-dark)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  {project.shortDescription}
                </p>

                {/* Team Members List */}
                <div
                  style={{
                    backgroundColor: 'var(--background-gray)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                    marginBottom: '1rem',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-dark-blue)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                    Squad Teammates ({project.teamMembers?.length || 0}):
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {project.teamMembers && project.teamMembers.map((m, idx) => (
                      <span key={idx} className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Avatar
                          src={m.user?.profileImageUrl}
                          name={m.user?.name || 'Member'}
                          size="xs"
                        />
                        <span>{m.user?.name} ({m.role})</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex-between" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.875rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Status: Active Collaboration
                  </span>
                  <Link to={`/student/projects/${project._id}`} className="btn btn-secondary btn-sm">
                    View Full Project Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🤝"
            title="You Haven't Joined Any Project Squads Yet"
            description="Check your Team Invitations or explore open Project Ideas to collaborate with other students."
            actionText="Check Team Invitations"
            onAction={() => window.location.href = '/student/invitations'}
          />
        )
      )}
    </div>
  );
}
