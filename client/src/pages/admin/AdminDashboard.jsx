import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import {
  fetchAdminStats,
  fetchOpportunities,
  fetchRegisteredStudents,
} from '../../services/api';
import '../../styles/dashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalOpportunities: 0,
    activeApplications: 0,
    totalSkills: 0,
  });
  const [opportunities, setOpportunities] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminOverview = async () => {
      setLoading(true);
      try {
        const [statsRes, oppRes, stdRes] = await Promise.allSettled([
          fetchAdminStats(),
          fetchOpportunities(),
          fetchRegisteredStudents(),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value.stats) {
          setStats(statsRes.value.stats);
        }
        if (oppRes.status === 'fulfilled') {
          setOpportunities(oppRes.value.opportunities || []);
        }
        if (stdRes.status === 'fulfilled') {
          setStudents(stdRes.value.students || []);
        }
      } catch (err) {
        console.error('Error loading admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAdminOverview();
  }, []);

  return (
    <div>
      <PageHeader
        title="Admin Control Center"
        subtitle="Real-time platform metrics, live opportunity inventory, and enrolled student directory."
      >
        <Link to="/admin/opportunities" className="btn btn-primary btn-sm">
          ➕ Post Opportunity
        </Link>
        <Link to="/admin/students" className="btn btn-secondary btn-sm">
          👥 View All Students
        </Link>
      </PageHeader>

      {/* Platform Real Stats Grid (Zero Fake Numbers) */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}>
            👥
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalStudents}</span>
            <span className="stat-label">Total Enrolled Students</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#ECFDF5', color: '#047857' }}>
            💼
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalOpportunities}</span>
            <span className="stat-label">Live Opportunities</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
            📝
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.activeApplications}</span>
            <span className="stat-label">Tracked Applications</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#F3E8FF', color: '#7E22CE' }}>
            ⚡
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalSkills}</span>
            <span className="stat-label">Unique Skills in DB</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="dashboard-columns">
        {/* Left Column: Real Live Opportunities */}
        <div className="card">
          <div className="widget-header">
            <h3>📋 Opportunity Inventory ({opportunities.length})</h3>
            <Link to="/admin/opportunities" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              Manage All →
            </Link>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading records...</p>
          ) : opportunities.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {opportunities.slice(0, 5).map((opp) => (
                <div
                  key={opp._id || opp.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem 1rem',
                    backgroundColor: 'var(--background-gray)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary-dark-blue)' }}>
                      {opp.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {opp.organization} • {opp.domain}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-neutral">{opp.type}</span>
                    <span className="badge badge-success">Active</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
              No opportunities published yet. Click "Post Opportunity" to add one!
            </p>
          )}
        </div>

        {/* Right Column: Real Registered Students */}
        <div className="card">
          <div className="widget-header">
            <h3>🎓 Enrolled Students ({students.length})</h3>
            <Link to="/admin/students" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              Full Directory →
            </Link>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading students...</p>
          ) : students.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {students.slice(0, 5).map((std) => (
                <div
                  key={std.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    backgroundColor: 'var(--background-gray)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary-dark-blue)' }}>
                      {std.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {std.college || 'No college set'}
                    </div>
                  </div>
                  <span className="badge badge-accent">
                    {std.profileCompletion}% Profile
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
              No students enrolled yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
