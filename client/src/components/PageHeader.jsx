import React from 'react';
import '../styles/dashboard.css';

export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header-container">
      <div>
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
      {children && <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>{children}</div>}
    </div>
  );
}
