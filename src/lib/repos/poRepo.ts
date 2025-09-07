import { z } from 'zod';
import { loadJSON, saveJSON } from '../storage';
import { PurchaseOrder } from '../contracts';

const KEY = 'purchaseOrders';

export function getPurchaseOrders(): z.infer<typeof PurchaseOrder>[] {
  const arr = loadJSON(KEY, [] as unknown[]);
  const out: z.infer<typeof PurchaseOrder>[] = [];
  for (const it of arr) {
    const p = PurchaseOrder.safeParse(it);
    if (p.success) out.push(p.data);
  }
  return out;
}

export function upsertPurchaseOrder(po: z.infer<typeof PurchaseOrder>): void {
  const items = getPurchaseOrders();
  const idx = items.findIndex(i => i.id === po.id);
  if (idx >= 0) items[idx] = po;
  else items.unshift(po);
  saveJSON(KEY, items);
}

export function removePurchaseOrder(id: string): void {
  const items = getPurchaseOrders().filter(i => i.id !== id);
  saveJSON(KEY, items);
}