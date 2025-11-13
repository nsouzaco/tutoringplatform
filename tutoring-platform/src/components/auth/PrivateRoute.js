import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children, requireRole = null }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentUser || !userData) {
    return <Navigate to="/login" />;
  }

  if (requireRole && userData.role !== requireRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PrivateRoute;




