import React from 'react';
import { Link } from 'react-router-dom';
import { getPurchaseOrders, removePurchaseOrder } from '../../lib/repos/poRepo';
import { useToast } from '../../components/ui/Toast';
import { clientName, vendorName } from '../../lib/lookup';
import { toCSV, downloadCSV } from '../../lib/csv';
import { includes } from '../../lib/filters';

const STORAGE_KEY = 'filters.pos';

type Filters = {
  client: string;
  vendor: string;
  status: string;
};

export default function POList() {
  const [items, setItems] = React.useState(() => getPurchaseOrders());
  
  // Load persisted filters
  const loadFilters = React.useCallback((): Filters => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { client: '', vendor: '', status: '' };
    } catch {
      return { client: '', vendor: '', status: '' };
    }
  }, []);

  // Raw filter inputs (responsive to typing)
  const [rawFilters, setRawFilters] = React.useState<Filters>(loadFilters);
  
  // Debounced filters (used for actual filtering)
  const [debouncedFilters, setDebouncedFilters] = React.useState<Filters>(rawFilters);
  
  const { push } = useToast();

  // Debounce filter changes (200ms)
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFilters(rawFilters);
      // Persist to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rawFilters));
    }, 200);

    return () => clearTimeout(timeout);
  }, [rawFilters]);

  function refresh() { setItems(getPurchaseOrders()); }

  function resetFilters() {
    const emptyFilters = { client: '', vendor: '', status: '' };
    setRawFilters(emptyFilters);
    setDebouncedFilters(emptyFilters);
    localStorage.removeItem(STORAGE_KEY);
  }

  const filtered = React.useMemo(() =>
    items.filter(po =>
      includes(po.clientId, debouncedFilters.client) &&
      includes(po.vendorId, debouncedFilters.vendor) &&
      (!debouncedFilters.status || po.status === debouncedFilters.status)
    ),
    [items, debouncedFilters]);

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
          aria-label="Filter by client ID"
          value={rawFilters.client}
          onChange={e => setRawFilters(prev => ({ ...prev, client: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
          style={{
            background: 'transparent', color: 'var(--color-fg)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)', padding: '0.5rem', minWidth: 120
          }}
        />
        <input
          placeholder="Vendor ID"
          aria-label="Filter by vendor ID"
          value={rawFilters.vendor}
          onChange={e => setRawFilters(prev => ({ ...prev, vendor: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
          style={{
            background: 'transparent', color: 'var(--color-fg)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)', padding: '0.5rem', minWidth: 120
          }}
        />
        <select
          value={rawFilters.status}
          onChange={e => setRawFilters(prev => ({ ...prev, status: e.target.value }))}
          aria-label="Filter by status"
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
        <button
          onClick={resetFilters}
          aria-label="Reset all filters"
          style={{
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
            padding: '0.5rem 0.75rem', background: 'transparent',
            color: 'var(--color-fg)', cursor: 'pointer'
          }}
        >
          Reset Filters
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