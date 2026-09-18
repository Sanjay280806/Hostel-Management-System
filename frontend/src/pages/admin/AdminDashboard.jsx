import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { roomService } from '../../services/roomService';
import { allocationService } from '../../services/allocationService';
import { motion } from 'framer-motion';
import { Users, Home, ClipboardList, Plus, ArrowRight, UserPlus, Info } from 'lucide-react';
import { PageHeader, StatCard, Card, Badge, Button } from '../../components/ui';

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
        const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
        const totalOccupied = rooms.reduce((acc, r) => acc + r.occupiedCount, 0);
        
        setStats({
          totalStudents: sRes.data.total,
          totalRooms: rooms.length,
          availableRooms: rooms.filter((r) => r.status === 'Available').length,
          activeAllocations: aRes.data.count,
          totalCapacity,
          totalOccupied,
          occupancyRate: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0
        });
      } catch {
        // Handle silently
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader 
        title="Dashboard"
        subtitle="Overview of hostel operations"
        action={<Badge variant="indigo">Administrator</Badge>}
      />

      {loading ? (
        <div className="dashboard-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="ui-stat-card bg-gray-50 border-gray-100" style={{ height: '110px' }} />
          ))}
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-6">
          
          {/* ROW 1: KPI */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <motion.div variants={itemVariants}>
              <Link to="/dashboard/admin/students">
                <StatCard title="Total Students" value={stats?.totalStudents ?? '0'} color="indigo" icon={Users} />
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link to="/dashboard/admin/rooms">
                <StatCard title="Total Rooms" value={stats?.totalRooms ?? '0'} color="violet" icon={Home} />
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link to="/dashboard/admin/rooms">
                <StatCard title="Occupancy" value={`${stats?.occupancyRate ?? 0}%`} color="emerald" icon={ClipboardList} />
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link to="/dashboard/admin/allocations">
                <StatCard title="Active Allocations" value={stats?.activeAllocations ?? '0'} color="info" icon={Users} />
              </Link>
            </motion.div>
          </div>

          {/* ROW 2: Quick Actions */}
          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4 mt-2">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { label: 'Register Student', to: '/dashboard/admin/students', icon: UserPlus },
                { label: 'Add New Room', to: '/dashboard/admin/rooms', icon: Plus },
                { label: 'Assign Room', to: '/dashboard/admin/allocations', icon: ArrowRight },
              ].map((action) => (
                <Link key={action.label} to={action.to} className="block">
                  <Card hover className="flex items-center gap-4 p-4 border border-gray-200 shadow-sm bg-white hover:border-indigo-200 group">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <action.icon size={18} />
                    </div>
                    <span className="font-semibold text-gray-700 text-sm">{action.label}</span>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>

        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
