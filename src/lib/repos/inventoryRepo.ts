import { z } from 'zod';
import { loadJSON, saveJSON } from '../storage';
import { InventoryItem, UUID, NonEmptyString, NonNegativeInt } from '../contracts';

const KEY = 'inventory';

export function getInventory(): z.infer<typeof InventoryItem>[] {
  const arr = loadJSON(KEY, [] as unknown[]);
  const out: z.infer<typeof InventoryItem>[] = [];
  for (const it of arr) {
    const p = InventoryItem.safeParse(it);
    if (p.success) out.push(p.data);
  }
  return out;
}

export function upsertInventoryItem(item: z.infer<typeof InventoryItem>): void {
  const items = getInventory();
  const idx = items.findIndex(i => i.id === item.id);
  if (idx >= 0) items[idx] = item;
  else items.unshift(item);
  saveJSON(KEY, items);
}

export function removeInventoryItem(id: string): void {
  const items = getInventory().filter(i => i.id !== id);
  saveJSON(KEY, items);
}