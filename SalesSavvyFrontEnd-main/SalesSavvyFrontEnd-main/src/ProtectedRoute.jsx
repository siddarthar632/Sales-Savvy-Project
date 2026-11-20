import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, role, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <p>Loading application...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If route requires admin, redirect to admin login, otherwise to user login
    return <Navigate to={requiredRole === 'ADMIN' ? '/admin' : '/'} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'ADMIN' ? '/admindashboard' : '/customerhome'} replace />;
  }

  return children;
};
