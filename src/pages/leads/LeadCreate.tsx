import React from 'react';
import { z } from 'zod';
import { useZodForm } from '../../lib/forms/useZodForm';
import FormField from '../../components/ui/FormField';
import { validate, UUID, ISODate, Email, Phone, NonEmptyString } from '../../lib/contracts';
import { getLeads, upsertLead } from '../../lib/repos/leadRepo';

const LeadSchema = z.object({
  id: UUID,
  name: NonEmptyString,
  email: Email.optional(),
  phone: Phone.optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
  createdAt: ISODate,
});

type LeadShape = z.infer<typeof LeadSchema>;

function newLead(): LeadShape {
  return {
    id: crypto.randomUUID(),
    name: '',
    email: undefined,
    phone: undefined,
    company: '',
    notes: '',
    createdAt: new Date().toISOString(),
  };
}

export default function LeadCreate() {
  const f = useZodForm(LeadSchema, newLead());
  const [promotedMessage, setPromotedMessage] = React.useState<string | null>(null);
  const [leads, setLeads] = React.useState(() => getLeads());

  const isValid = React.useMemo(
    () => LeadSchema.safeParse(f.values).success,
    [f.values]
  );

  async function saveLead() {
    const parsed = validate(LeadSchema, f.values);
    if (!parsed.success) return;
    upsertLead(parsed.data);
    setLeads(getLeads());
    alert(`Lead saved:\n${JSON.stringify(parsed.data, null, 2)}`);
  }

  async function promoteToClient() {
    const parsed = validate(LeadSchema, f.values);
    if (!parsed.success) return;
    upsertLead(parsed.data);
    setLeads(getLeads());
    setPromotedMessage(`Promoted (stub): ${parsed.data.name} → Client (id matches Lead)`);
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ marginTop: 0 }}>Leads — Create & Promote (Stub)</h1>
      <p style={{ color: 'var(--color-muted)' }}>
        This page demonstrates the Lead ➝ Client workflow with validation.
        Storage and real conversion will arrive in later prompts.
      </p>

      <form onSubmit={e => { e.preventDefault(); }}>

        <FormField label="Name" error={f.errors.name}>
          <input
            value={f.values.name}
            onChange={f.onChange('name')}
            style={{
              background: 'transparent',
              color: 'var(--color-fg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '0.5rem'
            }}
          />
        </FormField>

        <FormField label="Email" error={f.errors.email}>
          <input
            value={f.values.email ?? ''}
            onChange={f.onChange('email')}
            placeholder="name@example.com"
            style={{
              background: 'transparent',
              color: 'var(--color-fg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '0.5rem'
            }}
          />
        </FormField>

        <FormField label="Phone" error={f.errors.phone}>
          <input
            value={f.values.phone ?? ''}
            onChange={f.onChange('phone')}
            placeholder="+1 555-123-4567"
            style={{
              background: 'transparent',
              color: 'var(--color-fg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '0.5rem'
            }}
          />
        </FormField>

        <FormField label="Company">
          <input
            value={f.values.company ?? ''}
            onChange={f.onChange('company')}
            style={{
              background: 'transparent',
              color: 'var(--color-fg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '0.5rem'
            }}
          />
        </FormField>

        <FormField label="Notes">
          <textarea
            value={f.values.notes ?? ''}
            onChange={f.onChange('notes')}
            rows={4}
            style={{
              background: 'transparent',
              color: 'var(--color-fg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '0.5rem'
            }}
          />
        </FormField>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <button
            type="button"
            onClick={saveLead}
            disabled={!isValid}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '0.5rem 0.75rem',
              background: 'var(--color-accent)',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Save Lead (stub)
          </button>

          <button
            type="button"
            onClick={promoteToClient}
            disabled={!isValid}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '0.5rem 0.75rem',
              background: 'transparent',
              color: 'var(--color-fg)',
              cursor: 'pointer'
            }}
          >
            Promote to Client (stub)
          </button>
        </div>

        {promotedMessage && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            background: 'rgba(255,255,255,0.03)'
          }}>
            {promotedMessage}
          </div>
        )}
      </form>

      <div style={{ marginTop: '1rem' }}>
        <h2 style={{ margin: 0 }}>Saved Leads</h2>
        {leads.length === 0 ? (
          <p style={{ color: 'var(--color-muted)' }}>No leads yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0' }}>
            {leads.map(l => (
              <li key={l.id} style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                padding: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <div><strong>{l.name}</strong>{l.company ? ` — ${l.company}` : ''}</div>
                <div style={{ color: 'var(--color-muted)', fontSize: 12 }}>
                  {l.email || 'no email'} · {l.phone || 'no phone'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}