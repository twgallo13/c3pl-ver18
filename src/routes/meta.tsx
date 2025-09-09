import React from 'react';
import { APP_VERSION } from '../version';

export default function Meta() {
  const pkg = (import.meta as any).env?.npm_package_version ?? 'unknown';
  const apiBase = (import.meta as any).env?.VITE_API_BASE || '';
  return (
    <pre style={{ padding: 16, fontSize: 12 }}>
      {JSON.stringify({
        appVersion: APP_VERSION,
        packageVersion: pkg,
        host: location.host,
        apiBase: apiBase || '(same-origin)'
      }, null, 2)}
    </pre>
  );
}
