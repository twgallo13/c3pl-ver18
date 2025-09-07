import React from 'react';
import { Link } from 'react-router-dom';
import { getPurchaseOrders, removePurchaseOrder } from '../../lib/repos/poRepo';
import { useToast } from '../../components/ui/Toast';

export default function POList() {
  const [items, setItems] = React.useState(() => getPurchaseOrders());
  const [q, setQ] = React.useState('');
  const { push } = useToast();

  function refresh() { setItems(getPurchaseOrders()); }
  const matches = (s: string) => s.toLowerCase().includes(q.trim().toLowerCase());

  const filtered = React.useMemo(
    () => items.filter(po =>
      matches(po.id) ||
      matches(po.clientId) ||
      matches(po.vendorId) ||
      matches(po.status)
    ),
    [items, q]
  );

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
        <h1 style={{ marginTop: 0 }}>Purchase Orders</h1>
        <Link to="/po/new" style={{
          textDecoration:'none', border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
          padding:'0.4rem 0.6rem', color:'var(--color-fg)'
        }}>+ New</Link>
      </div>

      <div style={{ display:'flex', gap:'0.5rem', margin:'0.75rem 0' }}>
        <input
          placeholder="Search by PO id, client id, vendor id, status"
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
        <p style={{ color:'var(--color-muted)' }}>No purchase orders.</p>
      ) : (
        <ul style={{ listStyle:'none', padding:0 }}>
          {filtered.map(po => (
            <li key={po.id} style={{
              border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
              padding:'0.5rem', marginBottom:'0.5rem'
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', gap:'0.5rem' }}>
                <div>
                  <div><strong>PO {po.id.slice(0,8)}</strong> — {po.status}</div>
                  <div style={{ color:'var(--color-muted)', fontSize:12 }}>
                    Client: {po.clientId} · Vendor: {po.vendorId} · Lines: {po.lines.length} ·
                    Created: {new Date(po.createdAt).toLocaleString()}
                    {po.expectedAt ? ` · ETA: ${new Date(po.expectedAt).toLocaleDateString()}` : ''}
                  </div>
                </div>
                <div style={{ display:'flex', gap:'0.5rem' }}>
                  <button onClick={() => { removePurchaseOrder(po.id); refresh(); push({ text: 'Purchase Order deleted', kind: 'success' }); }} style={{
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