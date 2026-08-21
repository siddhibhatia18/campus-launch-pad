import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/navbar.css';

export default function Footer() {
  return (
    <footer className="public-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-brand">
            <h3>🚀 Campus Launch Pad</h3>
            <p>
              An intelligent, explainable student opportunity discovery platform connecting
              talented students to high-impact internships, hackathons, jobs, and workshops.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Platform</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About & Matching</Link></li>
              <li><Link to="/student/opportunities">Explore Opportunities</Link></li>
              <li><Link to="/register">Student Sign Up</Link></li>
            </ul>
          </div>

          {/* Student Portal */}
          <div className="footer-col">
            <h4>Student Space</h4>
            <ul className="footer-links">
              <li><Link to="/student/dashboard">Dashboard</Link></li>
              <li><Link to="/student/profile">My Profile</Link></li>
              <li><Link to="/student/recommendations">Recommendations</Link></li>
              <li><Link to="/student/applications">My Applications</Link></li>
            </ul>
          </div>

          {/* Live System Status Card */}
          <div className="footer-col">
            <h4>System Status</h4>
            <div className="footer-status-card">
              <div className="footer-status-title">Backend Status</div>
              <div className="footer-status-indicator">
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
                <span>Express API: <strong>Operational</strong></span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.5rem' }}>
                Architecture: React + Express + MongoDB Atlas
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Campus Launch Pad. All rights reserved.</p>
          <p>Built with React, Express, and Plain CSS.</p>
        </div>
      </div>
    </footer>
  );
}
