import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Hexagon, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await login(formData.email, formData.password);
      if (data.success) {
        const roleRedirects = {
          Admin: '/dashboard/admin',
          Warden: '/dashboard/warden',
          Student: '/dashboard/student',
          Guest: '/notices',
        };
        navigate(roleRedirects[data.user.role] || from, { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="auth-card"
      >
        <div className="auth-header">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'var(--color-primary)' }}>
              <Hexagon size={28} className="text-white fill-current" />
            </div>
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to HostelOps</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 p-3 mb-6 rounded-lg text-sm"
            style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" id="login-form">
          <div className="ui-input-container">
            <label htmlFor="login-email" className="ui-label">Email address</label>
            <div className="ui-input-wrapper">
              <Mail className="ui-input-icon" size={18} />
              <input
                id="login-email"
                name="email"
                type="email"
                className="ui-input ui-input-with-icon"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="ui-input-container">
            <label htmlFor="login-password" className="ui-label">Password</label>
            <div className="ui-input-wrapper">
              <Lock className="ui-input-icon" size={18} />
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="ui-input ui-input-with-icon"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{ position: 'absolute', right: '0.75rem', color: 'var(--color-text-muted)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="ui-btn ui-btn-primary ui-btn-lg mt-4"
            disabled={isLoading}
            style={{ width: '100%' }}
          >
            {isLoading ? <span className="ui-spinner ui-spinner-sm" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link to="/register" id="register-link" className="auth-link">
            Create account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
