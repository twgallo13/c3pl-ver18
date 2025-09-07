import React from 'react';
import { useAuth } from './AuthProvider';

const ROLES = ['Admin','Finance','Ops','CS','AccountManager','WarehouseManager','WarehouseStaff'] as const;

export default function LoginGate() {
  const { signIn } = useAuth();
  const [name, setName] = React.useState('Demo User');
  const [role, setRole] = React.useState<typeof ROLES[number]>('Admin');

  function doSignIn() { signIn({ id: crypto.randomUUID(), name, role }); }

  return (
    <div style={{ minHeight:'100vh', display:'grid', placeItems:'center', background:'var(--color-bg)', color:'var(--color-fg)' }}>
      <div style={{ 
        width:360, 
        border:'1px solid var(--color-border)', 
        borderRadius:'var(--radius)', 
        padding:'1.5rem',
        background:'rgba(255,255,255,0.02)'
      }}>
        <h1 style={{ marginTop:0, marginBottom:'1rem' }}>Collab3PL V18</h1>
        <p style={{ color:'var(--color-muted)', fontSize:14, marginBottom:'1rem' }}>
          Sign in to continue
        </p>
        
        <div style={{ display:'grid', gap:'0.75rem' }}>
          <div>
            <label style={{ display:'block', marginBottom:'0.25rem', fontSize:14 }}>Name</label>
            <input 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              style={{ 
                width:'100%', 
                background:'transparent',
                color:'var(--color-fg)',
                border:'1px solid var(--color-border)',
                borderRadius:'var(--radius)',
                padding:'0.5rem'
              }}
            />
          </div>
          
          <div>
            <label style={{ display:'block', marginBottom:'0.25rem', fontSize:14 }}>Role</label>
            <select 
              value={role} 
              onChange={e=>setRole(e.target.value as any)} 
              style={{ 
                width:'100%', 
                background:'transparent',
                color:'var(--color-fg)',
                border:'1px solid var(--color-border)',
                borderRadius:'var(--radius)',
                padding:'0.5rem'
              }}
            >
              {ROLES.map(r => <option key={r} value={r} style={{ color:'black' }}>{r}</option>)}
            </select>
          </div>
          
          <button 
            onClick={doSignIn} 
            style={{ 
              marginTop:'0.5rem', 
              width:'100%',
              background:'var(--color-accent)',
              color:'white',
              border:'1px solid var(--color-border)',
              borderRadius:'var(--radius)',
              padding:'0.75rem',
              cursor:'pointer'
            }}
          >
            Enter App
          </button>
        </div>
      </div>
    </div>
  );
}