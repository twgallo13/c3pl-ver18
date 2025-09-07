import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { z } from 'zod';
import { getClients, upsertClient } from '../../lib/repos/clientRepo';
import { useZodForm } from '../../lib/forms/useZodForm';
import FormField from '../../components/ui/FormField';
import { useToast } from '../../components/ui/Toast';

// A minimal editable slice of the Client contract
const EditClientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
});

type Shape = z.infer<typeof EditClientSchema>;

export default function ClientEdit() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { push } = useToast();

  // Load existing client or null
  const client = React.useMemo(() => getClients().find(c => c.id === id) || null, [id]);

  const initial: Shape = React.useMemo(() => ({
    id: client?.id || (id as string),
    name: client?.name || '',
    email: client?.contacts?.[0]?.email || '',
    phone: client?.contacts?.[0]?.phone || '',
  }), [client, id]);

  const f = useZodForm(EditClientSchema, initial);

  async function save() {
    // Transform the edit shape back to the stored client format
    if (!f.validate()) return;
    const values = f.values;

    const next = {
      id: values.id,
      name: values.name,
      billingAddress: client?.billingAddress,
      shippingAddress: client?.shippingAddress,
      contacts: (values.email || values.phone)
        ? [{ name: values.name, email: values.email || undefined, phone: values.phone || undefined }]
        : [],
      status: client?.status ?? 'Active',
    };

    upsertClient(next as any);
    push({ text: 'Client updated', kind: 'success' });
    nav(`/clients/${values.id}`);
  }

  if (!client) {
    return (
      <div>
        <h1 style={{ marginTop: 0 }}>Client not found</h1>
        <p style={{ color: 'var(--color-muted)' }}>
          The requested client does not exist. <Link to="/clients" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>← Back to Clients</Link>
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
        <h1 style={{ marginTop: 0 }}>Edit Client</h1>
        <Link to={`/clients/${client.id}`} style={{ color: 'var(--color-muted)', textDecoration:'none' }}>← Cancel</Link>
      </div>

      <form onSubmit={e => { e.preventDefault(); }}>
        <FormField label="Name" error={f.errors.name}>
          <input
            value={f.values.name}
            onChange={f.onChange('name')}
            style={{
              background: 'transparent', color: 'var(--color-fg)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '0.5rem'
            }}
          />
        </FormField>

        <FormField label="Email" error={f.errors.email as string | undefined}>
          <input
            value={f.values.email ?? ''}
            onChange={f.onChange('email')}
            placeholder="name@example.com"
            style={{
              background: 'transparent', color: 'var(--color-fg)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '0.5rem'
            }}
          />
        </FormField>

        <FormField label="Phone">
          <input
            value={f.values.phone ?? ''}
            onChange={f.onChange('phone')}
            placeholder="+1 555-123-4567"
            style={{
              background: 'transparent', color: 'var(--color-fg)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '0.5rem'
            }}
          />
        </FormField>

        <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.75rem' }}>
          <button
            type="button"
            onClick={save}
            disabled={!z.object(EditClientSchema.shape).safeParse(f.values).success}
            style={{
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
              padding: '0.5rem 0.75rem', background: 'var(--color-accent)', color: 'white', cursor: 'pointer'
            }}
          >
            Save
          </button>
          <Link
            to={`/clients/${client.id}`}
            style={{
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
              padding: '0.5rem 0.75rem', background: 'transparent', color: 'var(--color-fg)', textDecoration:'none'
            }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}