import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on startup
  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:9090/api/auth/me', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.username);
        setRole(data.role);
        return data;
      } else {
        setUser(null);
        setRole(null);
        return null;
      }
    } catch (err) {
      console.warn('Auth check failed:', err.message);
      setUser(null);
      setRole(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData.username);
    setRole(userData.role);
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:9090/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
      setRole(null);
    }
  };

  const value = {
    user,
    role,
    isAuthenticated: !!user,
    isAdmin: role === 'ADMIN',
    isCustomer: role === 'CUSTOMER',
    loading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
