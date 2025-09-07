import React from 'react';
import { Link } from 'react-router-dom';
import { getShipments, removeShipment } from '../../lib/repos/shipmentRepo';
import { useToast } from '../../components/ui/Toast';
import { clientName } from '../../lib/lookup';
import { toCSV, downloadCSV } from '../../lib/csv';
import { includes } from '../../lib/filters';

const STORAGE_KEY = 'filters.shipments';

type Filters = {
  carrier: string;
  tracking: string;
  status: string;
};

export default function ShipmentList() {
  const [items, setItems] = React.useState(() => getShipments());
  
  // Load persisted filters
  const loadFilters = React.useCallback((): Filters => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { carrier: '', tracking: '', status: '' };
    } catch {
      return { carrier: '', tracking: '', status: '' };
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

  function refresh() { setItems(getShipments()); }

  function resetFilters() {
    const emptyFilters = { carrier: '', tracking: '', status: '' };
    setRawFilters(emptyFilters);
    setDebouncedFilters(emptyFilters);
    localStorage.removeItem(STORAGE_KEY);
  }

  const filtered = React.useMemo(() =>
    items.filter(s =>
      includes(s.carrier, debouncedFilters.carrier) &&
      includes(s.tracking, debouncedFilters.tracking) &&
      (!debouncedFilters.status || s.status === debouncedFilters.status)
    ),
    [items, debouncedFilters]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ marginTop: 0 }}>Shipments</h1>
        <Link to="/shipments/new" style={{
          textDecoration: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
          padding: '0.4rem 0.6rem', color: 'var(--color-fg)'
        }}>+ New</Link>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', margin: '0.75rem 0', flexWrap: 'wrap' }}>
        <input
          placeholder="Carrier"
          aria-label="Filter by carrier"
          value={rawFilters.carrier}
          onChange={e => setRawFilters(prev => ({ ...prev, carrier: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
          style={{
            background: 'transparent', color: 'var(--color-fg)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)', padding: '0.5rem', minWidth: 120
          }}
        />
        <input
          placeholder="Tracking"
          aria-label="Filter by tracking"
          value={rawFilters.tracking}
          onChange={e => setRawFilters(prev => ({ ...prev, tracking: e.target.value }))}
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
          {['Pending', 'Packed', 'Shipped', 'Delivered', 'Exception'].map(s =>
            <option key={s} value={s} style={{ color: 'black' }}>{s}</option>
          )}
        </select>
        <button onClick={refresh} style={{
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
          padding: '0.5rem 0.75rem', background: 'transparent', color: 'var(--color-fg)', cursor: 'pointer'
        }}>Refresh</button>
        <button
          onClick={() => {
            const allRows = getShipments().map(s => ({
              id: s.id, clientId: s.clientId, carrier: s.carrier,
              tracking: s.tracking ?? '', status: s.status,
              createdAt: s.createdAt, shippedAt: s.shippedAt ?? '',
              lineCount: s.lines.length
            }));
            const csv = toCSV(allRows, ['id', 'clientId', 'carrier', 'tracking', 'status', 'createdAt', 'shippedAt', 'lineCount']);
            downloadCSV(`shipments_${new Date().toISOString().slice(0, 10)}.csv`, csv);
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
        <p style={{ color: 'var(--color-muted)' }}>No shipments.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filtered.map(s => (
            <li key={s.id} style={{
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
              padding: '0.5rem', marginBottom: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div>
                  <div><strong>Shipment {s.id.slice(0, 8)}</strong> — {s.status}</div>
                  <div style={{ color: 'var(--color-muted)', fontSize: 12 }}>
                    Client: <Link to={`/clients/${s.clientId}`} style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>
                      {clientName(s.clientId)}
                    </Link>
                    {` · Carrier: ${s.carrier}`}
                    {s.tracking ? ` · Tracking: ${s.tracking}` : ''}
                    {' · Created: '}{new Date(s.createdAt).toLocaleString()}
                    {s.shippedAt ? ` · Shipped: ${new Date(s.shippedAt).toLocaleString()}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => {
                    if (!confirm('Delete this shipment?')) return;
                    // Only run async after confirm
                    removeShipment(s.id);
                    refresh();
                    push({ text: 'Shipment deleted', kind: 'success' });
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