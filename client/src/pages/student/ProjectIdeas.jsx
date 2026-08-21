import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import Avatar from '../../components/Avatar';
import { fetchProjectsApi } from '../../services/api';

export default function ProjectIdeas() {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const data = await fetchProjectsApi(params);
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Error fetching project ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProjects();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const categories = [
    'All',
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

  return (
    <div>
      <PageHeader
        title="Project Ideas & Team Formation"
        subtitle="Discover student startup ideas, join collegiate engineering squads, or pitch your own project to assemble a dream team."
      >
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/student/discover" className="btn btn-secondary btn-sm">
            👥 Discover Students
          </Link>
          <Link to="/student/my-projects" className="btn btn-secondary btn-sm">
            📁 My Projects
          </Link>
          <Link to="/student/create-project" className="btn btn-accent btn-sm">
            + Create Project Idea
          </Link>
        </div>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="filter-toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search projects by title, category, or required skill (e.g. React, UI/UX, Python)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-row">
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Category
            </label>
            <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || selectedCategory !== 'All') && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ alignSelf: 'flex-end', height: '36px' }}
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
            >
              ✕ Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
          Loading project ideas from database...
        </p>
      ) : projects.length > 0 ? (
        <div className="opportunities-grid">
          {projects.map((project) => {
            const teamCount = project.teamMembers?.length || 1;
            const totalSize = project.teamSize || 1;
            const isFull = teamCount >= totalSize;

            // Get open skill positions
            const openRoles = (project.skillRequirements || []).filter(
              (r) => r.filledCount < r.requiredCount
            );

            return (
              <div
                key={project._id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: isFull ? '4px solid var(--text-muted)' : '4px solid var(--accent-blue)',
                }}
              >
                <div>
                  {/* Header: Category & Capacity Pill */}
                  <div className="flex-between" style={{ marginBottom: '0.75rem', alignItems: 'center' }}>
                    <span className="badge badge-primary">{project.category}</span>
                    <span className={`badge ${isFull ? 'badge-neutral' : 'badge-success'}`}>
                      👥 Team: {teamCount} / {totalSize} {isFull ? '(Full)' : 'Members'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-dark-blue)', marginBottom: '0.5rem' }}>
                    {project.title}
                  </h3>

                  {/* Creator Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.875rem' }}>
                    <Avatar
                      src={project.creator?.profileImageUrl}
                      name={project.creator?.name || 'Creator'}
                      size="sm"
                    />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      Pitched by <strong>{project.creator?.name || 'Student'}</strong>
                    </span>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-dark)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    {project.shortDescription}
                  </p>

                  {/* Open Roles Required */}
                  <div style={{ marginBottom: '1.25rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-dark-blue)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                      Required Skills & Open Positions:
                    </div>

                    {project.skillRequirements && project.skillRequirements.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {project.skillRequirements.map((req, idx) => {
                          const filled = req.filledCount >= req.requiredCount;
                          return (
                            <span
                              key={idx}
                              className={`badge ${filled ? 'badge-neutral' : 'badge-accent'}`}
                              style={{ fontSize: '0.75rem' }}
                            >
                              {req.skill} ({req.level}) • {req.filledCount}/{req.requiredCount} {filled ? '✓' : ''}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        General team collaboration
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex-between" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.875rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {project.deadline ? `Due: ${project.deadline}` : 'Open Formation'}
                  </span>
                  <Link to={`/student/projects/${project._id}`} className="btn btn-primary btn-sm">
                    View Project Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="💡"
          title="No Project Ideas Found"
          description="Be the first collegiate innovator to pitch a project and recruit talented student teammates!"
          actionText="+ Create Project Idea"
          onAction={() => window.location.href = '/student/create-project'}
        />
      )}
    </div>
  );
}
