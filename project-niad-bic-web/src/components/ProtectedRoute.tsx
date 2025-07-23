import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Save the current location they were trying to go to when they were
    // redirected. This allows us to send them along to that page after they
    // login, which is a nicer user experience than dropping them off on the
    // home page.
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
