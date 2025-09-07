import React from 'react';
import { Link } from 'react-router-dom';
import { getShipments, removeShipment } from '../../lib/repos/shipmentRepo';
import { useToast } from '../../components/ui/Toast';
import { clientName } from '../../lib/lookup';
import { toCSV, downloadCSV } from '../../lib/csv';

export default function ShipmentList() {
  const [items, setItems] = React.useState(() => getShipments());
  const [qCarrier, setQCarrier] = React.useState<string>('');
  const [qTrack, setQTrack] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');
  const { push } = useToast();

  function refresh() { setItems(getShipments()); }
  const ci = (s: string | undefined, q: string | undefined) => {
    const sv = (s ?? '').toString().toLowerCase();
    const qv = (q ?? '').toString().toLowerCase();
    return sv.includes(qv.trim());
  };

  const filtered = React.useMemo(() =>
    items.filter(s =>
      (qCarrier ? ci(s.carrier, qCarrier) : true) &&
      (qTrack ? ci(s.tracking, qTrack) : true) &&
      (status ? s.status === status : true)
    ),
  [items, qCarrier, qTrack, status]);

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
        <h1 style={{ marginTop: 0 }}>Shipments</h1>
        <Link to="/shipments/new" style={{
          textDecoration:'none', border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
          padding:'0.4rem 0.6rem', color:'var(--color-fg)'
        }}>+ New</Link>
      </div>

      <div style={{ display:'flex', gap:'0.5rem', margin:'0.75rem 0', flexWrap:'wrap' }}>
        <input
          placeholder="Carrier"
          value={qCarrier} onChange={e => setQCarrier(e.target.value)}
          style={{ background:'transparent', color:'var(--color-fg)', border:'1px solid var(--color-border)',
            borderRadius:'var(--radius)', padding:'0.5rem', minWidth:120 }}
        />
        <input
          placeholder="Tracking"
          value={qTrack} onChange={e => setQTrack(e.target.value)}
          style={{ background:'transparent', color:'var(--color-fg)', border:'1px solid var(--color-border)',
            borderRadius:'var(--radius)', padding:'0.5rem', minWidth:120 }}
        />
        <select 
          value={status} 
          onChange={e => setStatus(e.target.value)}
          style={{ background:'transparent', color:'var(--color-fg)', border:'1px solid var(--color-border)',
            borderRadius:'var(--radius)', padding:'0.45rem 0.5rem' }}
        >
          <option value="" style={{ color:'black' }}>All statuses</option>
          {['Pending','Packed','Shipped','Delivered','Exception'].map(s=>
            <option key={s} value={s} style={{ color:'black' }}>{s}</option>
          )}
        </select>
        <button onClick={refresh} style={{
          border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
          padding:'0.5rem 0.75rem', background:'transparent', color:'var(--color-fg)', cursor:'pointer'
        }}>Refresh</button>
        <button
          onClick={() => {
            const allRows = getShipments().map(s => ({
              id: s.id, clientId: s.clientId, carrier: s.carrier,
              tracking: s.tracking ?? '', status: s.status,
              createdAt: s.createdAt, shippedAt: s.shippedAt ?? '',
              lineCount: s.lines.length
            }));
            const csv = toCSV(allRows, ['id','clientId','carrier','tracking','status','createdAt','shippedAt','lineCount']);
            downloadCSV(`shipments_${new Date().toISOString().slice(0,10)}.csv`, csv);
          }}
          style={{ border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
                   padding:'0.5rem 0.75rem', background:'transparent',
                   color:'var(--color-fg)', cursor:'pointer' }}
        >
          Export CSV
        </button>
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
                  <button onClick={() => {
                    if (!confirm('Delete this shipment?')) return;
                    // Only run async after confirm
                    removeShipment(s.id);
                    refresh();
                    push({ text: 'Shipment deleted', kind: 'success' });
                  }} style={{
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