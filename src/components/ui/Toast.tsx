import React from 'react';

type Toast = { id: string; text: string; kind?: 'success'|'error' };
type Ctx = { toasts: Toast[]; push: (t: Omit<Toast, 'id'>) => void; remove: (id: string) => void };

const ToastCtx = React.createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const remove = React.useCallback((id: string) => setToasts(t => t.filter(x => x.id !== id)), []);
  const push = React.useCallback((t: Omit<Toast,'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(list => [...list, { id, ...t }]);
    // auto-dismiss after 2.5s
    setTimeout(() => remove(id), 2500);
  }, [remove]);

  return (
    <ToastCtx.Provider value={{ toasts, push, remove }}>
      {children}
      {/* container */}
      <div style={{
        position:'fixed', right:16, bottom:16, display:'grid', gap:8, zIndex:9999
      }}>
        {toasts.map(t => (
          <div key={t.id} role="status"
            style={{
              background: t.kind === 'error' ? 'rgba(255,80,80,0.15)' : 'rgba(80,255,160,0.12)',
              color: 'var(--color-fg)',
              border: '1px solid var(--color-border)',
              borderLeft: `4px solid ${t.kind === 'error' ? '#ff5050' : '#2ecc71'}`,
              borderRadius: 'var(--radius)',
              padding: '0.5rem 0.75rem',
              minWidth: 260,
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
            }}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}