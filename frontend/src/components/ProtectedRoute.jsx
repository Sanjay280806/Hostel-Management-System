import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute
 * Wraps routes that require authentication (and optionally specific roles).
 *
 * Props:
 *  - allowedRoles: string[] — if provided, only these roles can access the route.
 *    If empty/undefined, any authenticated user can access.
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute allowedRoles={['Admin', 'Warden']} />}>
 *     <Route path="/dashboard" element={<AdminDashboard />} />
 *   </Route>
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // While auth state is being restored from localStorage, render nothing
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  // Not authenticated → redirect to login, preserving intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check: if allowedRoles specified, verify user has permission
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized → render the child route
  return <Outlet />;
};

export default ProtectedRoute;
