import React from 'react';
import { Link } from 'react-router-dom';
import { getInventory, removeInventoryItem } from '../../lib/repos/inventoryRepo';
import { useToast } from '../../components/ui/Toast';
import { toCSV, downloadCSV } from '../../lib/csv';
import { includes } from '../../lib/filters';

const STORAGE_KEY = 'filters.inventory';

type Filters = {
  sku: string;
  name: string;
  location: string;
};

export default function InventoryList() {
  const [items, setItems] = React.useState(() => getInventory());

  // Load persisted filters
  const loadFilters = React.useCallback((): Filters => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { sku: '', name: '', location: '' };
    } catch {
      return { sku: '', name: '', location: '' };
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

  function refresh() { setItems(getInventory()); }

  function resetFilters() {
    const emptyFilters = { sku: '', name: '', location: '' };
    setRawFilters(emptyFilters);
    setDebouncedFilters(emptyFilters);
    localStorage.removeItem(STORAGE_KEY);
  }

  const filtered = React.useMemo(() => {
    return items.filter(i =>
      includes(i.sku, debouncedFilters.sku) &&
      includes(i.name, debouncedFilters.name) &&
      includes(i.location, debouncedFilters.location)
    );
  }, [items, debouncedFilters]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ marginTop: 0 }}>Inventory</h1>
        <Link to="/inventory/new" style={{
          textDecoration: 'none',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
          padding: '0.4rem 0.6rem', color: 'var(--color-fg)'
        }}>+ New</Link>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', margin: '0.75rem 0', flexWrap: 'wrap' }}>
        <input
          placeholder="SKU"
          aria-label="Filter by SKU"
          value={rawFilters.sku}
          onChange={e => setRawFilters(prev => ({ ...prev, sku: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
          style={{
            background: 'transparent', color: 'var(--color-fg)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '0.5rem', minWidth: 120
          }}
        />
        <input
          placeholder="Name"
          aria-label="Filter by name"
          value={rawFilters.name}
          onChange={e => setRawFilters(prev => ({ ...prev, name: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
          style={{
            background: 'transparent', color: 'var(--color-fg)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '0.5rem', minWidth: 120
          }}
        />
        <input
          placeholder="Location"
          aria-label="Filter by location"
          value={rawFilters.location}
          onChange={e => setRawFilters(prev => ({ ...prev, location: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
          style={{
            background: 'transparent', color: 'var(--color-fg)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '0.5rem', minWidth: 120
          }}
        />
        <button onClick={refresh} style={{
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
          padding: '0.5rem 0.75rem', background: 'transparent', color: 'var(--color-fg)', cursor: 'pointer'
        }}>Refresh</button>
        <button
          onClick={() => {
            const allRows = getInventory().map(i => ({
              id: i.id, sku: i.sku, name: i.name,
              upc: i.upc ?? '', qtyOnHand: i.qtyOnHand,
              qtyAllocated: i.qtyAllocated, location: i.location ?? ''
            }));
            const csv = toCSV(allRows, ['id', 'sku', 'name', 'upc', 'qtyOnHand', 'qtyAllocated', 'location']);
            downloadCSV(`inventory_${new Date().toISOString().slice(0, 10)}.csv`, allRows);
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
        <p style={{ color: 'var(--color-muted)' }}>No items match.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filtered.map(i => (
            <li key={i.id} style={{
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
              padding: '0.5rem', marginBottom: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div>
                  <div><strong>{i.name}</strong> — {i.sku}{i.upc ? ` · ${i.upc}` : ''}</div>
                  <div style={{ color: 'var(--color-muted)', fontSize: 12 }}>
                    On hand: {i.qtyOnHand} · Allocated: {i.qtyAllocated} · Location: {i.location || '—'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {/* Future: edit route */}
                  <button onClick={() => {
                    if (!confirm('Delete this inventory item?')) return;
                    // Only run async after confirm
                    removeInventoryItem(i.id);
                    refresh();
                    push({ text: 'Inventory item deleted', kind: 'success' });
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