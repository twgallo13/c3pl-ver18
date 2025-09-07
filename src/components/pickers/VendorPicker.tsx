import React from 'react';
import { getVendors } from '../../lib/repos/vendorRepo';

type Props = {
  value: string;
  onChange: (id: string) => void;
};

export default function VendorPicker({ value, onChange }: Props) {
  const [vendors, setVendors] = React.useState(() => getVendors());
  React.useEffect(() => { setVendors(getVendors()); }, []);

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background:'transparent', color:'var(--color-fg)',
        border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.45rem 0.5rem'
      }}
    >
      <option value="" style={{ color:'black' }}>— Select vendor —</option>
      {vendors.map(v => (
        <option key={v.id} value={v.id} style={{ color:'black' }}>
          {v.name}{v.contact?.email ? ` — ${v.contact.email}` : ''}
        </option>
      ))}
    </select>
  );
}