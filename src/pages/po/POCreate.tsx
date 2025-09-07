import React from 'react';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useZodForm } from '../../lib/forms/useZodForm';
import FormField from '../../components/ui/FormField';
import { PurchaseOrder, PurchaseOrderLine, UUID, ISODate, PositiveInt } from '../../lib/contracts';
import { upsertPurchaseOrder } from '../../lib/repos/poRepo';

const LineEdit = z.object({
  id: UUID,
  itemId: UUID,
  qtyOrdered: PositiveInt,
  unitCostAmount: z.number().nonnegative(),
  currency: z.string().length(3).toUpperCase().default('USD'),
});

const CreatePOSchema = z.object({
  id: UUID,
  clientId: UUID,
  vendorId: UUID,
  createdAt: ISODate,
  expectedAt: ISODate.optional(),
  status: z.enum(["Draft", "Submitted", "Received", "Closed", "Canceled"]).default("Draft"),
  lines: z.array(LineEdit).min(1),
});

type Shape = z.infer<typeof CreatePOSchema>;

function initial(): Shape {
  return {
    id: crypto.randomUUID(),
    clientId: crypto.randomUUID(),
    vendorId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    expectedAt: undefined,
    status: "Draft",
    lines: [{
      id: crypto.randomUUID(),
      itemId: crypto.randomUUID(),
      qtyOrdered: 1,
      unitCostAmount: 0,
      currency: 'USD'
    }]
  };
}

export default function POCreate() {
  const nav = useNavigate();
  const f = useZodForm(CreatePOSchema, initial());

  function addLine() {
    f.set('lines', [...f.values.lines, {
      id: crypto.randomUUID(),
      itemId: crypto.randomUUID(),
      qtyOrdered: 1,
      unitCostAmount: 0,
      currency: 'USD'
    }]);
  }

  function removeLine(idx: number) {
    const copy = f.values.lines.slice();
    copy.splice(idx, 1);
    f.set('lines', copy);
  }

  function toContract(shape: Shape): z.infer<typeof PurchaseOrder> {
    // Convert our edit shape into the contract's Money {currency, amount}
    const lines = shape.lines.map((ln: any): z.infer<typeof PurchaseOrderLine> => ({
      id: ln.id,
      itemId: ln.itemId,
      qtyOrdered: ln.qtyOrdered,
      unitCost: { currency: ln.currency, amount: ln.unitCostAmount },
    }));
    return {
      id: shape.id,
      clientId: shape.clientId,
      vendorId: shape.vendorId,
      createdAt: shape.createdAt,
      expectedAt: shape.expectedAt,
      lines,
      status: shape.status,
    };
  }

  function save() {
    if (!f.validate()) return;
    const po = toContract(f.values);
    const parsed = PurchaseOrder.safeParse(po);
    if (!parsed.success) return;
    upsertPurchaseOrder(parsed.data);
    nav('/po');
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
        <h1 style={{ marginTop: 0 }}>New Purchase Order</h1>
        <Link to="/po" style={{ color:'var(--color-muted)', textDecoration:'none' }}>← Cancel</Link>
      </div>

      <form onSubmit={e => { e.preventDefault(); }}>
        <div style={{
          border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
          padding:'0.75rem', marginBottom:'0.75rem', background:'rgba(255,255,255,0.03)'
        }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
            <FormField label="Client ID">
              <input value={f.values.clientId} onChange={f.onChange('clientId')}
                style={{ background:'transparent', color:'var(--color-fg)', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.5rem' }}/>
            </FormField>
            <FormField label="Vendor ID">
              <input value={f.values.vendorId} onChange={f.onChange('vendorId')}
                style={{ background:'transparent', color:'var(--color-fg)', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.5rem' }}/>
            </FormField>
            <FormField label="Expected At (ISO 8601)">
              <input value={f.values.expectedAt ?? ''} onChange={f.onChange('expectedAt')}
                placeholder="2025-12-31T00:00:00Z"
                style={{ background:'transparent', color:'var(--color-fg)', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.5rem' }}/>
            </FormField>
            <FormField label="Status">
              <select
                value={f.values.status}
                onChange={f.onChange('status') as any}
                style={{ background:'transparent', color:'var(--color-fg)', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.45rem 0.5rem' }}
              >
                {["Draft","Submitted","Received","Closed","Canceled"].map(s =>
                  <option key={s} value={s} style={{ color:'black' }}>{s}</option>
                )}
              </select>
            </FormField>
          </div>
        </div>

        <h2 style={{ marginTop: 0 }}>Lines</h2>
        {f.values.lines.map((ln, idx) => (
          <div key={ln.id} style={{
            border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
            padding:'0.5rem', marginBottom:'0.5rem'
          }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr auto', gap:'0.5rem' }}>
              <FormField label="Item ID">
                <input value={ln.itemId} onChange={e => {
                  const copy = [...f.values.lines]; copy[idx] = { ...ln, itemId: e.target.value }; f.set('lines', copy);
                }} style={{ background:'transparent', color:'var(--color-fg)', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.5rem' }}/>
              </FormField>
              <FormField label="Qty Ordered">
                <input type="number" value={ln.qtyOrdered} onChange={e => {
                  const copy = [...f.values.lines]; copy[idx] = { ...ln, qtyOrdered: Math.max(0, Number(e.target.value)||0) }; f.set('lines', copy);
                }} style={{ background:'transparent', color:'var(--color-fg)', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.5rem' }}/>
              </FormField>
              <FormField label="Currency">
                <input value={ln.currency} onChange={e => {
                  const copy = [...f.values.lines]; copy[idx] = { ...ln, currency: e.target.value.toUpperCase().slice(0,3) }; f.set('lines', copy);
                }} style={{ background:'transparent', color:'var(--color-fg)', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.5rem' }}/>
              </FormField>
              <FormField label="Unit Cost (amount)">
                <input type="number" value={ln.unitCostAmount} step="0.01" onChange={e => {
                  const copy = [...f.values.lines]; copy[idx] = { ...ln, unitCostAmount: Number(e.target.value)||0 }; f.set('lines', copy);
                }} style={{ background:'transparent', color:'var(--color-fg)', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.5rem' }}/>
              </FormField>
              <div style={{ display:'flex', alignItems:'end' }}>
                <button type="button" onClick={() => removeLine(idx)} style={{
                  border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
                  padding:'0.35rem 0.6rem', background:'transparent', color:'var(--color-fg)', cursor:'pointer'
                }}>Remove</button>
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={addLine} style={{
          border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
          padding:'0.5rem 0.75rem', background:'transparent', color:'var(--color-fg)', cursor:'pointer'
        }}>+ Add Line</button>

        <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.75rem' }}>
          <button type="button" onClick={save} style={{
            border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
            padding:'0.5rem 0.75rem', background:'var(--color-accent)', color:'white', cursor:'pointer'
          }}>Save PO</button>
          <Link to="/po" style={{
            textDecoration:'none', border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
            padding:'0.5rem 0.75rem', color:'var(--color-fg)'
          }}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}