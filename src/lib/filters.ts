// Shared filter utilities for case-insensitive string matching
export const normalize = (v: unknown) =>
  (v ?? "").toString().trim().toLowerCase();

export const includes = (hay: unknown, needle: unknown) =>
  normalize(hay).includes(normalize(needle));