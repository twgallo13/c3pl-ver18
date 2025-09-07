// Tiny localStorage JSON helpers with namespacing.

const NS = 'collab3pl.v18';

function k(key: string) {
  return `${NS}:${key}`;
}

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(k(key));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T): void {
  localStorage.setItem(k(key), JSON.stringify(value));
}

export function remove(key: string): void {
  localStorage.removeItem(k(key));
}