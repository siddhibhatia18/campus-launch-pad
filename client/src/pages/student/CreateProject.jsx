import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { createProjectApi } from '../../services/api';

export default function CreateProject() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: 'Web Development',
    tags: '',
    deadline: '',
    teamSize: 4, // Total size including creator
  });

  const [skillRequirements, setSkillRequirements] = useState([
    { skill: 'UI/UX Design', level: 'Advanced', requiredCount: 1 },
    { skill: 'React', level: 'Advanced', requiredCount: 2 },
  ]);

  const [newSkill, setNewSkill] = useState({
    skill: '',
    level: 'Medium',
    requiredCount: 1,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const categories = [
    'Web Development',
    'Artificial Intelligence / ML',
    'Mobile App Development',
    'Cloud & DevOps',
    'FinTech & Blockchain',
    'EdTech',
    'HealthTech',
    'Hardware & IoT',
    'Open Source & Tooling',
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddRequirement = (e) => {
    e.preventDefault();
    if (!newSkill.skill.trim()) return;

    setSkillRequirements([
      ...skillRequirements,
      {
        skill: newSkill.skill.trim(),
        level: newSkill.level,
        requiredCount: parseInt(newSkill.requiredCount, 10) || 1,
      },
    ]);

    setNewSkill({
      skill: '',
      level: 'Medium',
      requiredCount: 1,
    });
  };

  const handleRemoveRequirement = (indexToRemove) => {
    setSkillRequirements(skillRequirements.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.title.trim() || !formData.shortDescription.trim() || !formData.description.trim()) {
      setErrorMessage('Please fill in all required project information.');
      return;
    }

    if (parseInt(formData.teamSize, 10) < 2) {
      setErrorMessage('Team size should be at least 2 members (you + at least 1 teammate).');
      return;
    }

    if (skillRequirements.length === 0) {
      setErrorMessage('Please add at least one technical skill requirement for your team.');
      return;
    }

    // Total required positions sum check
    const totalPositionsSum = skillRequirements.reduce(
      (acc, r) => acc + (parseInt(r.requiredCount, 10) || 1),
      0
    );

    const targetTeamCapacity = parseInt(formData.teamSize, 10);
    // Note: Creator takes 1 slot, so remaining roles should match or fit within teamSize - 1
    if (totalPositionsSum > targetTeamCapacity - 1) {
      setErrorMessage(
        `Total required skill positions (${totalPositionsSum}) exceed available teammate slots (${targetTeamCapacity - 1}). Please increase total team size or reduce required counts.`
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        shortDescription: formData.shortDescription,
        description: formData.description,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        deadline: formData.deadline,
        teamSize: targetTeamCapacity,
        skillRequirements,
      };

      const res = await createProjectApi(payload);
      if (res.project) {
        navigate(`/student/projects/${res.project._id}`);
      } else {
        navigate('/student/projects');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to publish project idea');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Create Project Idea"
        subtitle="Pitch your startup concept, define team size, and specify independent skill requirements to find student teammates."
      >
        <Link to="/student/projects" className="btn btn-secondary btn-sm">
          ← Back to Project Ideas
        </Link>
      </PageHeader>

      {errorMessage && (
        <div style={{ padding: '0.875rem 1.25rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontWeight: 600 }}>
          ⚠️ {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="dashboard-columns">
          {/* Left Column: Basic Details & Project Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', color: 'var(--primary-dark-blue)' }}>
                💡 1. Project / Startup Basic Details
              </h3>

              <div className="form-group">
                <label className="form-label">Project / Startup Name *</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  required
                  placeholder="e.g. Campus Launch Pad — AI Matcher"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Short Elevator Pitch (Max 150 chars) *</label>
                <input
                  type="text"
                  name="shortDescription"
                  className="form-input"
                  maxLength={150}
                  required
                  placeholder="A concise one-line summary for student candidate discovery cards..."
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'right' }}>
                  {formData.shortDescription.length} / 150 characters
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Project Description & Vision *</label>
                <textarea
                  name="description"
                  rows="5"
                  className="form-textarea"
                  required
                  placeholder="Describe your project goals, technical architecture, problem statement, and what teammates will build..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="grid-2" style={{ gap: '1rem', marginBottom: 0 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    className="form-input"
                    placeholder="e.g. React, Node, Web3, Hackathon"
                    value={formData.tags}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Application / Goal Deadline</label>
                  <input
                    type="text"
                    name="deadline"
                    className="form-input"
                    placeholder="e.g. 2026-09-30 or Rolling"
                    value={formData.deadline}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Team Size & Independent Skill Requirements */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Team Size Card */}
            <div className="card">
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem', color: 'var(--primary-dark-blue)' }}>
                👥 2. Team Size & Capacity
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                How many total members do you need on the team (including yourself as the creator)?
              </p>

              <div className="form-group">
                <label className="form-label">Total Team Size *</label>
                <select
                  name="teamSize"
                  className="form-select"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                >
                  <option value={2}>2 members (You + 1 teammate)</option>
                  <option value={3}>3 members (You + 2 teammates)</option>
                  <option value={4}>4 members (You + 3 teammates)</option>
                  <option value={5}>5 members (You + 4 teammates)</option>
                  <option value={6}>6 members (You + 5 teammates)</option>
                </select>
              </div>

              <div style={{ backgroundColor: 'var(--background-gray)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', color: 'var(--text-dark)', border: '1px solid var(--border-light)' }}>
                ✓ You will occupy <strong>1 slot (Creator)</strong>, leaving <strong>{parseInt(formData.teamSize, 10) - 1} slots</strong> for recruited teammates.
              </div>
            </div>

            {/* Skill Requirements Builder Card */}
            <div className="card">
              <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.125rem', color: 'var(--primary-dark-blue)' }}>
                  ⚡ 3. Required Skills & Roles
                </h3>
                <span className="badge badge-accent">Multi-Student Squad</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Define individual requirements. Different students with different skills will fulfill each role!
              </p>

              {/* Requirement Adder Form */}
              <div style={{ backgroundColor: 'var(--background-gray)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', border: '1px solid var(--border-light)' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8125rem' }}>Required Skill / Role Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. UI/UX Design, Marketing, React, Python, Java"
                    value={newSkill.skill}
                    onChange={(e) => setNewSkill({ ...newSkill, skill: e.target.value })}
                  />
                </div>

                <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8125rem' }}>Required Proficiency</label>
                    <select
                      className="form-select"
                      value={newSkill.level}
                      onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Medium">Medium (Intermediate)</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.8125rem' }}>Number of People</label>
                    <select
                      className="form-select"
                      value={newSkill.requiredCount}
                      onChange={(e) => setNewSkill({ ...newSkill, requiredCount: parseInt(e.target.value, 10) })}
                    >
                      <option value={1}>1 person</option>
                      <option value={2}>2 people</option>
                      <option value={3}>3 people</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={handleAddRequirement}
                >
                  + Add Requirement to Team
                </button>
              </div>

              {/* Requirements List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Active Team Requirements ({skillRequirements.length}):
                </div>

                {skillRequirements.map((req, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      border: '1px solid var(--border-gray)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--white)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary-dark-blue)' }}>
                        {req.skill}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Level: <strong>{req.level}</strong> • Capacity: <strong>{req.requiredCount} {req.requiredCount === 1 ? 'person' : 'people'}</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveRequirement(idx)}
                      title="Remove requirement"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Action Card */}
            <div className="card" style={{ backgroundColor: 'var(--primary-dark-blue)', color: 'var(--white)' }}>
              <h4 style={{ color: 'var(--white)', marginBottom: '0.5rem' }}>Ready to Recruit?</h4>
              <p style={{ fontSize: '0.8125rem', color: '#CBD5E1', marginBottom: '1.25rem' }}>
                Publishing your project idea will enable the matching engine to find and recommend suitable candidates for each skill requirement.
              </p>
              <button
                type="submit"
                className="btn btn-accent btn-lg"
                style={{ width: '100%' }}
                disabled={submitting}
              >
                {submitting ? 'Publishing Project...' : '🚀 Publish Project Idea & Find Teammates'}
              </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
