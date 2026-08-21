import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import '../styles/dashboard.css';

export default function StudentLayout() {
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname.includes('/student/dashboard')) return 'Student Dashboard';
    if (pathname.includes('/student/profile')) return 'My Profile';
    if (pathname.includes('/student/opportunities')) return 'Explore Opportunities';
    if (pathname.includes('/student/saved')) return 'Saved Opportunities';
    if (pathname.includes('/student/applications')) return 'My Applications';
    if (pathname.includes('/student/recommendations')) return 'Personalized Recommendations';
    return 'Student Portal';
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="student" />
      <div className="dashboard-main">
        <DashboardHeader title={getPageTitle(location.pathname)} portal="Student" />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
