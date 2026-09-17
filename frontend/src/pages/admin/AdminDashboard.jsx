import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { roomService } from '../../services/roomService';
import { allocationService } from '../../services/allocationService';

const StatCard = ({ label, value, icon, color, to }) => (
  <Link to={to} className={`dashboard-stat-card dashboard-stat-${color}`}>
    <div className="dashboard-stat-icon">{icon}</div>
    <div>
      <p className="dashboard-stat-value">{value ?? '—'}</p>
      <p className="dashboard-stat-label">{label}</p>
    </div>
  </Link>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, rRes, aRes] = await Promise.all([
          studentService.getAll({ limit: 1 }),
          roomService.getAll(),
          allocationService.getAll({ status: 'Active' }),
        ]);
        const rooms = rRes.data.data;
        setStats({
          totalStudents: sRes.data.total,
          totalRooms: rooms.length,
          availableRooms: rooms.filter((r) => r.status === 'Available').length,
          activeAllocations: aRes.data.count,
        });
      } catch {
        // non-fatal — show skeleton
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page">
      {/* Welcome Banner */}
      <div className="dashboard-banner">
        <div>
          <h1 className="dashboard-greeting">{greeting}, {user?.email?.split('@')[0]} 👋</h1>
          <p className="dashboard-sub">Here's an overview of the hostel system</p>
        </div>
        <div className="dashboard-badge">
          <span className="badge badge-indigo">Admin</span>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="dashboard-stat-card skeleton" />
          ))
        ) : (
          <>
            <StatCard label="Total Students" value={stats?.totalStudents} color="indigo"
              to="/dashboard/admin/students"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}
            />
            <StatCard label="Total Rooms" value={stats?.totalRooms} color="violet"
              to="/dashboard/admin/rooms"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>}
            />
            <StatCard label="Available Rooms" value={stats?.availableRooms} color="green"
              to="/dashboard/admin/rooms"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>}
            />
            <StatCard label="Active Allocations" value={stats?.activeAllocations} color="amber"
              to="/dashboard/admin/allocations"
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
            />
          </>
        )}
      </div>

      {/* Quick Links */}
      <div className="quick-links-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-links-grid">
          {[
            { label: 'Add Student', to: '/dashboard/admin/students', desc: 'Register a new student and create their account' },
            { label: 'Add Room', to: '/dashboard/admin/rooms', desc: 'Add a new room to the hostel inventory' },
            { label: 'Assign Room', to: '/dashboard/admin/allocations', desc: 'Allocate an available room to a student' },
          ].map((ql) => (
            <Link key={ql.to} to={ql.to} className="quick-link-card">
              <p className="quick-link-label">{ql.label}</p>
              <p className="quick-link-desc">{ql.desc}</p>
              <span className="quick-link-arrow">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
