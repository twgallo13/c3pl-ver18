import React from 'react';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { fetchDemoProfile } from '../../lib/services/demoService';

export default function DemoClient() {
  const [status, setStatus] = React.useState<'idle'|'loading'|'error'|'ready'>('idle');
  const [error, setError] = React.useState<string|undefined>(undefined);
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    // auto-load so the page shows data immediately
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setStatus('loading');
    setError(undefined);
    try {
      const res = await fetchDemoProfile();
      setData(res);
      setStatus('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setStatus('error');
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Finance — Demo Client</h1>
      <p style={{ color: 'var(--color-muted)' }}>
        This demo uses the Zod-validated service to load a mock profile (no network).
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', margin: '0.75rem 0' }}>
        <button
          onClick={load}
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            padding: '0.5rem 0.75rem',
            background: 'var(--color-accent)',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Load Profile
        </button>
        <button
          onClick={() => { setStatus('idle'); setError(undefined); setData(null); }}
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            padding: '0.5rem 0.75rem',
            background: 'transparent',
            color: 'var(--color-fg)',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>

      {status === 'idle' && <EmptyState title="Nothing loaded yet" detail="Click Load Profile to fetch data." />}
      {status === 'loading' && <Loading label="Loading profile…" />}
      {status === 'error' && <ErrorState title="Failed to load" detail={error} />}
      {status === 'ready' && (
        <pre style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          padding: '0.75rem',
          overflowX: 'auto'
        }}>
{JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}