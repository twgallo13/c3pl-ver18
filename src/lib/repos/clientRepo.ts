// src/lib/repos/clientRepo.ts

// ---- Types -----------------------------------------------------------------
export interface Client {
  id: string;
  name: string;
  status: "Active" | "Suspended" | "Prospect";
  contacts: { name: string; email?: string; phone?: string }[];
  billingAddress?: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    line2?: string;
  };
  shippingAddress?: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    line2?: string;
  };
  email?: string;
  phone?: string;
  notes?: string;
  createdAt?: number; // optional for back-compat
}

// ---- Storage utilities ------------------------------------------------------
const STORAGE_KEY = "clients";

function load(): Client[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return (arr as Client[]).map(withBackfill);
  } catch {
    return [];
  }
}

function save(list: Client[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// SINGLE, canonical withBackfill (do not duplicate)
function withBackfill(c: Client): Client {
  if (c.createdAt == null) {
    return { ...c, createdAt: Date.now() };
  }
  return c;
}

// ---- Public API -------------------------------------------------------------
export function getAll(): Client[] {
  return load();
}

export function getById(id: string): Client | undefined {
  return load().find((c) => c.id === id);
}

export function createClient(
  input: Omit<Client, "createdAt"> & { createdAt?: number }
): Client {
  const list = load();
  const record: Client = withBackfill({
    ...input,
    createdAt: input.createdAt ?? Date.now(),
  });
  list.push(record);
  save(list);
  return record;
}

export function updateClient(
  id: string,
  patch: Partial<Client>
): Client | undefined {
  const list = load();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  const updated = withBackfill({ ...list[idx], ...patch });
  list[idx] = updated;
  save(list);
  return updated;
}

export function deleteClient(id: string): void {
  const next = load().filter((c) => c.id !== id);
  save(next);
}

// Aggregated repo object (named + default export allowed)
export const clientsRepo = {
  getAll,
  getById,
  createClient,
  updateClient,
  deleteClient,
};

export default clientsRepo;