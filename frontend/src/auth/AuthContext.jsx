import { createContext, useContext, useEffect, useState } from 'react';
import { api, getAuth, setAuth, setUnauthorizedHandler } from '../api/client.js';

// The token is kept in sessionStorage: it is cleared when the tab closes. The backend checks it on every request.
const AuthContext = createContext(null);
const toUser = (u) => ({ name: u.fullName, email: u.email, role: u.role });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getAuth()?.user || null);

  useEffect(() => {
    setUnauthorizedHandler(() => { setAuth(null); setUser(null); }); // expired token: back to the login page
  }, []);

  const login = async (email, password) => {
    if (!email.trim() || !password) throw new Error('Enter your email and password.');
    const res = await api('/api/auth/login', { method: 'POST', body: { email: email.trim(), password } });
    const u = toUser(res.user);
    setAuth({ token: res.token, user: u });
    setUser(u);
  };
  const logout = () => { setAuth(null); setUser(null); };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
