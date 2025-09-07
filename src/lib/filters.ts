// Shared filter utilities for case-insensitive string matching

export const normalize = (v: unknown): string =>
  (v ?? "").toString().trim().toLowerCase();

export const includes = (hay: unknown, needle: unknown): boolean =>
  normalize(hay).includes(normalize(needle));
