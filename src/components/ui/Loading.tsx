import React from 'react';

export default function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div aria-busy="true" style={{ color: 'var(--color-muted)' }}>{label}</div>
  );
}