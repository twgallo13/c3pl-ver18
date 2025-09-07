import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../clients/EmptyState';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/Toast';
import { getPurchaseOrders, removePurchaseOrder } from '../../lib/repos/poRepo';
import { clientName, vendorName } from '../../lib/lookup';

export default function PODetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { push } = useToast();
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'empty' | 'error'>('loading');
  const [error, setError] = React.useState<string | undefined>();
  const [po, setPo] = React.useState<ReturnType<typeof getPurchaseOrders>[number] | null>(null);

  React.useEffect(() => {
    try {
      const all = getPurchaseOrders();
      const p = all.find(x => x.id === id);
      if (!p) {
        setStatus('empty');
      } else {
        setPo(p);
        setStatus('ready');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setStatus('error');
    }
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this purchase order?')) return;
    if (!id) return;
    try {
      removePurchaseOrder(id);
      push({ text: 'Purchase order deleted', kind: 'success' });
      navigate('/po');
    } catch (e) {
      push({ text: 'Failed to delete purchase order', kind: 'error' });
    }
  };

  if (status === 'loading') return <Loading label="Loading purchase order…" />;
  if (status === 'error') return <ErrorState title="Failed to load" detail={error} />;
  if (status === 'empty') return (
    <EmptyState
      title="Purchase Order not found"
      subtitle="It may have been deleted or the link is incorrect."
    />
  );

  const totalAmount = po!.lines.reduce((sum, line) => sum + (line.qtyOrdered * line.unitCost.amount), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ marginTop: 0 }}>PO {po!.id.slice(0, 8)}</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Button
            variant="muted"
            onClick={() => navigate(`/po/${po!.id}/edit`)}
            aria-label="Edit PO"
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            aria-label="Delete PO"
          >
            Delete
          </Button>
          <Link to="/po" style={{ color: 'var(--color-muted)', textDecoration: 'none', marginLeft: '0.5rem' }}>← Back to POs</Link>
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
            <strong>Status:</strong> {po!.status}
          </div>
          <div>
            <strong>Client:</strong> {clientName(po!.clientId)}
          </div>
          <div>
            <strong>Vendor:</strong> {vendorName(po!.vendorId)}
          </div>
          <div>
            <strong>Created:</strong> {new Date(po!.createdAt).toLocaleString()}
          </div>
          <div>
            <strong>Expected:</strong> {po!.expectedAt ? new Date(po!.expectedAt).toLocaleString() : '-'}
          </div>
          <div>
            <strong>Total Lines:</strong> {po!.lines.length}
          </div>
        </div>
      </div>

      <div style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        padding: '0.75rem',
        background: 'rgba(255,255,255,0.03)'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '0.75rem' }}>Lines</h3>
        {po!.lines.length === 0 ? (
          <p style={{ color: 'var(--color-muted)' }}>No lines in this purchase order.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Item ID</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Qty</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Unit Cost</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {po!.lines.map((line) => (
                  <tr key={line.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.5rem' }}>{line.itemId.slice(0, 8)}...</td>
                    <td style={{ padding: '0.5rem' }}>{line.qtyOrdered}</td>
                    <td style={{ padding: '0.5rem' }}>{line.unitCost.currency} {line.unitCost.amount}</td>
                    <td style={{ padding: '0.5rem' }}>{line.unitCost.currency} {(line.qtyOrdered * line.unitCost.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--color-border)', fontWeight: 600 }}>
                  <td colSpan={3} style={{ padding: '0.5rem' }}>Total:</td>
                  <td style={{ padding: '0.5rem' }}>{po!.lines[0]?.unitCost.currency || 'USD'} {totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}