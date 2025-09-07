import React from 'react';
import { Link } from 'react-router-dom';

export default function NotAuthorized() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Not authorized</h1>
      <p style={{ color:'var(--color-muted)' }}>
        You don't have permission to view this page with your current role.
        Try switching roles in the sidebar or return to a page you can access.
      </p>
      <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
        <Link to="/" style={{ textDecoration:'none', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.4rem 0.6rem', color:'var(--color-fg)' }}>Home</Link>
        <Link to="/clients" style={{ textDecoration:'none', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.4rem 0.6rem', color:'var(--color-fg)' }}>Clients</Link>
        <Link to="/inventory" style={{ textDecoration:'none', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.4rem 0.6rem', color:'var(--color-fg)' }}>Inventory</Link>
        <Link to="/po" style={{ textDecoration:'none', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.4rem 0.6rem', color:'var(--color-fg)' }}>POs</Link>
        <Link to="/shipments" style={{ textDecoration:'none', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.4rem 0.6rem', color:'var(--color-fg)' }}>Shipments</Link>
      </div>
    </div>
  );
}