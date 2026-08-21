import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHealthStatus, fetchOpportunities } from '../services/api';
import OpportunityCard from '../components/OpportunityCard';
import EmptyState from '../components/EmptyState';

export default function Home() {
  const [backendHealth, setBackendHealth] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHealthStatus()
      .then((data) => setBackendHealth(data))
      .catch(() => setBackendHealth({ status: 'offline' }));

    fetchOpportunities()
      .then((data) => {
        setOpportunities(data.opportunities || []);
      })
      .catch((err) => {
        console.error('Error loading featured opportunities:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { type: 'Internships', icon: '💼', desc: 'Industry internships at startups & top tech enterprises' },
    { type: 'Hackathons', icon: '⚡', desc: 'Compete, collaborate, and build innovative solutions' },
    { type: 'Full-Time Jobs', icon: '🎯', desc: 'Entry-level and graduate developer positions' },
    { type: 'Workshops', icon: '🛠️', desc: 'Upskill with hands-on bootcamps and tech masterclasses' },
    { type: 'Competitions', icon: '🏆', desc: 'Algorithmic challenges, case studies & prize pools' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={{ backgroundColor: 'var(--primary-dark-blue)', color: 'var(--white)', padding: '4.5rem 0', position: 'relative', borderBottom: '3px solid var(--accent-blue)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '880px' }}>
          {/* Health Pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--secondary-blue)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: backendHealth?.database === 'Connected' ? 'var(--success)' : 'var(--warning)' }}></span>
            <span>API Server: {backendHealth?.database === 'Connected' ? 'Online & Database Connected' : 'Connecting...'}</span>
          </div>

          <h1 style={{ color: 'var(--white)', fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '1.25rem' }}>
            Discover High-Impact Student Opportunities Tailored to Your Skills
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '1.125rem', lineHeight: 1.6, marginBottom: '2.25rem', maxWidth: '720px', margin: '0 auto 2.25rem auto' }}>
            Campus Launch Pad connects college students to vetted internships, hackathons, jobs, and workshops through an explainable skill-matching engine.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-accent btn-lg">
              Get Started — Register Free
            </Link>
            <Link to="/student/opportunities" className="btn btn-outline-white btn-lg">
              Explore Opportunities
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--background-gray)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>How Campus Launch Pad Works</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Three simple steps to supercharge your campus career journey.
            </p>
          </div>

          <div className="grid-3">
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👤</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>1. Build Your Profile</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Add your college, course, technical skills with proficiency levels, interested domains, and GitHub project links.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎯</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>2. Explainable Matching</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Our transparent scoring algorithm (50% Skills, 30% Domain, 20% Interests) calculates personalized match scores with clear reasons.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚀</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>3. Apply & Track</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Save interesting listings, submit applications directly, and track your progress in your student dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Opportunities Section (Real Database Opportunities) */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--white)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div className="flex-between" style={{ marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>Featured Opportunities</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
                Handpicked listings curated for active student developers.
              </p>
            </div>
            <Link to="/student/opportunities" className="btn btn-secondary">
              View All Opportunities →
            </Link>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading opportunities from database...</p>
          ) : opportunities.length > 0 ? (
            <div className="opportunities-grid">
              {opportunities.slice(0, 3).map((opp) => (
                <OpportunityCard key={opp._id || opp.id} opportunity={opp} showMatchScore={false} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="💼"
              title="No Opportunities Listed Yet"
              description="New internships, hackathons, and jobs will appear here as organizations publish them."
            />
          )}
        </div>
      </section>

      {/* Opportunity Categories */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--background-gray)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Explore by Opportunity Type</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              Find the specific experience you need to level up your portfolio.
            </p>
          </div>

          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                to={`/student/opportunities?type=${cat.type.split(' ')[0]}`}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '1.75rem 1.25rem',
                  textDecoration: 'none',
                }}
              >
                <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{cat.icon}</div>
                <h3 style={{ fontSize: '1.125rem', color: 'var(--primary-dark-blue)', marginBottom: '0.35rem' }}>
                  {cat.type}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{ backgroundColor: 'var(--deep-navy)', color: 'var(--white)', padding: '4rem 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <h2 style={{ color: 'var(--white)', fontSize: '2rem', marginBottom: '1rem' }}>
            Ready to Accelerate Your Career?
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '1rem', marginBottom: '2rem' }}>
            Join collegiate innovators discovering top opportunities every day.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-accent btn-lg">
              Create Your Student Account
            </Link>
            <Link to="/about" className="btn btn-secondary btn-lg">
              Learn How Matching Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
