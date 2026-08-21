import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge badge-accent" style={{ marginBottom: '0.75rem' }}>About Platform</span>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            Empowering Campus Innovators Through Explainable Opportunity Matching
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', lineHeight: 1.6 }}>
            Campus Launch Pad was built to solve the fragmentation in student discovery: helping students find the right internships, hackathons, and jobs based on verified technical alignment.
          </p>
        </div>

        {/* The Explainable Recommendation Engine Section */}
        <div className="card" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-dark-blue)' }}>
            🧠 Real Explainable Recommendation Engine
          </h2>
          <p style={{ color: 'var(--text-dark)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
            Unlike black-box algorithms or superficial keyword searches, Campus Launch Pad implements a clear, deterministic, and explainable scoring model ranging from 0 to 100:
          </p>

          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--background-gray)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--primary-dark-blue)' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-dark-blue)' }}>50%</div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginTop: '0.25rem' }}>Skill Match</div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Evaluates overlap between required technical competencies and student skills with proficiency weighting.
              </p>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: 'var(--background-gray)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--secondary-blue)' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary-blue)' }}>30%</div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginTop: '0.25rem' }}>Domain Match</div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Aligns opportunity domain (Web, AI, Cloud, Systems) with student career preferences.
              </p>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: 'var(--background-gray)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--accent-blue)' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-blue)' }}>20%</div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginTop: '0.25rem' }}>Interest Match</div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Factors in specific interests such as Hackathons, Open Source, or Developer Tooling.
              </p>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--accent-light)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 182, 0.2)', fontSize: '0.875rem' }}>
            <strong>💡 Transparency Guarantee:</strong> Every recommendation returns the exact breakdown — list of matched skills, missing skills, and detailed bulleted reasons so students know exactly how to upskill.
          </div>
        </div>

        {/* Architecture & Engineering Standards */}
        <div className="card" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-dark-blue)' }}>
            🏗️ Production Architecture
          </h2>
          <div className="grid-2">
            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Frontend Client</h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-dark)', lineHeight: 1.8 }}>
                <li>React 18 with Vite for ultra-fast HMR</li>
                <li>Plain CSS modular design system tokens</li>
                <li>Accessible, responsive layout</li>
                <li>Axios service layer with centralized error handling</li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Backend API & Database</h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-dark)', lineHeight: 1.8 }}>
                <li>Node.js & Express.js RESTful architecture</li>
                <li>MongoDB Atlas with Mongoose data schemas</li>
                <li>Stateless JWT authentication & bcrypt password hashing</li>
                <li>Protected role-based authorization for students & admins</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/student/opportunities" className="btn btn-primary btn-lg" style={{ marginRight: '1rem' }}>
            Explore Opportunities
          </Link>
          <Link to="/student/dashboard" className="btn btn-secondary btn-lg">
            View Student Dashboard Demo
          </Link>
        </div>
      </div>
    </div>
  );
}
