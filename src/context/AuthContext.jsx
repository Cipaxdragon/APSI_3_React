import React, { createContext, useContext, useState, useEffect } from 'react';
import { SidanusDB } from '../db/sidanusDB';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = SidanusDB.getSession();
    setSessionState(s);
    setLoading(false);
  }, []);

  const login = (role, identifier) => {
    SidanusDB.setSession(role, identifier);
    setSessionState({ role, identifier });
  };

  const logout = () => {
    SidanusDB.clearSession();
    setSessionState(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ session, login, logout, isAuthenticated: !!session }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
