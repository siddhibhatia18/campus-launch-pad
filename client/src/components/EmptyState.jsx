import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon = '📭',
  title = 'No items found',
  description = 'There are no items matching your criteria at this moment.',
  actionText,
  onAction,
}) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        backgroundColor: 'var(--white)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-gray)',
        margin: '1.5rem 0',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1 }}>{icon}</div>
      <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-dark-blue)', marginBottom: '0.5rem' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
