import React from 'react';
import { getClients } from '../../lib/repos/clientRepo';

type Props = {
  value: string;
  onChange: (id: string) => void;
};

export default function ClientPicker({ value, onChange }: Props) {
  const [clients, setClients] = React.useState(() => getClients());
  React.useEffect(() => { setClients(getClients()); }, []); // refresh on mount

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background:'transparent', color:'var(--color-fg)',
        border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.45rem 0.5rem'
      }}
    >
      <option value="" style={{ color:'black' }}>— Select client —</option>
      {clients.map(c => (
        <option key={c.id} value={c.id} style={{ color:'black' }}>
          {c.name}{c.contacts?.[0]?.email ? ` — ${c.contacts[0].email}` : ''}
        </option>
      ))}
    </select>
  );
}