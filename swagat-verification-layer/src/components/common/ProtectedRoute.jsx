import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated } = useSelector(state => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    switch (user.role) {
      case 'citizen': return <Navigate to="/citizen/dashboard" replace />;
      case 'department': return <Navigate to="/department/dashboard" replace />;
      case 'field': return <Navigate to="/field/tasks" replace />;
      case 'collector': return <Navigate to="/collector/dashboard" replace />;
      default: return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
