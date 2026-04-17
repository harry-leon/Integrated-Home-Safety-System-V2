import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { smartLockApi } from '../services/api';

const AuthContext = createContext(null);

const normalizeUser = (profile) => ({
  userId: profile?.userId,
  fullName: profile?.fullName || 'Sentinel User',
  email: profile?.email || '',
  role: profile?.role || 'MEMBER',
  avatarUrl: profile?.avatarUrl || '',
  phone: profile?.phone || '',
  gender: profile?.gender || '',
  dateOfBirth: profile?.dateOfBirth || '',
  address: profile?.address || '',
  bio: profile?.bio || '',
  lastLogin: profile?.lastLogin || null,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sentinel_token'));
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem('sentinel_token');
    localStorage.removeItem('sentinel_user');
    setToken(null);
    setUser(null);
  }, []);

  const persistSession = useCallback((accessToken, profile) => {
    const normalized = normalizeUser(profile);
    localStorage.setItem('sentinel_token', accessToken);
    localStorage.setItem('sentinel_user', JSON.stringify(normalized));
    setToken(accessToken);
    setUser(normalized);
    return normalized;
  }, []);

  const applyUserProfile = useCallback(
    (profile) => {
      const currentToken = localStorage.getItem('sentinel_token');
      if (!currentToken) return null;
      return persistSession(currentToken, profile);
    },
    [persistSession],
  );

  const refreshProfile = useCallback(async () => {
    const currentToken = localStorage.getItem('sentinel_token');
    if (!currentToken) return null;

    try {
      const profile = await smartLockApi.getCurrentProfile();
      return persistSession(currentToken, profile);
    } catch (error) {
      clearSession();
      throw error;
    }
  }, [clearSession, persistSession]);

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = localStorage.getItem('sentinel_token');
      const storedUser = localStorage.getItem('sentinel_user');

      if (storedToken && storedUser) {
        try {
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            clearSession();
          } else {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            try {
              await refreshProfile();
            } catch {
              clearSession();
            }
          }
        } catch {
          clearSession();
        }
      }

      setIsLoading(false);
    };

    bootstrap();
  }, [clearSession, refreshProfile]);

  const login = useCallback(
    async (email, password) => {
      const data = await smartLockApi.login(email, password);
      const nextToken = data.accessToken;
      localStorage.setItem('sentinel_token', nextToken);
      setToken(nextToken);
      const profile = await smartLockApi.getCurrentProfile();
      persistSession(nextToken, profile);
      return data;
    },
    [persistSession],
  );

  const register = useCallback(
    async (fullName, email, password) => {
      const data = await smartLockApi.register(fullName, email, password);
      const nextToken = data.accessToken;
      localStorage.setItem('sentinel_token', nextToken);
      setToken(nextToken);
      const profile = await smartLockApi.getCurrentProfile();
      persistSession(nextToken, profile);
      return data;
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    try {
      if (localStorage.getItem('sentinel_token')) {
        await smartLockApi.logout();
      }
    } catch {
      // best-effort logout for stateless auth
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        applyUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

