import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import EmptyState from '../clients/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { getPurchaseOrders, upsertPurchaseOrder } from '../../lib/repos/poRepo';
import ClientPicker from '../../components/pickers/ClientPicker';
import VendorPicker from '../../components/pickers/VendorPicker';

export default function POEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { push } = useToast();
  const [po, setPo] = React.useState<ReturnType<typeof getPurchaseOrders>[number] | null>(null);
  const [clientId, setClientId] = React.useState('');
  const [vendorId, setVendorId] = React.useState('');
  const [status, setStatus] = React.useState<'Draft' | 'Submitted' | 'Received' | 'Closed' | 'Canceled'>('Draft');
  const [expectedAt, setExpectedAt] = React.useState('');

  React.useEffect(() => {
    const all = getPurchaseOrders();
    const p = all.find(x => x.id === id);
    if (p) {
      setPo(p);
      setClientId(p.clientId);
      setVendorId(p.vendorId);
      setStatus(p.status);
      setExpectedAt(p.expectedAt || '');
    }
  }, [id]);

  if (!po) {
    return (
      <EmptyState
        title="Purchase Order not found"
        subtitle="It may have been deleted or the link is incorrect."
      />
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      push({ text: 'Client is required', kind: 'error' });
      return;
    }
    if (!vendorId) {
      push({ text: 'Vendor is required', kind: 'error' });
      return;
    }

    try {
      upsertPurchaseOrder({
        ...po,
        clientId,
        vendorId,
        status,
        expectedAt: expectedAt || undefined
      });
      push({ text: 'Purchase order updated', kind: 'success' });
      navigate(`/po/${id}`);
    } catch (e) {
      push({ text: 'Failed to update purchase order', kind: 'error' });
    }
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ marginTop: 0 }}>Edit Purchase Order</h1>
      </div>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <label style={{ fontWeight: 600 }}>Client*</label>
          <ClientPicker value={clientId} onChange={setClientId} />
        </div>

        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <label style={{ fontWeight: 600 }}>Vendor*</label>
          <VendorPicker value={vendorId} onChange={setVendorId} />
        </div>

        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <label style={{ fontWeight: 600 }}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            style={{
              background: 'transparent',
              color: 'var(--color-fg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '0.45rem 0.5rem'
            }}
          >
            <option value="Draft" style={{ color: 'black' }}>Draft</option>
            <option value="Submitted" style={{ color: 'black' }}>Submitted</option>
            <option value="Received" style={{ color: 'black' }}>Received</option>
            <option value="Closed" style={{ color: 'black' }}>Closed</option>
            <option value="Canceled" style={{ color: 'black' }}>Canceled</option>
          </select>
        </div>

        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <label style={{ fontWeight: 600 }}>Expected At (ISO 8601)</label>
          <input
            type="datetime-local"
            value={expectedAt ? new Date(expectedAt).toISOString().slice(0, 16) : ''}
            onChange={(e) => setExpectedAt(e.target.value ? new Date(e.target.value).toISOString() : '')}
            style={{
              background: 'transparent',
              color: 'var(--color-fg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '0.5rem'
            }}
          />
        </div>

        <div style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          padding: '0.75rem',
          background: 'rgba(255,255,255,0.03)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Lines ({po.lines.length})</h3>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
            Line editing is not available in this view. Use the create form to modify line items.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <Button variant="primary" type="submit" aria-label="Save Changes">Save Changes</Button>
          <Button variant="ghost" type="button" onClick={() => navigate(`/po/${id}`)} aria-label="Cancel">Cancel</Button>
        </div>
      </form>
    </div>
  );
}