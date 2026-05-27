/**
 * Protected Route Component
 */

import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'seller';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole && user) {
    if (requiredRole === 'admin' && user.role !== UserRole.ADMIN) {
      return <Navigate to="/" replace />;
    }
    
    if (requiredRole === 'seller' && user.role !== UserRole.SELLER && user.role !== UserRole.ADMIN) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
