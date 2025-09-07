import React from 'react';
import { getUser, setUser, type User } from '../../lib/auth';

type Ctx = { user: User | null; signIn: (u: User) => void; signOut: () => void; };
const AuthCtx = React.createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = React.useState<User | null>(() => getUser());

  const signIn = (u: User) => { setUser(u); setUserState(u); };
  const signOut = () => { setUser(null); setUserState(null); };

  return <AuthCtx.Provider value={{ user, signIn, signOut }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}