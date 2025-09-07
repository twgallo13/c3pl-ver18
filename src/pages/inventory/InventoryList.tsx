import React from 'react';
import { Link } from 'react-router-dom';
import { getInventory, removeInventoryItem } from '../../lib/repos/inventoryRepo';
import { useToast } from '../../components/ui/Toast';
import { toCSV, downloadCSV } from '../../lib/csv';

export default function InventoryList() {
  const [items, setItems] = React.useState(() => getInventory());
  const [q, setQ] = React.useState('');
  const { push } = useToast();

  function refresh() { setItems(getInventory()); }
  function matches(s: string) { return s.toLowerCase().includes(q.trim().toLowerCase()); }

  const filtered = React.useMemo(
    () => items.filter(i =>
      matches(i.sku) || matches(i.name) || matches(i.location || '') || matches(i.upc || '')
    ),
    [items, q]
  );

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
        <h1 style={{ marginTop: 0 }}>Inventory</h1>
        <Link to="/inventory/new" style={{ textDecoration:'none',
          border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
          padding:'0.4rem 0.6rem', color:'var(--color-fg)' }}>+ New</Link>
      </div>

      <div style={{ display:'flex', gap:'0.5rem', margin:'0.75rem 0' }}>
        <input
          placeholder="Search by SKU, name, UPC, location"
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{ background:'transparent', color:'var(--color-fg)',
            border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.5rem', minWidth:280 }}
        />
        <button onClick={refresh} style={{
          border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
          padding:'0.5rem 0.75rem', background:'transparent', color:'var(--color-fg)', cursor:'pointer'
        }}>Refresh</button>
        <button
          onClick={() => {
            const rows = getInventory().map(i => ({
              id: i.id, sku: i.sku, name: i.name,
              upc: i.upc ?? '', qtyOnHand: i.qtyOnHand,
              qtyAllocated: i.qtyAllocated, location: i.location ?? ''
            }));
            const csv = toCSV(rows, ['id','sku','name','upc','qtyOnHand','qtyAllocated','location']);
            downloadCSV(`inventory_${new Date().toISOString().slice(0,10)}.csv`, csv);
          }}
          style={{ border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
                   padding:'0.5rem 0.75rem', background:'transparent',
                   color:'var(--color-fg)', cursor:'pointer' }}
        >
          Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <p style={{ color:'var(--color-muted)' }}>No items match.</p>
      ) : (
        <ul style={{ listStyle:'none', padding:0 }}>
          {filtered.map(i => (
            <li key={i.id} style={{
              border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
              padding:'0.5rem', marginBottom:'0.5rem'
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', gap:'0.5rem' }}>
                <div>
                  <div><strong>{i.name}</strong> — {i.sku}{i.upc ? ` · ${i.upc}` : ''}</div>
                  <div style={{ color:'var(--color-muted)', fontSize:12 }}>
                    On hand: {i.qtyOnHand} · Allocated: {i.qtyAllocated} · Location: {i.location || '—'}
                  </div>
                </div>
                <div style={{ display:'flex', gap:'0.5rem' }}>
                  {/* Future: edit route */}
                  <button onClick={() => { removeInventoryItem(i.id); refresh(); push({ text: 'Inventory item deleted', kind: 'success' }); }} style={{
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