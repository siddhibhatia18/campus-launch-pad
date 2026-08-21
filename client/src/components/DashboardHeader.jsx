import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import '../styles/dashboard.css';

export default function DashboardHeader({ title = 'Dashboard' }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="dashboard-topbar">
      <div className="dashboard-title-area">
        <h2>{title}</h2>
      </div>

      <div className="dashboard-topbar-actions">
        <Link to="/" className="topbar-portal-btn">
          🏠 Public Home
        </Link>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Avatar
              src={profile?.profileImageUrl}
              name={user.name}
              size="sm"
            />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {user.name} ({user.role})
            </span>
          </div>
        )}
        <button type="button" onClick={handleLogout} className="btn btn-secondary btn-sm">
          Log Out
        </button>
      </div>
    </header>
  );
}
