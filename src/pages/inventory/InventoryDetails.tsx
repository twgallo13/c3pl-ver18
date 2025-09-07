import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../clients/EmptyState';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/Toast';
import { getInventory, removeInventoryItem } from '../../lib/repos/inventoryRepo';

export default function InventoryDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { push } = useToast();
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'empty' | 'error'>('loading');
  const [error, setError] = React.useState<string | undefined>();
  const [item, setItem] = React.useState<ReturnType<typeof getInventory>[number] | null>(null);

  React.useEffect(() => {
    try {
      const all = getInventory();
      const i = all.find(x => x.id === id);
      if (!i) {
        setStatus('empty');
      } else {
        setItem(i);
        setStatus('ready');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setStatus('error');
    }
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this inventory item?')) return;
    if (!id) return;
    try {
      removeInventoryItem(id);
      push({ text: 'Inventory item deleted', kind: 'success' });
      navigate('/inventory');
    } catch (e) {
      push({ text: 'Failed to delete inventory item', kind: 'error' });
    }
  };

  if (status === 'loading') return <Loading label="Loading inventory item…" />;
  if (status === 'error') return <ErrorState title="Failed to load" detail={error} />;
  if (status === 'empty') return (
    <EmptyState
      title="Item not found"
      subtitle="It may have been deleted or the link is incorrect."
    />
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ marginTop: 0 }}>{item!.name}</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Button
            variant="muted"
            onClick={() => navigate(`/inventory/${item!.id}/edit`)}
            aria-label="Edit Item"
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            aria-label="Delete Item"
          >
            Delete
          </Button>
          <Link to="/inventory" style={{ color: 'var(--color-muted)', textDecoration: 'none', marginLeft: '0.5rem' }}>← Back to Inventory</Link>
        </div>
      </div>

      <div style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        padding: '0.75rem',
        background: 'rgba(255,255,255,0.03)'
      }}>
        <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <strong>SKU:</strong> {item!.sku}
          </div>
          <div>
            <strong>UPC:</strong> {item!.upc || '-'}
          </div>
          <div>
            <strong>Location:</strong> {item!.location || '-'}
          </div>
          <div>
            <strong>Qty On Hand:</strong> {item!.qtyOnHand}
          </div>
          <div>
            <strong>Qty Allocated:</strong> {item!.qtyAllocated}
          </div>
          <div>
            <strong>Available:</strong> {Math.max(0, item!.qtyOnHand - item!.qtyAllocated)}
          </div>
        </div>
      </div>
    </div>
  );
}