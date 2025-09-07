import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../clients/EmptyState';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/Toast';
import { getShipments, removeShipment } from '../../lib/repos/shipmentRepo';
import { clientName, inventoryLabel } from '../../lib/lookup';

export default function ShipmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { push } = useToast();
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'empty' | 'error'>('loading');
  const [error, setError] = React.useState<string | undefined>();
  const [shipment, setShipment] = React.useState<ReturnType<typeof getShipments>[number] | null>(null);

  React.useEffect(() => {
    try {
      const all = getShipments();
      const s = all.find(x => x.id === id);
      if (!s) {
        setStatus('empty');
      } else {
        setShipment(s);
        setStatus('ready');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setStatus('error');
    }
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this shipment?')) return;
    if (!id) return;
    try {
      removeShipment(id);
      push({ text: 'Shipment deleted', kind: 'success' });
      navigate('/shipments');
    } catch (e) {
      push({ text: 'Failed to delete shipment', kind: 'error' });
    }
  };

  if (status === 'loading') return <Loading label="Loading shipment…" />;
  if (status === 'error') return <ErrorState title="Failed to load" detail={error} />;
  if (status === 'empty') return (
    <EmptyState
      title="Shipment not found"
      subtitle="It may have been deleted or the link is incorrect."
    />
  );

  const totalQty = shipment!.lines.reduce((sum, line) => sum + line.qty, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ marginTop: 0 }}>Shipment {shipment!.id.slice(0, 8)}</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Button
            variant="muted"
            onClick={() => navigate(`/shipments/${shipment!.id}/edit`)}
            aria-label="Edit Shipment"
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            aria-label="Delete Shipment"
          >
            Delete
          </Button>
          <Link to="/shipments" style={{ color: 'var(--color-muted)', textDecoration: 'none', marginLeft: '0.5rem' }}>← Back to Shipments</Link>
        </div>
      </div>

      <div style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        padding: '0.75rem',
        background: 'rgba(255,255,255,0.03)',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <strong>Status:</strong> {shipment!.status}
          </div>
          <div>
            <strong>Client:</strong> {clientName(shipment!.clientId)}
          </div>
          <div>
            <strong>Carrier:</strong> {shipment!.carrier}
          </div>
          <div>
            <strong>Tracking:</strong> {shipment!.tracking || '-'}
          </div>
          <div>
            <strong>Created:</strong> {new Date(shipment!.createdAt).toLocaleString()}
          </div>
          <div>
            <strong>Shipped:</strong> {shipment!.shippedAt ? new Date(shipment!.shippedAt).toLocaleString() : '-'}
          </div>
          <div>
            <strong>Total Items:</strong> {totalQty}
          </div>
          <div>
            <strong>Lines:</strong> {shipment!.lines.length}
          </div>
        </div>
      </div>

      <div style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        padding: '0.75rem',
        background: 'rgba(255,255,255,0.03)'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '0.75rem' }}>Items</h3>
        {shipment!.lines.length === 0 ? (
          <p style={{ color: 'var(--color-muted)' }}>No items in this shipment.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Item</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {shipment!.lines.map((line) => (
                  <tr key={line.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.5rem' }}>
                      {inventoryLabel(line.itemId) || `${line.itemId.slice(0, 8)}...`}
                    </td>
                    <td style={{ padding: '0.5rem' }}>{line.qty}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--color-border)', fontWeight: 600 }}>
                  <td style={{ padding: '0.5rem' }}>Total:</td>
                  <td style={{ padding: '0.5rem' }}>{totalQty}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}