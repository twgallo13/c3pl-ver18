import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import EmptyState from '../clients/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { getInventory, upsertInventoryItem } from '../../lib/repos/inventoryRepo';

export default function InventoryEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { push } = useToast();
  const [item, setItem] = React.useState<ReturnType<typeof getInventory>[number] | null>(null);
  const [name, setName] = React.useState('');
  const [sku, setSku] = React.useState('');
  const [upc, setUpc] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [qtyOnHand, setQtyOnHand] = React.useState(0);
  const [qtyAllocated, setQtyAllocated] = React.useState(0);

  React.useEffect(() => {
    const all = getInventory();
    const i = all.find(x => x.id === id);
    if (i) {
      setItem(i);
      setName(i.name);
      setSku(i.sku);
      setUpc(i.upc || '');
      setLocation(i.location || '');
      setQtyOnHand(i.qtyOnHand);
      setQtyAllocated(i.qtyAllocated);
    }
  }, [id]);

  if (!item) {
    return (
      <EmptyState
        title="Item not found"
        subtitle="It may have been deleted or the link is incorrect."
      />
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      push({ text: 'Name is required', kind: 'error' });
      return;
    }
    if (!sku.trim()) {
      push({ text: 'SKU is required', kind: 'error' });
      return;
    }

    try {
      upsertInventoryItem({
        ...item,
        name: name.trim(),
        sku: sku.trim(),
        upc: upc.trim() || undefined,
        location: location.trim() || undefined,
        qtyOnHand,
        qtyAllocated
      });
      push({ text: 'Item updated', kind: 'success' });
      navigate(`/inventory/${id}`);
    } catch (e) {
      push({ text: 'Failed to update item', kind: 'error' });
    }
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ marginTop: 0 }}>Edit Item</h1>
      </div>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <label style={{ fontWeight: 600 }}>Name*</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              background: 'transparent',
              color: 'var(--color-fg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '0.5rem'
            }}
            required
          />
        </div>

        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <label style={{ fontWeight: 600 }}>SKU*</label>
          <input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            style={{
              background: 'transparent',
              color: 'var(--color-fg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '0.5rem'
            }}
            required
          />
        </div>

        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <label style={{ fontWeight: 600 }}>UPC</label>
          <input
            value={upc}
            onChange={(e) => setUpc(e.target.value)}
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
          <label style={{ fontWeight: 600 }}>Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{
              background: 'transparent',
              color: 'var(--color-fg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '0.5rem'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <label style={{ fontWeight: 600 }}>Qty On Hand</label>
            <input
              type="number"
              value={qtyOnHand}
              onChange={(e) => setQtyOnHand(Number(e.target.value) || 0)}
              min="0"
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
            <label style={{ fontWeight: 600 }}>Qty Allocated</label>
            <input
              type="number"
              value={qtyAllocated}
              onChange={(e) => setQtyAllocated(Number(e.target.value) || 0)}
              min="0"
              style={{
                background: 'transparent',
                color: 'var(--color-fg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                padding: '0.5rem'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <Button variant="primary" type="submit" aria-label="Save Changes">Save Changes</Button>
          <Button variant="ghost" type="button" onClick={() => navigate(`/inventory/${id}`)} aria-label="Cancel">Cancel</Button>
        </div>
      </form>
    </div>
  );
}