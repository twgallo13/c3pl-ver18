import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import routeRegistry from './routes/registry';
import type { AppRoute } from './routes/registry';
import NotFound from './components/NotFound';
import RoleSwitcher from './components/RoleSwitcher';
import { APP_VERSION } from './version';

function getCurrentRole(): string {
  // Temp local role until server RBAC is wired; default Admin for access
  return localStorage.getItem('currentRole') || 'Admin';
}
function allowedRoutes(role: string): AppRoute[] {
  return routeRegistry.filter(r => r.roles.includes(role) || r.roles.includes('All Internal'));
}

export default function AppShell() {
  const role = getCurrentRole();
  const routes = allowedRoutes(role);
  const location = useLocation();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
      <aside style={{
        borderRight: `1px solid var(--color-border)`,
        padding: '1rem',
        background: 'rgba(255,255,255,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
          <div style={{ fontWeight: 600 }}>Collab3PL</div>
          <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{APP_VERSION}</div>
        </div>

        {/* Role switcher (local tester) */}
        <div style={{ marginBottom: '0.75rem' }}>
          <RoleSwitcher />
        </div>

        <nav style={{ display: 'grid', gap: '0.5rem' }}>
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
      </aside>

      <main style={{ padding: '1rem' }}>
        <Routes>
          {routes.map(({ path, component: C }) => (
            <Route key={path} path={path} element={<C />} />
          ))}
          <Route path="/" element={<Navigate to={routes[0]?.path || '/not-found'} replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}