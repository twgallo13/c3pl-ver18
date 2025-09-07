import React from 'react';

export default function ErrorState({
  title = 'Something went wrong',
  detail,
  action,
}: { title?: string; detail?: string; action?: React.ReactNode }) {
  return (
    <div role="alert">
      <h2 style={{ margin: 0 }}>{title}</h2>
      {detail && <p style={{ color: 'var(--color-muted)' }}>{detail}</p>}
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  );
}