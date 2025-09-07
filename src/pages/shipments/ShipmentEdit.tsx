import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import EmptyState from '../clients/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { getShipments, upsertShipment } from '../../lib/repos/shipmentRepo';
import ClientPicker from '../../components/pickers/ClientPicker';

export default function ShipmentEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { push } = useToast();
  const [shipment, setShipment] = React.useState<ReturnType<typeof getShipments>[number] | null>(null);
  const [clientId, setClientId] = React.useState('');
  const [carrier, setCarrier] = React.useState<'UPS' | 'FedEx' | 'USPS' | 'DHL' | 'Other'>('Other');
  const [tracking, setTracking] = React.useState('');
  const [status, setStatus] = React.useState<'Pending' | 'Packed' | 'Shipped' | 'Delivered' | 'Exception'>('Pending');
  const [shippedAt, setShippedAt] = React.useState('');

  React.useEffect(() => {
    const all = getShipments();
    const s = all.find(x => x.id === id);
    if (s) {
      setShipment(s);
      setClientId(s.clientId);
      setCarrier(s.carrier);
      setTracking(s.tracking || '');
      setStatus(s.status);
      setShippedAt(s.shippedAt || '');
    }
  }, [id]);

  if (!shipment) {
    return (
      <EmptyState
        title="Shipment not found"
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

    try {
      upsertShipment({
        ...shipment,
        clientId,
        carrier,
        tracking: tracking || undefined,
        status,
        shippedAt: shippedAt || undefined
      });
      push({ text: 'Shipment updated', kind: 'success' });
      navigate(`/shipments/${id}`);
    } catch (e) {
      push({ text: 'Failed to update shipment', kind: 'error' });
    }
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ marginTop: 0 }}>Edit Shipment</h1>
      </div>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <label style={{ fontWeight: 600 }}>Client*</label>
          <ClientPicker value={clientId} onChange={setClientId} />
        </div>

        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <label style={{ fontWeight: 600 }}>Carrier</label>
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value as typeof carrier)}
            style={{
              background: 'transparent',
              color: 'var(--color-fg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '0.45rem 0.5rem'
            }}
          >
            <option value="UPS" style={{ color: 'black' }}>UPS</option>
            <option value="FedEx" style={{ color: 'black' }}>FedEx</option>
            <option value="USPS" style={{ color: 'black' }}>USPS</option>
            <option value="DHL" style={{ color: 'black' }}>DHL</option>
            <option value="Other" style={{ color: 'black' }}>Other</option>
          </select>
        </div>

        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <label style={{ fontWeight: 600 }}>Tracking Number</label>
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="1Z999AA1012345675"
            style={{
              background: 'transparent',
              color: 'var(--color-fg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '0.5rem'
            }}
          />
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
            <option value="Pending" style={{ color: 'black' }}>Pending</option>
            <option value="Packed" style={{ color: 'black' }}>Packed</option>
            <option value="Shipped" style={{ color: 'black' }}>Shipped</option>
            <option value="Delivered" style={{ color: 'black' }}>Delivered</option>
            <option value="Exception" style={{ color: 'black' }}>Exception</option>
          </select>
        </div>

        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <label style={{ fontWeight: 600 }}>Shipped At</label>
          <input
            type="datetime-local"
            value={shippedAt ? new Date(shippedAt).toISOString().slice(0, 16) : ''}
            onChange={(e) => setShippedAt(e.target.value ? new Date(e.target.value).toISOString() : '')}
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
          <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Items ({shipment.lines.length})</h3>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
            Item editing is not available in this view. Use the create form to modify line items.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <Button variant="primary" type="submit" aria-label="Save Changes">
            Save Changes
          </Button>
          <Button
            variant="ghost"
            type="button"
            onClick={() => navigate(`/shipments/${id}`)}
            aria-label="Cancel"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}