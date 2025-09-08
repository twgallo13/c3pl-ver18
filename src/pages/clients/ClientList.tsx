import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { includes } from "../../lib/filters";
import { getAll, type Client } from "../../lib/repos/clientRepo";
import { Button } from "../../components/ui/button";
import { downloadCSV } from "../../lib/csv";

type SortKey = "name-asc" | "name-desc" | "created-asc" | "created-desc";
const LS_KEY = "filters.clients";

function readPersisted() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { query: "", sortKey: "created-desc" as SortKey };
    const parsed = JSON.parse(raw);
    return {
      query: typeof parsed.query === "string" ? parsed.query : "",
      sortKey: (["name-asc", "name-desc", "created-asc", "created-desc"].includes(parsed.sortKey)
        ? parsed.sortKey
        : "created-desc") as SortKey,
    };
  } catch {
    return { query: "", sortKey: "created-desc" as SortKey };
  }
}

function persist(state: { query: string; sortKey: SortKey }) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

const n = (v?: number) => (typeof v === "number" ? v : 0);

const sorters: Record<SortKey, (a: Client, b: Client) => number> = {
  "name-asc": (a, b) => a.name.localeCompare(b.name),
  "name-desc": (a, b) => b.name.localeCompare(a.name),
  "created-asc": (a, b) => n(a.createdAt) - n(b.createdAt),
  "created-desc": (a, b) => n(b.createdAt) - n(a.createdAt),
};

export default function ClientList() {
  const nav = useNavigate();
  const all: Client[] = getAll(); // source of truth (used for CSV, unfiltered)
  const [{ query, sortKey }, setState] = useState(readPersisted());
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  // Persist on changes
  useEffect(() => {
    persist({ query, sortKey });
  }, [query, sortKey]);

  const filtered = useMemo(() => {
    if (!debouncedQuery) return all;
    return all.filter((c) =>
      includes(c.name, debouncedQuery) ||
      includes(c.email, debouncedQuery) ||
      includes(c.phone, debouncedQuery) ||
      includes(c.contacts?.[0]?.email, debouncedQuery) ||
      includes(c.contacts?.[0]?.phone, debouncedQuery)
    );
  }, [all, debouncedQuery]);

  const shown = useMemo(() => {
    return [...filtered].sort(sorters[sortKey]);
  }, [filtered, sortKey]);

  const exportCSV = () => {
    // Always export the FULL, UNFILTERED dataset
    const rows = all.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email ?? c.contacts?.[0]?.email ?? "",
      phone: c.phone ?? c.contacts?.[0]?.phone ?? "",
      status: c.status,
      createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : "",
    }));
    downloadCSV("clients.csv", rows);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Clients</h1>
        <div className="flex items-center gap-2">
          <input
            aria-label="Search clients"
            placeholder="Search clients..."
            value={query}
            onChange={(e) => setState((s) => ({ ...s, query: e.target.value }))}
            className="rounded-xl border px-3 py-2 text-sm"
            style={{
              background: 'transparent',
              color: 'var(--color-fg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              minWidth: '240px'
            }}
          />
          <select
            aria-label="Sort clients"
            value={sortKey}
            onChange={(e) => setState((s) => ({ ...s, sortKey: e.target.value as SortKey }))}
            className="rounded-xl border px-3 py-2 text-sm"
            style={{
              background: 'transparent',
              color: 'var(--color-fg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '0.45rem 0.5rem'
            }}
          >
            <option value="name-asc" style={{ color: 'black' }}>Name ↑</option>
            <option value="name-desc" style={{ color: 'black' }}>Name ↓</option>
            <option value="created-asc" style={{ color: 'black' }}>Created ↑</option>
            <option value="created-desc" style={{ color: 'black' }}>Created ↓</option>
          </select>
          <Button variant="muted" onClick={() => setState({ query: "", sortKey: "created-desc" })} aria-label="Reset filters">
            Reset
          </Button>
          <Button variant="muted" onClick={exportCSV} aria-label="Export CSV">
            Export CSV
          </Button>
          <Button variant="primary" onClick={() => nav("/clients/new")} aria-label="Add Client">
            Add Client
          </Button>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-2xl border p-8 text-center" style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <p className="text-sm opacity-80" style={{ color: 'var(--color-muted)' }}>
            {all.length === 0 ? "No clients yet. Add your first client to get started." : "No clients match your search."}
          </p>
          <div className="mt-4">
            <Button variant="primary" onClick={() => nav("/clients/new")} aria-label="Add Client">Add Client</Button>
          </div>
        </div>
      ) : (
        <div className="overflow-auto rounded-2xl border" style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          overflow: 'auto'
        }}>
          <table className="min-w-full text-sm" style={{ width: '100%', fontSize: '0.875rem' }}>
            <thead style={{ background: 'rgba(0,0,0,0.05)' }}>
              <tr>
                <th className="px-3 py-2 text-left" style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Name</th>
                <th className="px-3 py-2 text-left" style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Email</th>
                <th className="px-3 py-2 text-left" style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Phone</th>
                <th className="px-3 py-2 text-left" style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Status</th>
                <th className="px-3 py-2 text-left" style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td className="px-3 py-2" style={{ padding: '0.5rem 0.75rem' }}>
                    <Link to={`/clients/${c.id}`} className="underline underline-offset-2" style={{
                      textDecoration: 'underline',
                      textUnderlineOffset: '2px',
                      color: 'var(--color-fg)'
                    }}>
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2" style={{ padding: '0.5rem 0.75rem' }}>
                    {c.email ?? c.contacts?.[0]?.email ?? "-"}
                  </td>
                  <td className="px-3 py-2" style={{ padding: '0.5rem 0.75rem' }}>
                    {c.phone ?? c.contacts?.[0]?.phone ?? "-"}
                  </td>
                  <td className="px-3 py-2" style={{ padding: '0.5rem 0.75rem' }}>{c.status}</td>
                  <td className="px-3 py-2" style={{ padding: '0.5rem 0.75rem' }}>
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}