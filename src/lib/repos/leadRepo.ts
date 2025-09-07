import { z } from 'zod';
import { loadJSON, saveJSON } from '../storage';
import { Lead } from '../contracts';

const KEY = 'leads';

export function getLeads(): z.infer<typeof Lead>[] {
  const arr = loadJSON(KEY, [] as unknown[]);
  // validate each item; drop invalid ones silently
  const out: z.infer<typeof Lead>[] = [];
  for (const item of arr) {
    const parsed = Lead.safeParse(item);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}

export function upsertLead(l: z.infer<typeof Lead>): void {
  const items = getLeads();
  const idx = items.findIndex(i => i.id === l.id);
  if (idx >= 0) items[idx] = l;
  else items.unshift(l);
  saveJSON(KEY, items);
}

export function removeLead(id: string): void {
  const items = getLeads();
  const next = items.filter(i => i.id !== id);
  saveJSON(KEY, next);
}