import React from 'react';
import { getUser, setUser, type User } from '../../lib/auth';

type Ctx = { 
  user: User | null; 
  signIn: (u: User) => void; 
  signOut: () => void; 
  setRole: (role: User['role']) => void;
};
const AuthCtx = React.createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = React.useState<User | null>(() => getUser());

  const signIn = (u: User) => { setUser(u); setUserState(u); };
  const signOut = () => { setUser(null); setUserState(null); };
  
  const setRole = React.useCallback((role: User['role']) => {
    setUserState(prev => {
      const next = prev ? { ...prev, role } : null;
      setUser(next);
      return next;
    });
  }, []);

  return <AuthCtx.Provider value={{ user, signIn, signOut, setRole }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}