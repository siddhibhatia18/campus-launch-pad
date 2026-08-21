import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import '../styles/dashboard.css';

export default function Sidebar({ role = 'student' }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const isStudent = role === 'student';

  const studentLinks = [
    { to: '/student/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/student/profile', icon: '👤', label: 'My Profile' },
    { to: '/student/discover', icon: '👥', label: 'Discover Students', badge: 'Squads' },
    { to: '/student/projects', icon: '💡', label: 'Project Ideas', badge: 'New' },
    { to: '/student/my-projects', icon: '🚀', label: 'My Projects' },
    { to: '/student/invitations', icon: '📬', label: 'Team Invitations' },
    { to: '/student/opportunities', icon: '🔍', label: 'Explore Opportunities' },
    { to: '/student/saved', icon: '🔖', label: 'Saved Opportunities' },
    { to: '/student/applications', icon: '📝', label: 'My Applications' },
    { to: '/student/recommendations', icon: '✨', label: 'Recommendations', badge: 'AI' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: '🛡️', label: 'Admin Dashboard' },
    { to: '/admin/opportunities', icon: '📋', label: 'Manage Opportunities' },
    { to: '/admin/students', icon: '👥', label: 'Registered Students' },
  ];

  const links = isStudent ? studentLinks : adminLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="dashboard-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <span className="sidebar-logo">🚀</span>
        <div style={{ flex: 1 }}>
          <div className="sidebar-brand-name">Campus Launch</div>
          <span className="sidebar-portal-tag">{isStudent ? 'Student Portal' : 'Admin Console'}</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main Menu</div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{link.icon}</span>
            <span>{link.label}</span>
            {link.badge && <span className="sidebar-badge">{link.badge}</span>}
          </NavLink>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: '1.25rem' }}>Navigation</div>
        <Link to="/" className="sidebar-link" style={{ opacity: 0.8 }}>
          <span className="sidebar-icon">🌐</span>
          <span>Public Website</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', opacity: 0.8 }}
        >
          <span className="sidebar-icon">🚪</span>
          <span>Sign Out</span>
        </button>
      </nav>

      {/* Real User Profile Footer Card */}
      <div className="sidebar-footer">
        <div className="user-mini-card">
          <Avatar
            src={profile?.profileImageUrl || user?.profileImageUrl}
            name={user?.name || 'User'}
            size="md"
          />
          <div className="user-info-text">
            <div className="user-name">{user?.name || 'Authenticated User'}</div>
            <div className="user-role">{user?.email || 'Active Session'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
