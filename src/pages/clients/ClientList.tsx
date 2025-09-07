import React from 'react';
import { getClients } from '../../lib/repos/clientRepo';

export default function ClientList() {
  const [clients, setClients] = React.useState(() => getClients());

  // In a later prompt we might add events or a bus; for now manual refresh
  function refresh() {
    setClients(getClients());
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Clients</h1>
      <p style={{ color: 'var(--color-muted)' }}>
        Showing {clients.length} client{clients.length === 1 ? '' : 's'} (local demo).
      </p>
      {clients.length === 0 ? (
        <p style={{ color: 'var(--color-muted)' }}>No clients yet. Promote a lead to create one.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {clients.map(c => (
            <li key={c.id} style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <div><strong>{c.name}</strong></div>
              <div style={{ color: 'var(--color-muted)', fontSize: 12 }}>
                {(c.contacts?.[0]?.email || 'no email')} · {(c.contacts?.[0]?.phone || 'no phone')}
              </div>
            </li>
          ))}
        </ul>
      )}
      <button onClick={refresh}
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          padding: '0.5rem 0.75rem',
          background: 'transparent',
          color: 'var(--color-fg)',
          cursor: 'pointer'
        }}>
        Refresh
      </button>
    </div>
  );
}