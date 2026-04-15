import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sentinel_token'));
  const [isLoading, setIsLoading] = useState(true); // loading while verifying stored token

  /**
   * Verify a stored token on mount. If invalid/expired, clear session.
   */
  useEffect(() => {
    const storedToken = localStorage.getItem('sentinel_token');
    const storedUser = localStorage.getItem('sentinel_user');
    if (storedToken && storedUser) {
      try {
        // Basic JWT expiry check (payload is base64-encoded)
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          // Token has expired
          clearSession();
        } else {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch {
        clearSession();
      }
    }
    setIsLoading(false);
  }, []);

  const clearSession = () => {
    localStorage.removeItem('sentinel_token');
    localStorage.removeItem('sentinel_user');
    setToken(null);
    setUser(null);
  };

  const login = useCallback(async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let msg = 'Đăng nhập thất bại.';
      try {
        const err = JSON.parse(errorText);
        msg = err.message || msg;
      } catch { /* not JSON */ }
      throw new Error(msg);
    }

    const data = await response.json();
    // Backend LoginResponseDTO: { accessToken, tokenType, userId, fullName, email, role }
    const { accessToken, fullName: resFullName, email: resEmail, userId, role } = data;
    const userData = { fullName: resFullName, email: resEmail, userId, role };

    localStorage.setItem('sentinel_token', accessToken);
    localStorage.setItem('sentinel_user', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);

    return data;
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let msg = 'Đăng ký thất bại.';
      try {
        const err = JSON.parse(errorText);
        msg = err.message || msg;
      } catch { /* not JSON */ }
      throw new Error(msg);
    }

    const data = await response.json();
    // Backend also returns full LoginResponseDTO on register — auto login the user
    const { accessToken, fullName: regFullName, email: regEmail, userId, role } = data;
    const userData = { fullName: regFullName, email: regEmail, userId, role };
    localStorage.setItem('sentinel_token', accessToken);
    localStorage.setItem('sentinel_user', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
    return data;
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, []);

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
