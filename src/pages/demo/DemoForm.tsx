import React from 'react';
import { z } from 'zod';
import { useZodForm } from '@/lib/forms/useZodForm';
import FormField from '@/components/ui/FormField';

const DemoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

export default function DemoForm() {
  const f = useZodForm(DemoSchema, { name: '', email: '' });

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        f.handleSubmit(async (data) => {
          alert(`Saved!\n${JSON.stringify(data, null, 2)}`);
        });
      }}
      style={{ maxWidth: 420 }}
    >
      <h1 style={{ marginTop: 0 }}>Demo Form</h1>

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

      <FormField label="Email" error={f.errors.email} hint="We'll never share this.">
        <input
          value={f.values.email}
          onChange={f.onChange('email')}
          style={{
            background: 'transparent',
            color: 'var(--color-fg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            padding: '0.5rem'
          }}
        />
      </FormField>

      <button
        type="submit"
        disabled={f.submitting}
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          padding: '0.5rem 0.75rem',
          background: 'var(--color-accent)',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        {f.submitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}