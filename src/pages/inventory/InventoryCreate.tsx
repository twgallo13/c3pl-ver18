import React from 'react';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useZodForm } from '../../lib/forms/useZodForm';
import FormField from '../../components/ui/FormField';
import { InventoryItem } from '../../lib/contracts';
import { upsertInventoryItem } from '../../lib/repos/inventoryRepo';
import { useToast } from '../../components/ui/Toast';

const CreateSchema = InventoryItem.pick({
  sku: true, name: true, upc: true, location: true
}).extend({
  id: z.string().uuid(),
  qtyOnHand: z.number().int().nonnegative(),
  qtyAllocated: z.number().int().nonnegative(),
});

type Shape = z.infer<typeof CreateSchema>;

function initial(): Shape {
  return {
    id: crypto.randomUUID(),
    sku: '',
    name: '',
    upc: '',
    location: '',
    qtyOnHand: 0,
    qtyAllocated: 0,
  };
}

export default function InventoryCreate() {
  const nav = useNavigate();
  const f = useZodForm(CreateSchema, initial());
  const { push } = useToast();

  function save() {
    if (!f.validate()) return;
    upsertInventoryItem(f.values as any);
    push({ text: 'Inventory item saved', kind: 'success' });
    nav('/inventory');
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
        <h1 style={{ marginTop: 0 }}>New Inventory Item</h1>
        <Link to="/inventory" style={{ color:'var(--color-muted)', textDecoration:'none' }}>← Cancel</Link>
      </div>

      <form onSubmit={e => { e.preventDefault(); }}>
        <FormField label="SKU" error={f.errors.sku}>
          <input value={f.values.sku} onChange={f.onChange('sku')}
            style={{ background:'transparent', color:'var(--color-fg)',
              border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.5rem' }}/>
        </FormField>

        <FormField label="Name" error={f.errors.name}>
          <input value={f.values.name} onChange={f.onChange('name')}
            style={{ background:'transparent', color:'var(--color-fg)',
              border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.5rem' }}/>
        </FormField>

        <FormField label="UPC">
          <input value={f.values.upc ?? ''} onChange={f.onChange('upc')}
            style={{ background:'transparent', color:'var(--color-fg)',
              border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.5rem' }}/>
        </FormField>

        <FormField label="Location">
          <input value={f.values.location ?? ''} onChange={f.onChange('location')}
            style={{ background:'transparent', color:'var(--color-fg)',
              border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.5rem' }}/>
        </FormField>

        <FormField label="Qty On Hand" error={f.errors.qtyOnHand}>
          <input type="number" value={f.values.qtyOnHand}
            onChange={e => f.set('qtyOnHand', Number(e.target.value) || 0)}
            style={{ background:'transparent', color:'var(--color-fg)',
              border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.5rem' }}/>
        </FormField>

        <FormField label="Qty Allocated" error={f.errors.qtyAllocated}>
          <input type="number" value={f.values.qtyAllocated}
            onChange={e => f.set('qtyAllocated', Number(e.target.value) || 0)}
            style={{ background:'transparent', color:'var(--color-fg)',
              border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.5rem' }}/>
        </FormField>

        <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.75rem' }}>
          <button type="button" onClick={save}
            style={{ border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
              padding:'0.5rem 0.75rem', background:'var(--color-accent)', color:'white', cursor:'pointer' }}>
            Save
          </button>
          <Link to="/inventory" style={{ textDecoration:'none',
            border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
            padding:'0.5rem 0.75rem', color:'var(--color-fg)' }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}