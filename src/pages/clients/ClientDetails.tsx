import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from './EmptyState';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/Toast';
import { getAll, getById, deleteClient } from '../../lib/repos/clientRepo';
import { getPurchaseOrders } from '../../lib/repos/poRepo';
import { getShipments } from '../../lib/repos/shipmentRepo';

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { push } = useToast();
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'empty' | 'error'>('loading');
  const [error, setError] = React.useState<string | undefined>();
  const [client, setClient] = React.useState<ReturnType<typeof getAll>[number] | null>(null);

  React.useEffect(() => {
    try {
      const all = getAll();
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

  const handleDelete = async () => {
    if (!confirm('Delete this client?')) return;
    if (!id) return;
    try {
      deleteClient(id);
      push({ text: 'Client deleted', kind: 'success' });
      navigate('/clients');
    } catch (e) {
      push({ text: 'Failed to delete client', kind: 'error' });
    }
  };

  if (status === 'loading') return <Loading label="Loading client…" />;
  if (status === 'error') return <ErrorState title="Failed to load" detail={error} />;
  if (status === 'empty') return (
    <EmptyState
      title="Client not found"
      subtitle="It may have been deleted or the link is incorrect."
    />
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ marginTop: 0 }}>{client!.name}</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Button
            variant="muted"
            onClick={() => navigate(`/clients/${client!.id}/edit`)}
            aria-label="Edit Client"
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            aria-label="Delete Client"
          >
            Delete
          </Button>
          <Link to="/clients" style={{ color: 'var(--color-muted)', textDecoration: 'none', marginLeft: '0.5rem' }}>← Back to Clients</Link>
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
        <div style={{ marginTop: '0.5rem', color: 'var(--color-muted)' }}>
          <strong>Created:</strong> {client!.createdAt ? new Date(client!.createdAt).toLocaleString() : '-'}
        </div>
      </div>

      <div style={{
        marginTop: '0.75rem',
        border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
        padding: '0.75rem', background: 'rgba(255,255,255,0.03)'
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <strong>Related POs: </strong>
            {getPurchaseOrders().filter(p => p.clientId === client!.id).length}
          </div>
          <div>
            <strong>Related Shipments: </strong>
            {getShipments().filter(sh => sh.clientId === client!.id).length}
          </div>
        </div>
        <div style={{ color: 'var(--color-muted)', fontSize: 12, marginTop: '0.25rem' }}>
          (Lists remain on /po and /shipments; deep filters coming later.)
        </div>
      </div>
    </div>
  );
}