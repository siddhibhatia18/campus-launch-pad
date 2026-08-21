import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import '../styles/dashboard.css';

export default function AdminLayout() {
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname.includes('/admin/dashboard')) return 'Admin Overview';
    if (pathname.includes('/admin/opportunities')) return 'Manage Opportunities';
    if (pathname.includes('/admin/students')) return 'Registered Students';
    return 'Admin Console';
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />
      <div className="dashboard-main">
        <DashboardHeader title={getPageTitle(location.pathname)} portal="Admin" />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
