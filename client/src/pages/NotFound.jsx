import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-container flex-center" style={{ minHeight: '60vh', textAlign: 'center' }}>
      <div className="card" style={{ maxWidth: '480px', padding: '3rem 2rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🧭</div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--primary-dark-blue)' }}>
          404 — Page Not Found
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', fontSize: '0.9375rem' }}>
          The page or route you requested does not exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            Return to Home
          </Link>
          <Link to="/student/dashboard" className="btn btn-secondary">
            Student Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
