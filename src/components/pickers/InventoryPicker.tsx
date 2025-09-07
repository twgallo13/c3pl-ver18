import React from 'react';
import { getInventory } from '../../lib/repos/inventoryRepo';

type Props = {
  value: string;
  onChange: (id: string) => void;
};

export default function InventoryPicker({ value, onChange }: Props) {
  const [items, setItems] = React.useState(() => getInventory());
  React.useEffect(() => { setItems(getInventory()); }, []);

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background:'transparent', color:'var(--color-fg)',
        border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.45rem 0.5rem'
      }}
    >
      <option value="" style={{ color:'black' }}>— Select item —</option>
      {items.map(i => (
        <option key={i.id} value={i.id} style={{ color:'black' }}>
          {i.sku} — {i.name}{i.location ? ` @ ${i.location}` : ''}
        </option>
      ))}
    </select>
  );
}