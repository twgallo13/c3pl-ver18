import { getClients } from './repos/clientRepo';
import { getVendors } from './repos/vendorRepo';
import { getInventory } from './repos/inventoryRepo';

export function clientName(id: string | undefined | null): string {
  if (!id) return '';
  const c = getClients().find(x => x.id === id);
  return c?.name ?? id;
}

export function vendorName(id: string | undefined | null): string {
  if (!id) return '';
  const v = getVendors().find(x => x.id === id);
  return v?.name ?? id;
}

export function inventoryLabel(id: string | undefined | null): string {
  if (!id) return '';
  const i = getInventory().find(x => x.id === id);
  if (!i) return id;
  return `${i.sku} — ${i.name}`;
}