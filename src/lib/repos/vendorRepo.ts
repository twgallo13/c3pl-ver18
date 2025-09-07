import { z } from 'zod';
import { loadJSON, saveJSON } from '../storage';
import { Vendor, UUID, NonEmptyString, Email, Phone } from '../contracts';

const KEY = 'vendors';

export function getVendors(): z.infer<typeof Vendor>[] {
  const arr = loadJSON(KEY, [] as unknown[]);
  const out: z.infer<typeof Vendor>[] = [];
  for (const it of arr) {
    const p = Vendor.safeParse(it);
    if (p.success) out.push(p.data);
  }
  // seed once if empty (demo convenience)
  if (out.length === 0) {
    const seed = {
      id: crypto.randomUUID(),
      name: 'Acme Supplies',
      contact: { name: 'Acme Sales', email: 'sales@acme.example' }
    } as z.infer<typeof Vendor>;
    out.push(seed);
    saveJSON(KEY, out);
  }
  return out;
}

export function upsertVendor(v: z.infer<typeof Vendor>): void {
  const items = getVendors();
  const idx = items.findIndex(i => i.id === v.id);
  if (idx >= 0) items[idx] = v; else items.unshift(v);
  saveJSON(KEY, items);
}