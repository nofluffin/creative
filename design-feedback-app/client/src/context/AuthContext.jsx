import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { getAuthConfig, googleSignIn, getMe, logout as apiLogout } from '../api/client';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAuthConfig()
        .then((c) => setClientId(c.clientId || null))
        .catch(() => {}),
      token
        ? getMe(token)
            .then((d) => setUser(d.user))
            .catch(() => {
              localStorage.removeItem('auth_token');
              setToken(null);
            })
        : Promise.resolve(),
    ]).finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async (credential) => {
    const data = await googleSignIn(credential);
    localStorage.setItem('auth_token', data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const signOut = useCallback(async () => {
    if (token) await apiLogout(token).catch(() => {});
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  }, [token]);

  const value = { user, token, loading, signIn, signOut, clientId };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8FAFC]">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  const content = (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );

  if (clientId) {
    return (
      <GoogleOAuthProvider clientId={clientId}>
        {content}
      </GoogleOAuthProvider>
    );
  }

  return content;
}
