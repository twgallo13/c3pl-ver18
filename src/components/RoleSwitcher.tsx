import React from 'react';

const ROLES = [
  'Admin',
  'Finance',
  'Ops',
  'CS',
  'AccountManager',
  'WarehouseManager',
  'WarehouseStaff',
  'Vendor',
  'Investor'
] as const;

export default function RoleSwitcher() {
  const current = (typeof localStorage !== 'undefined' && localStorage.getItem('currentRole')) || 'Admin';

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    localStorage.setItem('currentRole', val);
    window.location.reload(); // simple refresh so AppShell re-evaluates allowed routes
  }

  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 12 }}>
      <span style={{ color: 'var(--color-muted)' }}>Role (local test)</span>
      <select
        value={current}
        onChange={onChange}
        style={{
          background: 'transparent',
          color: 'var(--color-fg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          padding: '0.35rem 0.5rem',
          outline: 'none'
        }}
      >
        {ROLES.map(r => (
          <option key={r} value={r} style={{ color: 'black' }}>
            {r}
          </option>
        ))}
      </select>
    </label>
  );
}