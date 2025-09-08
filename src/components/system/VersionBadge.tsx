import React from 'react';
import { APP_VERSION } from '../../version';

export function VersionBadge({ prefix = '' }: { prefix?: string }) {
  return (
    <span
      title="Application version"
      style={{
        fontSize: 12,
        color: 'var(--color-muted)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        padding: '0.15rem 0.4rem',
        background: 'rgba(255,255,255,0.03)',
        whiteSpace: 'nowrap'
      }}
    >
      {prefix ? `${prefix} ` : ''}{APP_VERSION}
    </span>
  );
}
