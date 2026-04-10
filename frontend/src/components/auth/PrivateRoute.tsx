import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  // Agar token nahi hai, toh login par bhej do
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Agar role allowed nahi hai (e.g. Citizen trying to access Admin page)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;