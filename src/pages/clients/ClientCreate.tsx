import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { useZodForm } from '../../lib/forms/useZodForm';
import FormField from '../../components/ui/FormField';
import { Button } from '../../components/ui/button';
import { upsertClient } from '../../lib/repos/clientRepo';
import { useToast } from '../../components/ui/Toast';

// A minimal client creation schema
const CreateClientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
});

type Shape = z.infer<typeof CreateClientSchema>;

function initial(): Shape {
  return {
    id: crypto.randomUUID(),
    name: '',
    email: '',
    phone: '',
  };
}

export default function ClientCreate() {
  const nav = useNavigate();
  const { push } = useToast();
  const f = useZodForm(CreateClientSchema, initial());

  async function save() {
    if (!f.validate()) return;
    const values = f.values;

    const client = {
      id: values.id,
      name: values.name,
      billingAddress: undefined,
      shippingAddress: undefined,
      contacts: (values.email || values.phone)
        ? [{ name: values.name, email: values.email || undefined, phone: values.phone || undefined }]
        : [],
      status: 'Active' as const,
    };

    upsertClient(client as any);
    push({ text: 'Client created successfully', kind: 'success' });
    nav('/clients');
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: '1rem' }}>
        <h1 style={{ marginTop: 0 }}>Create New Client</h1>
        <Link to="/clients" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>← Back to Clients</Link>
      </div>

      <form onSubmit={e => { e.preventDefault(); }}>
        <FormField label="Name" error={f.errors.name}>
          <input
            value={f.values.name}
            onChange={f.onChange('name')}
            style={{
              background: 'transparent', color: 'var(--color-fg)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '0.5rem',
              width: '100%'
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
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '0.5rem',
              width: '100%'
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
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '0.5rem',
              width: '100%'
            }}
          />
        </FormField>

        <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.75rem' }}>
          <Button
            type="button"
            onClick={save}
            disabled={!z.object(CreateClientSchema.shape).safeParse(f.values).success}
          >
            Create Client
          </Button>
          <Button 
            type="button"
            variant="ghost" 
            onClick={() => nav('/clients')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}