// src/lib/csv.ts

function escapeCell(v: unknown): string {
  if (v == null) return '';
  const s = String(v);
  if (/[,"\n]/.test(s)) {
    // wrap in quotes and escape inner quotes
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCSV<T extends Record<string, any>>(rows: T[], headers?: string[]): string {
  if (!rows || rows.length === 0) return '';
  const cols = headers ?? Object.keys(rows[0]);
  const head = cols.join(',');
  const body = rows.map(r => cols.map(c => escapeCell(r[c])).join(',')).join('\n');
  return `${head}\n${body}`;
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}