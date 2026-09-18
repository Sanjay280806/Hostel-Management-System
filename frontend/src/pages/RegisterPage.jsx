import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Hexagon, AlertCircle, UserCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Student',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const validate = () => {
    if (!formData.email || !formData.password) {
      return 'Email and password are required.';
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await register(formData.email, formData.password, formData.role);
      if (data.success) {
        const roleRedirects = {
          Admin: '/dashboard/admin',
          Warden: '/dashboard/warden',
          Student: '/dashboard/student',
          Guest: '/notices',
        };
        navigate(roleRedirects[data.user.role] || '/dashboard', { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
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
        style={{ maxWidth: '480px' }}
      >
        <div className="auth-header">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'var(--color-primary)', boxShadow: '0 8px 32px var(--color-primary-glow)' }}>
              <Hexagon size={28} className="text-white fill-current" />
            </div>
          </div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join HostelOps</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 p-3 mb-6 rounded-lg text-sm"
            style={{ background: 'var(--color-error-light)', borderColor: 'rgba(248, 113, 113, 0.2)', color: 'var(--color-error)', border: '1px solid' }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" id="register-form" noValidate>
          <div className="ui-input-container">
            <label htmlFor="register-email" className="ui-label">Email address</label>
            <div className="ui-input-wrapper">
              <Mail className="ui-input-icon" size={18} />
              <input
                id="register-email"
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
            <label htmlFor="register-role" className="ui-label">Account type</label>
            <div className="ui-input-wrapper">
              <UserCircle className="ui-input-icon" size={18} />
              <select
                id="register-role"
                name="role"
                className="ui-select ui-input-with-icon"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Student">Student</option>
                <option value="Guest">Guest</option>
              </select>
            </div>
          </div>

          <div className="ui-input-container">
            <label htmlFor="register-password" className="ui-label">Password</label>
            <div className="ui-input-wrapper">
              <Lock className="ui-input-icon" size={18} />
              <input
                id="register-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="ui-input ui-input-with-icon"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                className="absolute right-3 text-slate-400 hover:text-white transition-colors"
                onClick={() => setShowPassword((p) => !p)}
                style={{ position: 'absolute', right: '0.75rem', color: 'var(--color-text-muted)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="ui-input-container">
            <label htmlFor="register-confirm-password" className="ui-label">Confirm password</label>
            <div className="ui-input-wrapper">
              <CheckCircle2 className="ui-input-icon" size={18} />
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                className="ui-input ui-input-with-icon"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            className="ui-btn ui-btn-primary ui-btn-lg w-full mt-2"
            disabled={isLoading}
            style={{ width: '100%' }}
          >
            {isLoading ? <span className="ui-spinner ui-spinner-sm" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" id="login-link" className="auth-link">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
