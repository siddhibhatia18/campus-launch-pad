import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { fetchApplications, updateApplicationStatusApi } from '../../services/api';

export default function MyApplications() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await fetchApplications();
      setApplications(data.applications || []);
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleToggleStatus = async (opportunityId, currentStatus) => {
    const nextStatus = currentStatus === 'Interested' ? 'Applied' : 'Interested';
    try {
      await updateApplicationStatusApi(opportunityId, nextStatus);
      setApplications(
        applications.map((app) =>
          app.opportunityId === opportunityId ? { ...app, status: nextStatus } : app
        )
      );
    } catch (err) {
      console.error('Error updating application status:', err);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (activeFilter === 'All') return true;
    return app.status.toLowerCase() === activeFilter.toLowerCase();
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'applied':
        return <span className="badge badge-success">✓ Applied</span>;
      case 'interested':
        return <span className="badge badge-warning">⏳ Interested</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div>
      <PageHeader
        title="My Applications & Status Tracker"
        subtitle="Keep track of the roles you have expressed interest in and submitted applications for."
      >
        <span className="badge badge-accent">{applications.length} Tracked</span>
      </PageHeader>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['All', 'Applied', 'Interested'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`btn btn-sm ${activeFilter === tab ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
          Loading your application pipeline from database...
        </p>
      ) : filteredApps.length > 0 ? (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Opportunity / Role</th>
                <th>Organization</th>
                <th>Type</th>
                <th>Location / Mode</th>
                <th>Application Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app.id || app.opportunityId}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--primary-dark-blue)' }}>
                      {app.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Domain: {app.domain}
                    </div>
                  </td>
                  <td>{app.organization}</td>
                  <td>
                    <span className="badge badge-neutral">{app.type}</span>
                  </td>
                  <td>
                    {app.location} ({app.mode})
                  </td>
                  <td>
                    {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>{getStatusBadge(app.status)}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(app.opportunityId, app.status)}
                      className="btn btn-secondary btn-sm"
                    >
                      Mark as {app.status === 'Interested' ? 'Applied' : 'Interested'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon="📝"
          title={`No ${activeFilter === 'All' ? '' : activeFilter} Applications Yet`}
          description="Track opportunities as you explore and apply across the platform."
          actionText="Explore Opportunities"
          onAction={() => window.location.href = '/student/opportunities'}
        />
      )}
    </div>
  );
}
