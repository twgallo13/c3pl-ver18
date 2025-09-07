import { z } from 'zod';
import { loadJSON, saveJSON } from '../storage';
import { Shipment } from '../contracts';

const KEY = 'shipments';

export function getShipments(): z.infer<typeof Shipment>[] {
  const arr = loadJSON(KEY, [] as unknown[]);
  const out: z.infer<typeof Shipment>[] = [];
  for (const it of arr) {
    const p = Shipment.safeParse(it);
    if (p.success) out.push(p.data);
  }
  return out;
}

export function upsertShipment(s: z.infer<typeof Shipment>): void {
  const items = getShipments();
  const idx = items.findIndex(i => i.id === s.id);
  if (idx >= 0) items[idx] = s;
  else items.unshift(s);
  saveJSON(KEY, items);
}

export function removeShipment(id: string): void {
  const items = getShipments().filter(i => i.id !== id);
  saveJSON(KEY, items);
}