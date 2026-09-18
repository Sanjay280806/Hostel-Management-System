import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Users, Home, ArrowRightLeft, 
  Wallet, AlertCircle, UserCheck, CalendarCheck, 
  Bell, LogOut, Hexagon 
} from 'lucide-react';

const navSections = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', to: '/dashboard/admin', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Hostel Operations',
    items: [
      { label: 'Students', to: '/dashboard/admin/students', icon: Users },
      { label: 'Rooms', to: '/dashboard/admin/rooms', icon: Home },
      { label: 'Allocations', to: '/dashboard/admin/allocations', icon: ArrowRightLeft },
    ]
  },
  {
    title: 'Finance',
    items: [
      { label: 'Fees', to: '/dashboard/admin/fees', icon: Wallet },
    ]
  },
  {
    title: 'Management',
    items: [
      { label: 'Complaints', to: '/dashboard/admin/complaints', icon: AlertCircle },
      { label: 'Visitors', to: '/dashboard/admin/visitors', icon: UserCheck },
      { label: 'Attendance', to: '/dashboard/admin/attendance', icon: CalendarCheck },
      { label: 'Notices', to: '/dashboard/admin/notices', icon: Bell },
    ]
  }
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Hexagon size={18} className="fill-current text-white" />
        </div>
        <div>
          <div className="sidebar-brand-name">HOSTELOPS</div>
          <div className="text-xs text-gray-500 font-medium tracking-wider uppercase mt-0.5">Hostel Management</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.title} className="mb-4">
            <h3 className="sidebar-section-title">{section.title}</h3>
            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/dashboard/admin'}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                    }
                  >
                    <Icon size={18} strokeWidth={2.5} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-details">
            <p className="sidebar-user-email">{user?.email?.split('@')[0]}</p>
            <p className="sidebar-user-role">{user?.role || 'Admin'}</p>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout} title="Logout">
          <LogOut size={18} strokeWidth={2} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
