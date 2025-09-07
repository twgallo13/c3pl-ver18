import { z } from 'zod';
import { loadJSON, saveJSON } from '../storage';
import { Client } from '../contracts';

const KEY = 'clients';

export function getClients(): z.infer<typeof Client>[] {
  const arr = loadJSON(KEY, [] as unknown[]);
  const out: z.infer<typeof Client>[] = [];
  for (const item of arr) {
    const parsed = Client.safeParse(item);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}

export function upsertClient(c: z.infer<typeof Client>): void {
  const items = getClients();
  const idx = items.findIndex(i => i.id === c.id);
  if (idx >= 0) items[idx] = c;
  else items.unshift(c);
  saveJSON(KEY, items);
}