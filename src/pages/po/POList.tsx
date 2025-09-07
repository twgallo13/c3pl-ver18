import React from 'react';
import { Link } from 'react-router-dom';
import { getPurchaseOrders, removePurchaseOrder } from '../../lib/repos/poRepo';
import { useToast } from '../../components/ui/Toast';
import { clientName, vendorName } from '../../lib/lookup';
import { toCSV, downloadCSV } from '../../lib/csv';

export default function POList() {
  const [items, setItems] = React.useState(() => getPurchaseOrders());
  const [qClient, setQClient] = React.useState<string>('');
  const [qVendor, setQVendor] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');
  const { push } = useToast();

  function refresh() { setItems(getPurchaseOrders()); }
  const ci = (s: string | undefined, q: string | undefined) => {
    const sv = (s ?? '').toString().toLowerCase();
    const qv = (q ?? '').toString().toLowerCase();
    return sv.includes(qv.trim());
  };

  const filtered = React.useMemo(() =>
    items.filter(po =>
      (qClient ? ci(po.clientId, qClient) : true) &&
      (qVendor ? ci(po.vendorId, qVendor) : true) &&
      (status ? po.status === status : true)
    ),
    [items, qClient, qVendor, status]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ marginTop: 0 }}>Purchase Orders</h1>
        <Link to="/po/new" style={{
          textDecoration: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
          padding: '0.4rem 0.6rem', color: 'var(--color-fg)'
        }}>+ New</Link>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', margin: '0.75rem 0', flexWrap: 'wrap' }}>
        <input
          placeholder="Client ID"
          value={qClient} onChange={e => setQClient(e.target.value)}
          style={{
            background: 'transparent', color: 'var(--color-fg)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)', padding: '0.5rem', minWidth: 120
          }}
        />
        <input
          placeholder="Vendor ID"
          value={qVendor} onChange={e => setQVendor(e.target.value)}
          style={{
            background: 'transparent', color: 'var(--color-fg)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)', padding: '0.5rem', minWidth: 120
          }}
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{
            background: 'transparent', color: 'var(--color-fg)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)', padding: '0.45rem 0.5rem'
          }}
        >
          <option value="" style={{ color: 'black' }}>All statuses</option>
          {['Draft', 'Submitted', 'Received', 'Closed', 'Canceled'].map(s =>
            <option key={s} value={s} style={{ color: 'black' }}>{s}</option>
          )}
        </select>
        <button onClick={refresh} style={{
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
          padding: '0.5rem 0.75rem', background: 'transparent', color: 'var(--color-fg)', cursor: 'pointer'
        }}>Refresh</button>
        <button
          onClick={() => {
            const allRows = getPurchaseOrders().map(po => ({
              id: po.id, clientId: po.clientId, vendorId: po.vendorId,
              status: po.status, createdAt: po.createdAt,
              expectedAt: po.expectedAt ?? '', lineCount: po.lines.length
            }));
            const csv = toCSV(allRows, ['id', 'clientId', 'vendorId', 'status', 'createdAt', 'expectedAt', 'lineCount']);
            downloadCSV(`purchase_orders_${new Date().toISOString().slice(0, 10)}.csv`, csv);
          }}
          style={{
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
            padding: '0.5rem 0.75rem', background: 'transparent',
            color: 'var(--color-fg)', cursor: 'pointer'
          }}
        >
          Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: 'var(--color-muted)' }}>No purchase orders.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filtered.map(po => (
            <li key={po.id} style={{
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
              padding: '0.5rem', marginBottom: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div>
                  <div>
                    <strong>PO {po.id.slice(0, 8)}</strong> — {po.status}
                  </div>
                  <div style={{ color: 'var(--color-muted)', fontSize: 12 }}>
                    Client: <Link to={`/clients/${po.clientId}`} style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>
                      {clientName(po.clientId)}
                    </Link>
                    {' · Vendor: '}{vendorName(po.vendorId)}
                    {' · Lines: '}{po.lines.length}
                    {' · Created: '}{new Date(po.createdAt).toLocaleString()}
                    {po.expectedAt ? ` · ETA: ${new Date(po.expectedAt).toLocaleDateString()}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => {
                    if (!confirm('Delete this purchase order?')) return;
                    // Only run async after confirm
                    removePurchaseOrder(po.id);
                    refresh();
                    push({ text: 'Purchase Order deleted', kind: 'success' });
                  }} style={{
                    border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
                    padding: '0.35rem 0.6rem', background: 'transparent', color: 'var(--color-fg)', cursor: 'pointer'
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