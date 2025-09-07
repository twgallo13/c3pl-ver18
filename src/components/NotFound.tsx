import React from 'react';

export default function NotFound() {
  return (
    <div>
      <h1 style={{ margin: 0 }}>Not Found</h1>
      <p style={{ color: 'var(--color-muted)' }}>
        The page you're looking for doesn't exist or you don't have access.
      </p>
    </div>
  );
}