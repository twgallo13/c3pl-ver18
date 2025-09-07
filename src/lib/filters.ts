// Shared, type-safe, case-insensitive helpers

export const normalize = (v: unknown): string => {
  return (v ?? "").toString().trim().toLowerCase();
};

export const includes = (hay: unknown, needle: unknown): boolean => {
  const h = normalize(hay);
  const n = normalize(needle);
  if (!n) return true; // empty query matches all
  return h.includes(n);
};
