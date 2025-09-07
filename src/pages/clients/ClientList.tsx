import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAll, Client } from '../../lib/repos/clientRepo';
import { Button } from '../../components/ui/button';
import EmptyState from './EmptyState';
import { includes } from '../../lib/filters';
import { toCSV, downloadCSV } from '../../lib/csv';
import { useToast } from '../../components/ui/Toast';

const STORAGE_KEY = 'filters.clients';

type SortKey = 'name-asc' | 'name-desc' | 'created-asc' | 'created-desc';

type ClientFilters = {
  query: string;
  sortKey: SortKey;
};

export default function ClientList() {
  const [clients, setClients] = React.useState(() => getAll());
  const navigate = useNavigate();
  const { push } = useToast();

  // Load persisted filters
  const loadFilters = React.useCallback((): ClientFilters => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { query: '', sortKey: 'created-desc' as SortKey };
    } catch {
      return { query: '', sortKey: 'created-desc' as SortKey };
    }
  }, []);

  // Raw filter inputs (responsive to typing)
  const [rawFilters, setRawFilters] = React.useState<ClientFilters>(loadFilters);

  // Debounced filters (used for actual filtering)
  const [debouncedFilters, setDebouncedFilters] = React.useState<ClientFilters>(rawFilters);

  // Debounce filter changes (200ms)
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFilters(rawFilters);
      // Persist to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rawFilters));
    }, 200);

    return () => clearTimeout(timeout);
  }, [rawFilters]);

  // In a later prompt we might add events or a bus; for now manual refresh
  function refresh() {
    setClients(getAll());
  }

  // Filter clients by search query
  const filteredClients = React.useMemo(() => {
    if (!debouncedFilters.query.trim()) return clients;

    return clients.filter(client => {
      return includes(client.name, debouncedFilters.query) ||
        includes(client.contacts?.[0]?.email, debouncedFilters.query) ||
        includes(client.contacts?.[0]?.phone, debouncedFilters.query);
    });
  }, [clients, debouncedFilters.query]);

  // Sort clients
  const sortedClients = React.useMemo(() => {
    const n = (v?: number) => (typeof v === "number" ? v : 0);
    const sorters = {
      "name-asc": (a: Client, b: Client) => a.name.localeCompare(b.name),
      "name-desc": (a: Client, b: Client) => b.name.localeCompare(a.name),
      "created-asc": (a: Client, b: Client) => n(a.createdAt) - n(b.createdAt),
      "created-desc": (a: Client, b: Client) => n(b.createdAt) - n(a.createdAt),
    } as const;
    return [...filteredClients].sort(sorters[debouncedFilters.sortKey]);
  }, [filteredClients, debouncedFilters.sortKey]);

  function exportCSV() {
    const rows = getAll().map(c => ({
      id: c.id,
      name: c.name,
      email: c.contacts?.[0]?.email ?? '',
      phone: c.contacts?.[0]?.phone ?? '',
      status: c.status,
      createdAt: c.createdAt ?? ''
    }));
    const csv = toCSV(rows, ['id', 'name', 'email', 'phone', 'status', 'createdAt']);
    downloadCSV(`clients_${new Date().toISOString().slice(0, 10)}.csv`, csv);
    push({ text: 'Client list exported', kind: 'success' });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
        <h1 style={{ marginTop: 0 }}>Clients</h1>
        <Button variant="primary" onClick={() => navigate('/clients/new')} aria-label="Add Client">
          Add Client
        </Button>
      </div>

      {/* Search and Sort Controls */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Search clients..."
          value={rawFilters.query}
          onChange={e => setRawFilters(prev => ({ ...prev, query: e.target.value }))}
          onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
          aria-label="Search clients"
          style={{
            background: 'transparent',
            color: 'var(--color-fg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            padding: '0.5rem',
            minWidth: '240px'
          }}
        />
        <select
          value={rawFilters.sortKey}
          onChange={e => setRawFilters(prev => ({ ...prev, sortKey: e.target.value as SortKey }))}
          aria-label="Sort clients"
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
      </div>

      <p style={{ color: 'var(--color-muted)' }}>
        Showing {sortedClients.length} of {clients.length} client{clients.length === 1 ? '' : 's'} (local demo).
      </p>

      {sortedClients.length === 0 ? (
        clients.length === 0 ? (
          <EmptyState title="No clients yet" subtitle="Add your first client to get started." showAdd />
        ) : (
          <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '2rem' }}>
            No clients match your search.
          </p>
        )
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {sortedClients.map(c => (
            <li key={c.id} style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <div>
                <Link to={`/clients/${c.id}`} style={{ color: 'var(--color-fg)', textDecoration: 'none' }}>
                  <strong>{c.name}</strong>
                </Link>
              </div>
              <div style={{ color: 'var(--color-muted)', fontSize: 12 }}>
                {(c.contacts?.[0]?.email || 'no email')} · {(c.contacts?.[0]?.phone || 'no phone')}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        <Button variant="muted" onClick={refresh}>
          Refresh
        </Button>
        <Button variant="muted" onClick={exportCSV}>
          Export CSV
        </Button>
      </div>
    </div>
  );
}