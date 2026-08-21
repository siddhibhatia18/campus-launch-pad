import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import OpportunityCard from '../../components/OpportunityCard';
import EmptyState from '../../components/EmptyState';
import Avatar from '../../components/Avatar';
import {
  getStudentProfile,
  fetchRecommendations,
  fetchSavedOpportunities,
  fetchApplications,
  fetchMyInvitationsApi,
} from '../../services/api';
import '../../styles/dashboard.css';

export default function StudentDashboard() {
  const { user, profile: authProfile, setProfile } = useAuth();
  const [profile, setLocalProfile] = useState(authProfile);
  const [recommendations, setRecommendations] = useState([]);
  const [savedOpportunities, setSavedOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [profileRes, recRes, savedRes, appRes, invRes] = await Promise.allSettled([
          getStudentProfile(),
          fetchRecommendations(),
          fetchSavedOpportunities(),
          fetchApplications(),
          fetchMyInvitationsApi(),
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value.profile) {
          setLocalProfile(profileRes.value.profile);
          setProfile(profileRes.value.profile);
        }

        if (recRes.status === 'fulfilled') {
          setRecommendations(recRes.value.recommendations || []);
        }

        if (savedRes.status === 'fulfilled') {
          setSavedOpportunities(savedRes.value.opportunities || []);
        }

        if (appRes.status === 'fulfilled') {
          setApplications(appRes.value.applications || []);
        }

        if (invRes.status === 'fulfilled') {
          setInvitations(invRes.value.invitations || []);
        }
      } catch (err) {
        console.error('Error loading student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const profileCompletion = profile?.profileCompletion || 0;
  const pendingInvites = invitations.filter((i) => i.status === 'Pending');

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Student Dashboard"
        subtitle="Track your opportunity discovery pipeline, project squads, and skill recommendations."
      >
        <Link to="/student/create-project" className="btn btn-accent btn-sm">
          + Pitch Project Idea
        </Link>
        <Link to="/student/opportunities" className="btn btn-primary btn-sm">
          🔍 Explore
        </Link>
        <Link to="/student/profile" className="btn btn-secondary btn-sm">
          ✏️ Edit Profile
        </Link>
      </PageHeader>

      {/* Welcome Banner with Avatar */}
      <div className="welcome-banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Avatar
            src={profile?.profileImageUrl || user?.profileImageUrl}
            name={user?.name || 'Student'}
            size="lg"
            style={{ border: '3px solid rgba(255, 255, 255, 0.4)' }}
          />
          <div>
            <h2>Welcome back, {user?.name || 'Student'}! 👋</h2>
            <p>
              {pendingInvites.length > 0
                ? `You have ${pendingInvites.length} pending team invitation${pendingInvites.length === 1 ? '' : 's'} waiting for your response!`
                : recommendations.length > 0
                ? `You have ${recommendations.length} recommended opportunit${recommendations.length === 1 ? 'y' : 'ies'} matched to your profile.`
                : 'Complete your profile with skills and domains to generate personalized opportunity matches.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {pendingInvites.length > 0 && (
            <Link to="/student/invitations" className="btn btn-accent">
              📬 View Invites ({pendingInvites.length})
            </Link>
          )}
          <Link to="/student/projects" className="btn btn-outline-white">
            💡 Project Ideas →
          </Link>
        </div>
      </div>

      {/* Live Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper">📬</div>
          <div className="stat-info">
            <span className="stat-value">{pendingInvites.length}</span>
            <span className="stat-label">Pending Invitations</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">📝</div>
          <div className="stat-info">
            <span className="stat-value">{applications.length}</span>
            <span className="stat-label">Active Applications</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">🔖</div>
          <div className="stat-info">
            <span className="stat-value">{savedOpportunities.length}</span>
            <span className="stat-label">Saved Opportunities</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">🚀</div>
          <div className="stat-info">
            <span className="stat-value">{recommendations.length}</span>
            <span className="stat-label">Total Matches</span>
          </div>
        </div>
      </div>

      {/* Profile Completion Card */}
      <div className="profile-completion-card">
        <div className="profile-completion-header">
          <h4>Profile Strength: {profileCompletion}% Complete</h4>
          <span className="completion-percentage">{profileCompletion}%</span>
        </div>
        <div className="progress-container">
          <div className="progress-fill" style={{ width: `${profileCompletion}%` }}></div>
        </div>
        <div className="completion-tips">
          <span>
            {profileCompletion === 100
              ? '🎉 Excellent! Your profile is complete and optimized for highest-precision opportunity & team matching.'
              : '💡 Tip: Upload a profile picture, add at least 3 technical skills, and list GitHub projects to boost your match rating.'}
          </span>
          <Link to="/student/profile" style={{ fontWeight: 600, color: 'var(--accent-blue)', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
            {profileCompletion === 100 ? 'Manage Profile →' : 'Complete Profile →'}
          </Link>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="dashboard-columns">
        {/* Left Column: Recommendations Preview */}
        <div>
          <div className="widget-header">
            <h3>✨ Top Recommended for You</h3>
            {recommendations.length > 0 && (
              <Link to="/student/recommendations" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                See All ({recommendations.length})
              </Link>
            )}
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Calculating personalized matches from database...</p>
          ) : recommendations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {recommendations.slice(0, 2).map((opp) => (
                <OpportunityCard key={opp._id || opp.id} opportunity={opp} showMatchScore={true} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="✨"
              title="No Matches Available Yet"
              description="Add your skills and interested domains in your profile, or explore opportunities posted on the platform."
              actionText="Add Profile Skills"
              onAction={() => window.location.href = '/student/profile'}
            />
          )}
        </div>

        {/* Right Column: Quick Team Formation & Saved Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Discover Students Quick Card */}
          <div className="card" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
            <div className="widget-header">
              <h3>👥 Student Discovery</h3>
              <Link to="/student/discover" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                Find Students →
              </Link>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Search students by name, skills, and domains to recruit teammates or inspect portfolios.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/student/discover" className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                🔍 Browse Students
              </Link>
              <Link to="/student/invitations" className="btn btn-accent btn-sm" style={{ flex: 1 }}>
                📬 Invitations {pendingInvites.length > 0 && `(${pendingInvites.length})`}
              </Link>
            </div>
          </div>

          {/* Project Ideas Quick Pitch Card */}
          <div className="card" style={{ borderLeft: '4px solid var(--primary-dark-blue)' }}>
            <div className="widget-header">
              <h3>💡 Squads & Project Ideas</h3>
              <Link to="/student/projects" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                Explore All →
              </Link>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Have a startup concept or hackathon project? Define team size and required skills to recruit collegiate teammates.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/student/create-project" className="btn btn-accent btn-sm" style={{ flex: 1 }}>
                + Pitch Idea
              </Link>
              <Link to="/student/my-projects" className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                My Squads
              </Link>
            </div>
          </div>

          {/* Saved Opportunities Widget */}
          <div className="card">
            <div className="widget-header">
              <h3>🔖 Saved Opportunities</h3>
              {savedOpportunities.length > 0 && (
                <Link to="/student/saved" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                  View All ({savedOpportunities.length})
                </Link>
              )}
            </div>

            {savedOpportunities.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {savedOpportunities.slice(0, 3).map((opp) => (
                  <div
                    key={opp._id || opp.id}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--background-gray)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {opp.organization}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary-dark-blue)' }}>
                      {opp.title}
                    </div>
                    <div className="flex-between" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                      <span className="badge badge-neutral">{opp.type}</span>
                      <span style={{ color: 'var(--text-muted)' }}>Due: {opp.deadline || 'Rolling'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                No saved opportunities yet. Bookmark opportunities while exploring!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
