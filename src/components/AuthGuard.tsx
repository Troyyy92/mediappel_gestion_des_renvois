import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '@/hooks/use-auth';
import { RefreshCw } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-3 text-gray-600">Chargement de la session...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect unauthenticated users to the login page
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;