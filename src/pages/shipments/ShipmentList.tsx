import React from 'react';
import { Link } from 'react-router-dom';
import { getShipments, removeShipment } from '../../lib/repos/shipmentRepo';
import { useToast } from '../../components/ui/Toast';
import { clientName } from '../../lib/lookup';

export default function ShipmentList() {
  const [items, setItems] = React.useState(() => getShipments());
  const [q, setQ] = React.useState('');
  const { push } = useToast();

  function refresh() { setItems(getShipments()); }
  const matches = (s: string) => s.toLowerCase().includes(q.trim().toLowerCase());

  const filtered = React.useMemo(
    () => items.filter(s =>
      matches(s.id) ||
      matches(s.clientId) ||
      matches(s.carrier) ||
      matches(s.status) ||
      matches(s.tracking || '')
    ),
    [items, q]
  );

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
        <h1 style={{ marginTop: 0 }}>Shipments</h1>
        <Link to="/shipments/new" style={{
          textDecoration:'none', border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
          padding:'0.4rem 0.6rem', color:'var(--color-fg)'
        }}>+ New</Link>
      </div>

      <div style={{ display:'flex', gap:'0.5rem', margin:'0.75rem 0' }}>
        <input
          placeholder="Search by id, client id, carrier, status, tracking"
          value={q} onChange={e => setQ(e.target.value)}
          style={{ background:'transparent', color:'var(--color-fg)', border:'1px solid var(--color-border)',
            borderRadius:'var(--radius)', padding:'0.5rem', minWidth:320 }}
        />
        <button onClick={refresh} style={{
          border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
          padding:'0.5rem 0.75rem', background:'transparent', color:'var(--color-fg)', cursor:'pointer'
        }}>Refresh</button>
      </div>

      {filtered.length === 0 ? (
        <p style={{ color:'var(--color-muted)' }}>No shipments.</p>
      ) : (
        <ul style={{ listStyle:'none', padding:0 }}>
          {filtered.map(s => (
            <li key={s.id} style={{
              border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
              padding:'0.5rem', marginBottom:'0.5rem'
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', gap:'0.5rem' }}>
                <div>
                  <div><strong>Shipment {s.id.slice(0,8)}</strong> — {s.status}</div>
                  <div style={{ color:'var(--color-muted)', fontSize:12 }}>
                    Client: <Link to={`/clients/${s.clientId}`} style={{ color:'var(--color-muted)', textDecoration:'none' }}>
                      {clientName(s.clientId)}
                    </Link>
                    {` · Carrier: ${s.carrier}`}
                    {s.tracking ? ` · Tracking: ${s.tracking}` : ''}
                    {' · Created: '}{new Date(s.createdAt).toLocaleString()}
                    {s.shippedAt ? ` · Shipped: ${new Date(s.shippedAt).toLocaleString()}` : ''}
                  </div>
                </div>
                <div style={{ display:'flex', gap:'0.5rem' }}>
                  <button onClick={() => { removeShipment(s.id); refresh(); push({ text: 'Shipment deleted', kind: 'success' }); }} style={{
                    border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
                    padding:'0.35rem 0.6rem', background:'transparent', color:'var(--color-fg)', cursor:'pointer'
                  }}>Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}