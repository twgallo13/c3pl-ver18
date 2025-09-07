// src/lib/csv.ts

function escapeCell(v: unknown): string {
  if (v == null) return '';
    // wrap in quotes 
  if (/[,"\n]/.test(s)) {
    // wrap in quotes and escape inner quotes
    return `"${s.replace(/"/g, '""')}"`;
  c
}
e

  a.href = url;
  a.click();
}

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