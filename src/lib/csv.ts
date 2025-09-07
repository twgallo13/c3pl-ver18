// src/lib/csv.ts

function esc(v: unknown): string {
  if (v == null) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV<T extends Record<string, any>>(rows: T[], headers?: string[]): string {
  if (!rows || rows.length === 0) return '';
  const cols = headers ?? Object.keys(rows[0]);
  const head = cols.join(',');
  const body = rows.map(r => cols.map(c => esc((r as any)[c])).join(',')).join('\n');
  return head + '\n' + body;
}

export function downloadCSV(rows: any[], filename: string) {
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
