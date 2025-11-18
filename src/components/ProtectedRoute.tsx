import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
  redirectTo?: string;
}

/**
 * Composant de protection de route qui vérifie l'authentification et les rôles
 * @param children - Le contenu à afficher si l'utilisateur est autorisé
 * @param requiredRole - Le rôle requis pour accéder à la route (optionnel)
 * @param redirectTo - L'URL vers laquelle rediriger si non autorisé (par défaut: '/login')
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, currentUser, isLoading } = useAuth();

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Vérifier si l'utilisateur est authentifié
  if (!isAuthenticated || !currentUser) {
    console.warn('ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to={redirectTo} replace />;
  }

  // Vérifier le rôle si requis
  if (requiredRole && currentUser.role !== requiredRole) {
    console.warn(`ProtectedRoute: User role '${currentUser.role}' does not match required role '${requiredRole}', redirecting to home`);
    return <Navigate to="/" replace />;
  }

  // L'utilisateur est autorisé, afficher le contenu
  return <>{children}</>;
};

/**
 * Composant spécifique pour protéger les routes admin
 */
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="admin" redirectTo="/">
      {children}
    </ProtectedRoute>
  );
};
