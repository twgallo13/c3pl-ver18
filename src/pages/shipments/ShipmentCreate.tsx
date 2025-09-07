import React from 'react';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useZodForm } from '../../lib/forms/useZodForm';
import FormField from '../../components/ui/FormField';
import { Shipment, PositiveInt } from '../../lib/contracts';
import { upsertShipment } from '../../lib/repos/shipmentRepo';
import { useToast } from '../../components/ui/Toast';

const LineEdit = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
  qty: PositiveInt,
});

const CreateSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  createdAt: z.string(),              // ISODate per contract; we'll rely on form to input correctly
  shippedAt: z.string().optional(),
  carrier: z.enum(["UPS","FedEx","USPS","DHL","Other"]).default("Other"),
  tracking: z.string().optional(),
  lines: z.array(LineEdit).min(1),
  status: z.enum(["Pending","Packed","Shipped","Delivered","Exception"]).default("Pending"),
});

type Shape = z.infer<typeof CreateSchema>;

function initial(): Shape {
  return {
    id: crypto.randomUUID(),
    clientId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    shippedAt: undefined,
    carrier: "Other",
    tracking: "",
    status: "Pending",
    lines: [{
      id: crypto.randomUUID(),
      itemId: crypto.randomUUID(),
      qty: 1,
    }]
  };
}

export default function ShipmentCreate() {
  const nav = useNavigate();
  const f = useZodForm(CreateSchema, initial());
  const { push } = useToast();

  function addLine() {
    f.set('lines', [...f.values.lines, { id: crypto.randomUUID(), itemId: crypto.randomUUID(), qty: 1 }]);
  }

  function removeLine(idx: number) {
    const copy = f.values.lines.slice();
    copy.splice(idx, 1);
    f.set('lines', copy);
  }

  function toContract(shape: Shape): z.infer<typeof Shipment> {
    return {
      id: shape.id,
      clientId: shape.clientId,
      createdAt: shape.createdAt,
      shippedAt: shape.shippedAt || undefined,
      carrier: shape.carrier,
      tracking: shape.tracking || undefined,
      lines: shape.lines.map(ln => ({ id: ln.id, itemId: ln.itemId, qty: ln.qty })),
      status: shape.status,
    };
  }

  function save() {
    if (!f.validate()) return;
    const s = toContract(f.values);
    const parsed = Shipment.safeParse(s);
    if (!parsed.success) return;
    upsertShipment(parsed.data);
    push({ text: 'Shipment saved', kind: 'success' });
    nav('/shipments');
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
        <h1 style={{ marginTop: 0 }}>New Shipment</h1>
        <Link to="/shipments" style={{ color:'var(--color-muted)', textDecoration:'none' }}>← Cancel</Link>
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
            <FormField label="Created At (ISO)">
              <input value={f.values.createdAt} onChange={f.onChange('createdAt')}
                style={{ background:'transparent', color:'var(--color-fg)', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.5rem' }}/>
            </FormField>
            <FormField label="Shipped At (ISO)">
              <input value={f.values.shippedAt ?? ''} onChange={f.onChange('shippedAt')}
                style={{ background:'transparent', color:'var(--color-fg)', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.5rem' }}/>
            </FormField>
            <FormField label="Carrier">
              <select
                value={f.values.carrier}
                onChange={f.onChange('carrier') as any}
                style={{ background:'transparent', color:'var(--color-fg)', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.45rem 0.5rem' }}
              >
                {["UPS","FedEx","USPS","DHL","Other"].map(s =>
                  <option key={s} value={s} style={{ color:'black' }}>{s}</option>
                )}
              </select>
            </FormField>
            <FormField label="Tracking">
              <input value={f.values.tracking ?? ''} onChange={f.onChange('tracking')}
                style={{ background:'transparent', color:'var(--color-fg)', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.5rem' }}/>
            </FormField>
            <FormField label="Status">
              <select
                value={f.values.status}
                onChange={f.onChange('status') as any}
                style={{ background:'transparent', color:'var(--color-fg)', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.45rem 0.5rem' }}
              >
                {["Pending","Packed","Shipped","Delivered","Exception"].map(s =>
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
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:'0.5rem' }}>
              <FormField label="Item ID">
                <input value={ln.itemId} onChange={e => {
                  const copy = [...f.values.lines]; copy[idx] = { ...ln, itemId: e.target.value }; f.set('lines', copy);
                }} style={{ background:'transparent', color:'var(--color-fg)', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.5rem' }}/>
              </FormField>
              <FormField label="Quantity">
                <input type="number" value={ln.qty} onChange={e => {
                  const copy = [...f.values.lines]; copy[idx] = { ...ln, qty: Math.max(1, Number(e.target.value)||1) }; f.set('lines', copy);
                }} style={{ background:'transparent', color:'var(--color-fg)', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.5rem' }}/>
              </FormField>
              <div />
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
          }}>Save Shipment</button>
          <Link to="/shipments" style={{
            textDecoration:'none', border:'1px solid var(--color-border)', borderRadius:'var(--radius)',
            padding:'0.5rem 0.75rem', color:'var(--color-fg)'
          }}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}