import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import '../styles/navbar.css';

export default function Navbar() {
  const { user, profile, isAuthenticated, isStudent, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="public-header">
      <div className="container">
        <nav className="navbar">
          {/* Brand Logo */}
          <Link to="/" className="nav-brand">
            <span className="nav-brand-logo">🚀</span>
            <div>
              <div className="nav-brand-title">Campus Launch Pad</div>
              <div className="nav-brand-tagline">Student Opportunity & Team Formation</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/student/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                💡 Project Ideas
              </NavLink>
            </li>
            <li>
              <NavLink to="/student/opportunities" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Explore Opportunities
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                About & Matching
              </NavLink>
            </li>
            {isStudent && (
              <li>
                <NavLink to="/student/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Dashboard
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li>
                <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Admin Console
                </NavLink>
              </li>
            )}
          </ul>

          {/* Actions & User State */}
          <div className="nav-actions">
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link
                  to={isStudent ? '/student/dashboard' : '/admin/dashboard'}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--white)', fontWeight: 600, fontSize: '0.875rem' }}
                >
                  <Avatar
                    src={profile?.profileImageUrl}
                    name={user?.name || 'User'}
                    size="sm"
                  />
                  <span>{user?.name}</span>
                </Link>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--white)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-accent btn-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
