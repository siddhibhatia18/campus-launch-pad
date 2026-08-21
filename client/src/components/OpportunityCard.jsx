import React, { useState } from 'react';
import '../styles/opportunities.css';

export default function OpportunityCard({
  opportunity,
  showMatchScore = true,
  onSaveToggle,
  isSaved = false,
}) {
  const [saved, setSaved] = useState(isSaved);

  const handleSaveClick = (e) => {
    e.stopPropagation();
    setSaved(!saved);
    if (onSaveToggle) {
      onSaveToggle(opportunity.id, !saved);
    }
  };

  const getTypeClass = (type) => {
    switch (type?.toLowerCase()) {
      case 'internship': return 'type-internship';
      case 'hackathon': return 'type-hackathon';
      case 'job': return 'type-job';
      case 'workshop': return 'type-workshop';
      case 'competition': return 'type-competition';
      default: return 'type-internship';
    }
  };

  return (
    <div className="opportunity-card">
      <div>
        {/* Top Header */}
        <div className="opportunity-card-top">
          <div>
            <div className="opportunity-org">{opportunity.organization}</div>
            <h3 className="opportunity-title">{opportunity.title}</h3>
          </div>
          <span className={`opportunity-type-badge ${getTypeClass(opportunity.type)}`}>
            {opportunity.type}
          </span>
        </div>

        {/* Metadata Row */}
        <div className="opportunity-meta-row">
          <span className="opportunity-meta-item">
            📍 {opportunity.location || 'Remote'} ({opportunity.mode || 'Online'})
          </span>
          <span className="opportunity-meta-item">
            📅 Deadline: {opportunity.deadline || 'Rolling'}
          </span>
          <span className="opportunity-meta-item">
            🏢 Domain: {opportunity.domain || 'Tech'}
          </span>
        </div>

        {/* Description */}
        <p className="opportunity-description">{opportunity.description}</p>

        {/* Required Skills */}
        {opportunity.requiredSkills && opportunity.requiredSkills.length > 0 && (
          <div className="opportunity-skills">
            {opportunity.requiredSkills.map((skill, index) => (
              <span
                key={index}
                className={`skill-pill ${opportunity.matchedSkills?.includes(skill) ? 'matched' : ''}`}
              >
                {opportunity.matchedSkills?.includes(skill) ? '✓ ' : ''}{skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer & Actions */}
      <div className="opportunity-card-footer">
        {showMatchScore && opportunity.matchScore !== undefined ? (
          <div className={`match-score-badge ${opportunity.matchScore >= 80 ? 'high' : ''}`}>
            <span>⚡</span>
            <span>{opportunity.matchScore}% Match</span>
          </div>
        ) : (
          <span className="badge badge-neutral">{opportunity.domain}</span>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className={`save-btn ${saved ? 'saved' : ''}`}
            onClick={handleSaveClick}
            title={saved ? 'Remove from saved' : 'Save opportunity'}
            aria-label="Save opportunity"
          >
            {saved ? '🔖' : '📑'}
          </button>
          <a
            href={opportunity.applicationLink || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            Apply Now
          </a>
        </div>
      </div>
    </div>
  );
}
