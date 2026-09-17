import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/Layout/AdminLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsPage from './pages/admin/StudentsPage';
import RoomsPage from './pages/admin/RoomsPage';
import AllocationsPage from './pages/admin/AllocationsPage';

import FeesPage from './pages/admin/FeesPage';
import ComplaintsPage from './pages/admin/ComplaintsPage';
import VisitorsPage from './pages/admin/VisitorsPage';
import AttendancePage from './pages/admin/AttendancePage';
import NoticeBoardPage from './pages/admin/NoticeBoardPage';

// ─── Placeholder pages (Phase 3+) ─────────────────────────────────────────────
const ComingSoon = ({ label }) => (
  <div style={{
    minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', gap: '1rem', color: '#94a3b8',
  }}>
    <div style={{ fontSize: '3rem' }}>🚧</div>
    <h2 style={{ color: '#a5b4fc', fontFamily: 'Inter, sans-serif' }}>{label}</h2>
    <p style={{ fontFamily: 'Inter, sans-serif' }}>Coming Soon</p>
  </div>
);

const UnauthorizedPage = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #0d0d1a 0%, #13131f 50%, #0f0f1f 100%)',
    color: '#e2e8f0', fontFamily: 'Inter, sans-serif', flexDirection: 'column',
  }}>
    <div style={{
      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: '16px', padding: '3rem', textAlign: 'center',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fca5a5' }}>Access Denied</h1>
      <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>You do not have permission to view this page.</p>
      <a href="/login" style={{ color: '#a5b4fc', textDecoration: 'underline', display: 'inline-block', marginTop: '1rem' }}>
        Return to Login
      </a>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// App – Main Router
// ─────────────────────────────────────────────────────────────────────────────
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* ── Admin Routes (Admin layout with sidebar) ── */}
          <Route element={<ProtectedRoute allowedRoles={['Admin', 'Warden']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              <Route path="/dashboard/admin/students" element={<StudentsPage />} />
              <Route path="/dashboard/admin/rooms" element={<RoomsPage />} />
              <Route path="/dashboard/admin/allocations" element={<AllocationsPage />} />
              <Route path="/dashboard/admin/fees" element={<FeesPage />} />
              <Route path="/dashboard/admin/complaints" element={<ComplaintsPage />} />
              
              <Route path="/dashboard/admin/visitors" element={<VisitorsPage />} />
              <Route path="/dashboard/admin/attendance" element={<AttendancePage />} />
              <Route path="/dashboard/admin/notices" element={<NoticeBoardPage />} />
            </Route>
          </Route>

          {/* ── Warden Routes (Phase 4) ── */}
          <Route element={<ProtectedRoute allowedRoles={['Warden']} />}>
            <Route path="/dashboard/warden" element={<ComingSoon label="Warden Dashboard" />} />
          </Route>

          {/* ── Student Routes (Phase 3) ── */}
          <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
            <Route path="/dashboard/student" element={<ComingSoon label="Student Dashboard" />} />
          </Route>

          {/* ── Any Authenticated User ── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/notices" element={<ComingSoon label="Notice Board" />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
