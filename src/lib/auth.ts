// src/lib/auth.ts

export type User = {
  id: string;
  name: string;
  role:
    | 'Admin'
    | 'Finance'
    | 'Ops'
    | 'CS'
    | 'AccountManager'
    | 'WarehouseManager'
    | 'WarehouseStaff';
};

const KEY = 'collab3pl.v18:authUser';

export function getUser(): User | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setUser(u: User | null) {
  if (!u) localStorage.removeItem(KEY);
  else localStorage.setItem(KEY, JSON.stringify(u));
}
