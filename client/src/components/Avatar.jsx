import React, { useState } from 'react';

export default function Avatar({
  src = '',
  name = '',
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  style = {},
}) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const dimensions = {
    xs: { width: '24px', height: '24px', fontSize: '0.65rem' },
    sm: { width: '32px', height: '32px', fontSize: '0.75rem' },
    md: { width: '42px', height: '42px', fontSize: '0.9rem' },
    lg: { width: '60px', height: '60px', fontSize: '1.25rem' },
    xl: { width: '96px', height: '96px', fontSize: '2rem' },
  };

  const currentSize = dimensions[size] || dimensions.md;

  // Resolve backend static upload URL if relative path
  const backendBase = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
  const fullSrc = src && src.startsWith('/') ? `${backendBase}${src}` : src;

  const avatarContainerStyle = {
    width: currentSize.width,
    height: currentSize.height,
    minWidth: currentSize.width,
    minHeight: currentSize.height,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'var(--secondary-blue)',
    color: 'var(--white)',
    fontWeight: 700,
    fontSize: currentSize.fontSize,
    letterSpacing: '0.02em',
    userSelect: 'none',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    boxShadow: 'var(--shadow-sm)',
    ...style,
  };

  if (fullSrc && !imageError) {
    return (
      <div className={`user-avatar-wrapper ${className}`} style={avatarContainerStyle}>
        <img
          src={fullSrc}
          alt={name ? `${name}'s avatar` : 'User profile'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`user-avatar-wrapper ${className}`}
      style={avatarContainerStyle}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
