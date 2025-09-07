import React from 'react';
import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../ui/Toast';

type Props = { nextPath?: string };

const ROLES = ['Admin','Finance','Ops','CS','AccountManager','WarehouseManager','WarehouseStaff'] as const;

export default function LoginGate({ nextPath = '/' }: Props) {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const { push } = useToast();
  const [name, setName] = React.useState('Demo User');
  const [role, setRole] = React.useState<typeof ROLES[number]>('Admin');

  function doSignIn() {
    signIn({ id: crypto.randomUUID(), name, role });
    push({ text: `Signed in as ${name} (${role})`, kind: 'success' });
    nav(nextPath);
  }

  return (
    <div style={{ minHeight:'100vh', display:'grid', placeItems:'center', color:'var(--color-fg)' }}>
      <div style={{ width:360, border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'1rem', background:'rgba(255,255,255,0.03)' }}>
        <h1 style={{ marginTop:0 }}>Sign in</h1>

        <label style={{ display:'block', margin:'0.5rem 0 0.25rem' }}>Display name</label>
        <input value={name} onChange={e=>setName(e.target.value)}
               style={{ width:'100%', background:'transparent', color:'var(--color-fg)', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.5rem' }}/>

        <label style={{ display:'block', margin:'0.75rem 0 0.25rem' }}>Role</label>
        <select value={role} onChange={e=>setRole(e.target.value as any)}
                style={{ width:'100%', background:'transparent', color:'var(--color-fg)', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.45rem 0.5rem' }}>
          {ROLES.map(r => <option key={r} value={r} style={{ color:'black' }}>{r}</option>)}
        </select>

        <button onClick={doSignIn}
                style={{ marginTop:'0.75rem', width:'100%', border:'1px solid var(--color-border)', borderRadius:'var(--radius)', padding:'0.5rem 0.75rem', background:'var(--color-accent)', color:'white', cursor:'pointer' }}>
          Enter App
        </button>

        <p style={{ color:'var(--color-muted)', fontSize:12, marginTop:'0.5rem' }}>
          (Local demo auth; no passwords.)
        </p>
      </div>
    </div>
  );
}