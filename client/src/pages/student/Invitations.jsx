import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import Avatar from '../../components/Avatar';
import { fetchMyInvitationsApi, respondToInvitationApi } from '../../services/api';

export default function Invitations() {
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' | 'sent'
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadInvitations = async () => {
    setLoading(true);
    try {
      const data = await fetchMyInvitationsApi();
      setInvitations(data.invitations || []);
    } catch (err) {
      console.error('Error fetching invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleRespond = async (invitationId, status) => {
    setProcessingId(invitationId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await respondToInvitationApi(invitationId, status);
      setSuccessMessage(res.message || `Invitation ${status.toLowerCase()} successfully!`);
      setTimeout(() => setSuccessMessage(''), 5000);
      loadInvitations();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || `Failed to ${status.toLowerCase()} invitation`);
    } finally {
      setProcessingId(null);
    }
  };

  // Split into incoming and sent
  const incomingInvitations = invitations.filter((i) => i.isIncoming);
  const sentInvitations = invitations.filter((i) => !i.isIncoming);

  const pendingIncoming = incomingInvitations.filter((i) => i.status === 'Pending');
  const pastIncoming = incomingInvitations.filter((i) => i.status !== 'Pending');

  return (
    <div>
      <PageHeader
        title="Team Invitations & Squad Requests"
        subtitle="Review project invitations received from creators and incoming teammate applications to your pitched projects."
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge badge-accent">
            {pendingIncoming.length} Pending
          </span>
          <Link to="/student/discover" className="btn btn-secondary btn-sm">
            👥 Discover Students
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'incoming' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('incoming')}
        >
          📬 Incoming ({incomingInvitations.length}) {pendingIncoming.length > 0 && `• ${pendingIncoming.length} Action Needed`}
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'sent' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('sent')}
        >
          📤 Sent by Me ({sentInvitations.length})
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
          Loading team formation invitations from database...
        </p>
      ) : activeTab === 'incoming' ? (
        /* Tab 1: Incoming Invitations */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Pending Action Needed */}
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-dark-blue)', marginBottom: '1rem' }}>
              📬 Pending Action Needed ({pendingIncoming.length})
            </h3>

            {pendingIncoming.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {pendingIncoming.map((inv) => {
                  const isCreatorOffer = inv.sender?._id?.toString() === inv.creator?._id?.toString();

                  return (
                    <div
                      key={inv._id}
                      className="card"
                      style={{
                        borderLeft: '5px solid var(--accent-blue)',
                      }}
                    >
                      <div className="flex-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                            <span className="badge badge-primary">
                              {inv.project?.category || 'Project Idea'}
                            </span>
                            <span className="badge badge-accent">
                              {isCreatorOffer ? '👑 Creator Invitation' : '🙋 Squad Join Request'}
                            </span>
                          </div>

                          <h4 style={{ fontSize: '1.25rem', color: 'var(--primary-dark-blue)', marginTop: '0.25rem' }}>
                            {inv.project?.title}
                          </h4>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.4rem' }}>
                            <Avatar
                              src={inv.sender?.profileImageUrl || inv.creator?.profileImageUrl}
                              name={inv.sender?.name || inv.creator?.name || 'Student'}
                              size="xs"
                            />
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                              From <strong>{inv.sender?.name || inv.creator?.name}</strong> ({inv.sender?.college || inv.creator?.college || 'Student'})
                            </span>
                          </div>
                        </div>

                        <div className="match-score-badge high" style={{ fontSize: '0.875rem', padding: '0.4rem 0.8rem' }}>
                          ⚡ {inv.matchScore}% Match
                        </div>
                      </div>

                      <p style={{ fontSize: '0.875rem', color: 'var(--text-dark)', marginBottom: '1.25rem' }}>
                        {inv.project?.shortDescription}
                      </p>

                      {/* Role & Level Breakdown */}
                      <div
                        style={{
                          backgroundColor: 'var(--background-gray)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '1rem',
                          marginBottom: '1.25rem',
                          border: '1px solid var(--border-light)',
                        }}
                      >
                        <div className="grid-3" style={{ gap: '1rem' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                              OFFERED ROLE:
                            </div>
                            <div style={{ fontWeight: 700, color: 'var(--primary-dark-blue)', fontSize: '0.9375rem', marginTop: '0.2rem' }}>
                              {inv.skill}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                              REQUIRED PROFICIENCY:
                            </div>
                            <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                              {inv.level}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                              STUDENT LEVEL:
                            </div>
                            <div style={{ fontWeight: 600, color: 'var(--accent-blue)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                              {inv.studentLevel}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions Bar */}
                      <div className="flex-between" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.875rem', alignItems: 'center' }}>
                        <Link to={`/student/projects/${inv.project?._id}`} style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                          View Project Details →
                        </Link>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            disabled={processingId === inv._id}
                            onClick={() => handleRespond(inv._id, 'Declined')}
                          >
                            ✕ Decline
                          </button>
                          <button
                            type="button"
                            className="btn btn-accent btn-sm"
                            disabled={processingId === inv._id}
                            onClick={() => handleRespond(inv._id, 'Accepted')}
                          >
                            {processingId === inv._id ? 'Joining Squad...' : '✓ Accept & Join Team'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon="📬"
                title="No Pending Incoming Invitations"
                description="When project creators invite you or students apply to your squads, new invitations will appear here."
              />
            )}
          </div>

          {/* Past Incoming History */}
          {pastIncoming.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                📜 Resolved Incoming Invitations ({pastIncoming.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pastIncoming.map((inv) => (
                  <div
                    key={inv._id}
                    style={{
                      padding: '0.875rem 1rem',
                      backgroundColor: 'var(--white)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--primary-dark-blue)' }}>
                        {inv.project?.title} — <span style={{ fontWeight: 500 }}>Role: {inv.skill}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        From {inv.sender?.name || inv.creator?.name} • Match Score: {inv.matchScore}%
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className={`badge ${inv.status === 'Accepted' ? 'badge-success' : 'badge-danger'}`}>
                        {inv.status === 'Accepted' ? '✓ Accepted' : '✕ Declined'}
                      </span>
                      {inv.status === 'Accepted' && (
                        <Link to="/student/my-projects" className="btn btn-secondary btn-sm">
                          View in My Projects
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Tab 2: Sent Invitations */
        sentInvitations.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sentInvitations.map((inv) => (
              <div
                key={inv._id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  padding: '1.25rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="badge badge-primary">{inv.project?.category || 'Project'}</span>
                    <span className="badge badge-neutral">Role: {inv.skill}</span>
                  </div>

                  <h4 style={{ fontSize: '1.125rem', color: 'var(--primary-dark-blue)', margin: '0.2rem 0' }}>
                    {inv.project?.title}
                  </h4>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Sent to: <strong>{inv.recipient?.name || inv.student?.name || 'Student'}</strong> ({inv.recipient?.email || inv.student?.email})
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="match-score-badge" style={{ fontSize: '0.8125rem' }}>
                    ⚡ {inv.matchScore}% Match
                  </div>

                  <span className={`badge ${inv.status === 'Accepted' ? 'badge-success' : inv.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                    {inv.status === 'Accepted' ? '✓ Accepted' : inv.status === 'Pending' ? '⏳ Pending Response' : '✕ Declined'}
                  </span>

                  <Link to={`/student/projects/${inv.project?._id}`} className="btn btn-secondary btn-sm">
                    View Project
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📤"
            title="No Sent Invitations"
            description="You haven't sent any team invitations or join requests yet. Discover students or explore project ideas to get started!"
            actionText="Discover Students"
            onAction={() => window.location.href = '/student/discover'}
          />
        )
      )}
    </div>
  );
}

