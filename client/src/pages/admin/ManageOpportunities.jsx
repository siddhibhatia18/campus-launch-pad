import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import {
  fetchOpportunities,
  createOpportunityApi,
  deleteOpportunityApi,
} from '../../services/api';

export default function ManageOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [newOpp, setNewOpp] = useState({
    title: '',
    organization: '',
    type: 'Internship',
    domain: 'Web Development',
    location: 'Remote',
    mode: 'Online',
    deadline: '',
    applicationLink: '',
    requiredSkills: '',
    description: '',
  });

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const data = await fetchOpportunities();
      setOpportunities(data.opportunities || []);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      await deleteOpportunityApi(id);
      setOpportunities(opportunities.filter((o) => (o._id || o.id) !== id));
      setSuccessMessage('Opportunity deleted successfully from database.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error deleting opportunity');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      const skillsArray = newOpp.requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...newOpp,
        requiredSkills: skillsArray,
      };

      const res = await createOpportunityApi(payload);
      if (res.opportunity) {
        setOpportunities([res.opportunity, ...opportunities]);
      }
      setShowAddForm(false);
      setSuccessMessage('Opportunity published successfully to database!');
      setTimeout(() => setSuccessMessage(''), 4000);

      setNewOpp({
        title: '',
        organization: '',
        type: 'Internship',
        domain: 'Web Development',
        location: 'Remote',
        mode: 'Online',
        deadline: '',
        applicationLink: '',
        requiredSkills: '',
        description: '',
      });
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to create opportunity');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Manage Opportunities"
        subtitle="Create, publish, and delete live student opportunity listings stored in MongoDB."
      >
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '✕ Close Form' : '➕ Post Opportunity'}
        </button>
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

      {/* Add Opportunity Form Drawer */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--accent-blue)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--primary-dark-blue)' }}>
            Post New Opportunity to Database
          </h3>
          <form onSubmit={handleAddSubmit}>
            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Opportunity Title *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Frontend Engineering Intern"
                  value={newOpp.title}
                  onChange={(e) => setNewOpp({ ...newOpp, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company / Organization *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. NextGen Labs"
                  value={newOpp.organization}
                  onChange={(e) => setNewOpp({ ...newOpp, organization: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-3" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Opportunity Type *</label>
                <select
                  className="form-select"
                  value={newOpp.type}
                  onChange={(e) => setNewOpp({ ...newOpp, type: e.target.value })}
                >
                  <option value="Internship">Internship</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Job">Job</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Competition">Competition</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Domain *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Web Development"
                  value={newOpp.domain}
                  onChange={(e) => setNewOpp({ ...newOpp, domain: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mode *</label>
                <select
                  className="form-select"
                  value={newOpp.mode}
                  onChange={(e) => setNewOpp({ ...newOpp, mode: e.target.value })}
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Remote / Bangalore"
                  value={newOpp.location}
                  onChange={(e) => setNewOpp({ ...newOpp, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Application Deadline</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 2026-09-30 or Rolling"
                  value={newOpp.deadline}
                  onChange={(e) => setNewOpp({ ...newOpp, deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Required Skills (Comma separated) *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. React, Node.js, JavaScript, MongoDB"
                value={newOpp.requiredSkills}
                onChange={(e) => setNewOpp({ ...newOpp, requiredSkills: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Application Link *</label>
              <input
                type="url"
                className="form-input"
                required
                placeholder="https://company.com/careers/apply"
                value={newOpp.applicationLink}
                onChange={(e) => setNewOpp({ ...newOpp, applicationLink: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                rows="3"
                className="form-textarea"
                required
                placeholder="Detailed description of responsibilities and qualifications..."
                value={newOpp.description}
                onChange={(e) => setNewOpp({ ...newOpp, description: e.target.value })}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving to Database...' : 'Save & Publish Opportunity'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Opportunities Table */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
          Loading opportunity catalog from database...
        </p>
      ) : opportunities.length > 0 ? (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Title & Organization</th>
                <th>Type</th>
                <th>Domain</th>
                <th>Location / Mode</th>
                <th>Deadline</th>
                <th>Required Skills</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opp) => (
                <tr key={opp._id || opp.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--primary-dark-blue)' }}>
                      {opp.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {opp.organization}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{opp.type}</span>
                  </td>
                  <td>{opp.domain}</td>
                  <td>{opp.location || 'Remote'} ({opp.mode || 'Online'})</td>
                  <td>{opp.deadline || 'Rolling'}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', maxWidth: '200px' }}>
                      {opp.requiredSkills?.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                          {s}
                        </span>
                      ))}
                      {opp.requiredSkills?.length > 3 && (
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          +{opp.requiredSkills.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(opp._id || opp.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon="📋"
          title="No Opportunities in Database"
          description="Click 'Post Opportunity' above to create your first opportunity listing in the database."
          actionText="Post First Opportunity"
          onAction={() => setShowAddForm(true)}
        />
      )}
    </div>
  );
}
