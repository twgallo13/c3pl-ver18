import React from 'react';

type Props = {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

export default function FormField({ label, hint, error, children }: Props) {
  return (
    <div style={{ display: 'grid', gap: 6, marginBottom: '0.75rem' }}>
      <label style={{ color: 'var(--color-fg)', fontSize: 14, fontWeight: 600 }}>{label}</label>
      {children}
      {hint && !error ? (
        <div style={{ color: 'var(--color-muted)', fontSize: 12 }}>{hint}</div>
      ) : null}
      {error ? (
        <div style={{ color: '#ff6b6b', fontSize: 12 }}>{error}</div>
      ) : null}
    </div>
  );
}