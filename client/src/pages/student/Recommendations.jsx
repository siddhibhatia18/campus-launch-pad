import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import {
  fetchRecommendations,
  fetchSavedOpportunities,
  saveOpportunityApi,
  unsaveOpportunityApi,
  trackApplicationApi,
} from '../../services/api';
import '../../styles/opportunities.css';

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      try {
        const data = await fetchRecommendations();
        setRecommendations(data.recommendations || []);

        try {
          const savedData = await fetchSavedOpportunities();
          const ids = new Set((savedData.opportunities || []).map((o) => o._id || o.id));
          setSavedIds(ids);
        } catch (sErr) {
          // non-blocking
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  const handleSaveToggle = async (oppId) => {
    const isSaved = savedIds.has(oppId);
    try {
      if (isSaved) {
        await unsaveOpportunityApi(oppId);
        const updated = new Set(savedIds);
        updated.delete(oppId);
        setSavedIds(updated);
      } else {
        await saveOpportunityApi(oppId);
        setSavedIds(new Set([...savedIds, oppId]));
      }
    } catch (err) {
      console.error('Error toggling save status:', err);
    }
  };

  const handleApply = async (oppId, link) => {
    try {
      await trackApplicationApi(oppId, 'Applied');
      if (link) window.open(link, '_blank');
    } catch (err) {
      console.error('Error tracking application:', err);
    }
  };

  return (
    <div>
      <PageHeader
        title="Personalized Recommendations"
        subtitle="Ranked dynamically using our explainable matching algorithm: Skills (50%), Domain (30%), and Interests (20%)."
      >
        <span className="badge badge-success">✨ Explainable AI Matching</span>
      </PageHeader>

      {/* Algorithm Banner */}
      <div
        style={{
          backgroundColor: 'var(--accent-light)',
          border: '1px solid rgba(59, 130, 182, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h4 style={{ color: 'var(--primary-dark-blue)', marginBottom: '0.25rem' }}>
            💡 How your scores are calculated
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-dark)' }}>
            Each opportunity includes a clear breakdown of <strong>matched skills</strong>, <strong>missing skills</strong> to learn, and specific <strong>match reasons</strong>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge badge-primary">Skills: 50%</span>
          <span className="badge badge-accent">Domain: 30%</span>
          <span className="badge badge-neutral">Interests: 20%</span>
        </div>
      </div>

      {/* Recommendations List */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
          Computing real recommendations from your database profile and active opportunities...
        </p>
      ) : recommendations.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {recommendations.map((opp) => (
            <div
              key={opp._id || opp.id}
              className="card"
              style={{
                borderLeft: opp.matchScore >= 80 ? '5px solid var(--success)' : '5px solid var(--accent-blue)',
              }}
            >
              <div className="flex-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {opp.organization} • {opp.domain}
                  </div>
                  <h3 style={{ fontSize: '1.375rem', color: 'var(--primary-dark-blue)', marginTop: '0.25rem' }}>
                    {opp.title}
                  </h3>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    📍 {opp.location || 'Remote'} ({opp.mode || 'Online'}) • 📅 Deadline: {opp.deadline || 'Rolling'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className={`match-score-badge ${opp.matchScore >= 80 ? 'high' : ''}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                    <span>⚡</span>
                    <span>{opp.matchScore}% Match Score</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    {opp.matchScore >= 80 ? 'Strong Fit' : opp.matchScore >= 50 ? 'Moderate Fit' : 'Potential Fit'}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.9375rem', color: 'var(--text-dark)', marginBottom: '1.25rem' }}>
                {opp.description}
              </p>

              {/* Explainable Match Breakdown Section */}
              <div
                style={{
                  backgroundColor: 'var(--background-gray)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                  border: '1px solid var(--border-light)',
                }}
              >
                <h4 style={{ fontSize: '0.875rem', color: 'var(--primary-dark-blue)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  🔍 Why this matches your profile:
                </h4>

                {/* Match Reasons */}
                {opp.matchReasons && opp.matchReasons.length > 0 ? (
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                    {opp.matchReasons.map((reason, rIdx) => (
                      <li key={rIdx} style={{ fontSize: '0.8125rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    General match based on domain alignment.
                  </p>
                )}

                {/* Skills Breakdown */}
                <div className="grid-2" style={{ gap: '1rem', borderTop: '1px solid var(--border-gray)', paddingTop: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', marginBottom: '0.4rem' }}>
                      MATCHED SKILLS ({opp.matchedSkills?.length || 0}):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {opp.matchedSkills && opp.matchedSkills.length > 0 ? (
                        opp.matchedSkills.map((s, idx) => (
                          <span key={idx} className="badge badge-success">
                            ✓ {s}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          No direct skills overlap yet
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--warning)', marginBottom: '0.4rem' }}>
                      SKILLS TO LEARN (UPSKILL):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {opp.missingSkills && opp.missingSkills.length > 0 ? (
                        opp.missingSkills.map((s, idx) => (
                          <span key={idx} className="badge badge-warning">
                            + {s}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                          All requirements met!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex-between">
                <span className="badge badge-neutral">Type: {opp.type}</span>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleSaveToggle(opp._id || opp.id)}
                  >
                    {savedIds.has(opp._id || opp.id) ? '🔖 Saved' : '📑 Save'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleApply(opp._id || opp.id, opp.applicationLink)}
                  >
                    Apply Directly →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="✨"
          title="No Recommendations Available"
          description="Add your technical skills and interested domains to your profile, or wait for new opportunities to be published."
          actionText="Edit Profile Skills"
          onAction={() => window.location.href = '/student/profile'}
        />
      )}
    </div>
  );
}
