import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import routeRegistry from './routes/registry';
import type { AppRoute } from './routes/registry';
import NotFound from './components/NotFound';
import { APP_VERSION } from './version';
import ErrorBoundary from './components/ui/ErrorBoundary';
import Loading from './components/ui/Loading';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import LoginGate from './components/auth/LoginGate';
import NotAuthorized from './pages/NotAuthorized';

function allowedRoutes(role: string): AppRoute[] {
  return routeRegistry.filter(r => r.roles.includes(role) || r.roles.includes('All Internal'));
}

// Helper component to check route permissions
function RequireRole({ roles, currentRole, children }: { 
  roles?: string[]|null; 
  currentRole: string|null; 
  children: React.ReactNode; 
}) {
  if (!roles || roles.length === 0) return <>{children}</>;
  if (currentRole && roles.includes(currentRole)) return <>{children}</>;
  return <NotAuthorized />;
}

function AuthedAppShellInner() {
  const { user, setRole, signOut } = useAuth();
  if (!user) return <LoginGate />;

  const role = user.role;
  const routes = allowedRoutes(role);
  const location = useLocation();

  const ROLES = [
    'Admin',
    'Finance',
    'Ops',
    'CS',
    'AccountManager',
    'WarehouseManager',
    'WarehouseStaff',
    'Vendor',
    'Investor'
  ] as const;

  return (
    <ToastProvider>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
        <aside style={{
          borderRight: `1px solid var(--color-border)`,
          padding: '1rem',
          background: 'rgba(255,255,255,0.02)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
            <div style={{ fontWeight: 600 }}>Collab3PL</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{APP_VERSION}</div>
          </div>

          {/* Role switcher synced with auth */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'grid', gap: 6, fontSize: 12 }}>
              <span style={{ color: 'var(--color-muted)' }}>Role</span>
              <select
                value={user.role}
                onChange={e => setRole(e.target.value as any)}
                style={{
                  background: 'transparent',
                  color: 'var(--color-fg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  padding: '0.35rem 0.5rem',
                  outline: 'none'
                }}
              >
                {ROLES.map(r => (
                  <option key={r} value={r} style={{ color: 'black' }}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <nav style={{ display: 'grid', gap: '0.5rem', flex: 1 }}>
            {routes.map(r => (
              <Link key={r.path} to={r.path} style={{
                textDecoration: 'none',
                color: location.pathname === r.path ? 'var(--color-fg)' : 'var(--color-muted)',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius)',
                border: location.pathname === r.path ? `1px solid var(--color-border)` : '1px solid transparent',
                background: location.pathname === r.path ? 'rgba(255,255,255,0.03)' : 'transparent'
              }}>
                <span style={{ marginRight: 6 }}>{r.icon || '•'}</span>{r.label}
              </Link>
            ))}
          </nav>

          {/* Sign out button at bottom */}
          <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
            <button
              onClick={signOut}
              style={{
                width: '100%',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                padding: '0.4rem 0.6rem',
                background: 'transparent',
                color: 'var(--color-fg)',
                cursor: 'pointer'
              }}
            >
              Sign out
            </button>
          </div>
        </aside>

        <main style={{ padding: '1rem' }}>
          <ErrorBoundary>
            <React.Suspense fallback={<Loading />}>
              <Routes>
                {routes.map(({ path, component: C, roles }) => (
                  <Route key={path} path={path} element={
                    <RequireRole roles={roles} currentRole={user.role}>
                      <C />
                    </RequireRole>
                  } />
                ))}
                <Route path="/" element={<Navigate to={routes[0]?.path || '/not-found'} replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </React.Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </ToastProvider>
  );
}

export default function AppShell() {
  return (
    <AuthProvider>
      <AuthedAppShellInner />
    </AuthProvider>
  );
}