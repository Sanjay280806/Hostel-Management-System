import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';

const AdminLayout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Breadcrumbs based on path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathParts.length > 2 
    ? pathParts[pathParts.length - 1].charAt(0).toUpperCase() + pathParts[pathParts.length - 1].slice(1)
    : 'Overview';

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <header className="admin-header">
          <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-gray-900">{breadcrumb}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">{greeting}, <span className="font-semibold text-gray-900">{user?.email?.split('@')[0]}</span></span>
          </div>
        </header>
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
