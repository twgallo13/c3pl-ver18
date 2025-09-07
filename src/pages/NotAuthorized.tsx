import React from 'react';
import { Link } from 'react-router-dom';

export default function NotAuthorized() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Not Authorized</h1>
      <p style={{ color:'var(--color-muted)' }}>
        You don't have permission to view this page. Your current role doesn't allow access to this area.
      </p>
      <Link to="/" style={{ color:'var(--color-muted)', textDecoration:'none' }}>← Go home</Link>
    </div>
  );
}