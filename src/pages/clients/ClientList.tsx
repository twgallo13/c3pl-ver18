import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getClients } from '../../lib/repos/clientRepo';
import { Button } from '../../components/ui/button';

export default function ClientList() {
  const [clients, setClients] = React.useState(() => getClients());
  const navigate = useNavigate();

  // In a later prompt we might add events or a bus; for now manual refresh
  function refresh() {
    setClients(getClients());
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: '1rem' }}>
        <h1 style={{ marginTop: 0 }}>Clients</h1>
        <Button onClick={() => navigate('/clients/new')} aria-label="Add Client">
          Add Client
        </Button>
      </div>
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
              <div>
                <Link to={`/clients/${c.id}`} style={{ color: 'var(--color-fg)', textDecoration: 'none' }}>
                  <strong>{c.name}</strong>
                </Link>
              </div>
              <div style={{ color: 'var(--color-muted)', fontSize: 12 }}>
                {(c.contacts?.[0]?.email || 'no email')} · {(c.contacts?.[0]?.phone || 'no phone')}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div style={{ display:'flex', gap:'0.5rem', marginTop: '1rem' }}>
        <Button variant="muted" onClick={refresh}>
          Refresh
        </Button>
      </div>
    </div>
  );
}