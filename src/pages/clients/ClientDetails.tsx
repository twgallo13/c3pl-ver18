import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { getClients } from '../../lib/repos/clientRepo';

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = React.useState<'loading'|'ready'|'empty'|'error'>('loading');
  const [error, setError] = React.useState<string|undefined>();
  const [client, setClient] = React.useState<ReturnType<typeof getClients>[number] | null>(null);

  React.useEffect(() => {
    try {
      const all = getClients();
      const c = all.find(x => x.id === id);
      if (!c) {
        setStatus('empty');
      } else {
        setClient(c);
        setStatus('ready');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setStatus('error');
    }
  }, [id]);

  if (status === 'loading') return <Loading label="Loading client…" />;
  if (status === 'error') return <ErrorState title="Failed to load" detail={error} />;
  if (status === 'empty') return <EmptyState title="Client not found" detail="Go back to the list and pick another." />;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
        <h1 style={{ marginTop: 0 }}>{client!.name}</h1>
        <div>
          <Link to={`/clients/${client!.id}/edit`} style={{ color: 'var(--color-muted)', textDecoration:'none', marginRight: '0.75rem' }}>
            Edit
          </Link>
          <Link to="/clients" style={{ color: 'var(--color-muted)', textDecoration:'none' }}>← Back to Clients</Link>
        </div>
      </div>

      <div style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        padding: '0.75rem',
        background: 'rgba(255,255,255,0.03)'
      }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Primary Contact</strong>
        </div>
        <div style={{ color: 'var(--color-muted)' }}>
          {(client!.contacts?.[0]?.email || 'no email')} · {(client!.contacts?.[0]?.phone || 'no phone')}
        </div>
      </div>
    </div>
  );
}