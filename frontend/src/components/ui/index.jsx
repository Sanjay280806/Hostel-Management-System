import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

export const Card = ({ children, className = '', noPadding = false, hover = false }) => (
  <div className={`ui-card ${noPadding ? 'p-0' : 'p-5'} ${hover ? 'ui-card-hover' : ''} ${className}`}>
    {children}
  </div>
);

export const PageHeader = ({ title, subtitle, action, icon: Icon }) => (
  <div className="ui-page-header">
    <div className="ui-page-header-content">
      {Icon && <div className="ui-page-header-icon"><Icon size={20} /></div>}
      <div>
        <h1 className="ui-page-title">{title}</h1>
        {subtitle && <p className="ui-page-subtitle">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="ui-page-header-action">{action}</div>}
  </div>
);

export const Button = ({ 
  children, onClick, variant = 'primary', size = 'md', 
  icon: Icon, disabled = false, loading = false, className = '', type = 'button' 
}) => {
  return (
    <button 
      type={type}
      className={`ui-btn ui-btn-${variant} ui-btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="ui-spinner ui-spinner-sm" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 16 : 18} />
      ) : null}
      {children && <span>{children}</span>}
    </button>
  );
};

export const Badge = ({ children, variant = 'gray', className = '' }) => (
  <span className={`ui-badge ui-badge-${variant} ${className}`}>
    {children}
  </span>
);

export const Input = React.forwardRef(({ 
  label, icon: Icon, error, className = '', containerClassName = '', ...props 
}, ref) => (
  <div className={`ui-input-container ${containerClassName}`}>
    {label && <label className="ui-label">{label}</label>}
    <div className="ui-input-wrapper">
      {Icon && <Icon className="ui-input-icon" size={18} />}
      <input 
        ref={ref}
        className={`ui-input ${Icon ? 'ui-input-with-icon' : ''} ${error ? 'ui-input-error' : ''} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="ui-error-text">{error}</p>}
  </div>
));
Input.displayName = 'Input';

export const Select = React.forwardRef(({ 
  label, options, error, className = '', containerClassName = '', ...props 
}, ref) => (
  <div className={`ui-input-container ${containerClassName}`}>
    {label && <label className="ui-label">{label}</label>}
    <select 
      ref={ref}
      className={`ui-select ${error ? 'ui-input-error' : ''} ${className}`}
      {...props}
    >
      <option value="" disabled hidden>Select an option</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="ui-error-text">{error}</p>}
  </div>
));
Select.displayName = 'Select';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'md' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="ui-modal-portal">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ui-modal-overlay"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className={`ui-modal-content ui-modal-${maxWidth}`}
          >
            <div className="ui-modal-header">
              <h2 className="ui-modal-title">{title}</h2>
              <button onClick={onClose} className="ui-modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="ui-modal-body">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const Table = ({ columns, data = [], keyField, emptyMessage = "No data found", loading = false }) => {
  if (loading) {
    return (
      <div className="ui-table-container">
        <div className="ui-table-loading">
          <div className="ui-spinner" />
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  const rows = Array.isArray(data) ? data : [];

  return (
    <div className="ui-table-container">
      <table className="ui-table">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={{ width: col.width, textAlign: col.align || 'left' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="ui-table-empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <motion.tr 
                key={row[keyField] || rowIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(rowIndex * 0.05, 0.5) }}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} style={{ textAlign: col.align || 'left' }}>
                    {col.render ? col.render(row) : row[col.field]}
                  </td>
                ))}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export const StatCard = ({ title, value, icon: Icon, trend, color = 'indigo' }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className={`ui-stat-card ui-stat-${color}`}
  >
    <div className="ui-stat-header">
      <p className="ui-stat-title">{title}</p>
      <div className="ui-stat-icon-wrapper">
        {Icon && <Icon size={18} />}
      </div>
    </div>
    <div className="ui-stat-body">
      <h3 className="ui-stat-value">{value}</h3>
      {trend && (
        <span className={`ui-stat-trend ${trend > 0 ? 'trend-up' : 'trend-down'}`}>
          {trend > 0 ? '+' : ''}{trend}% from last month
        </span>
      )}
    </div>
  </motion.div>
);
