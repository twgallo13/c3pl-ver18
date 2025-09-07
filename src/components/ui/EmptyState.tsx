import React from 'react';

export default function EmptyState({
  title = 'Nothing here yet',
  detail,
}: { title?: string; detail?: string }) {
  return (
    <div>
      <h2 style={{ margin: 0 }}>{title}</h2>
      {detail && <p style={{ color: 'var(--color-muted)' }}>{detail}</p>}
    </div>
  );
}