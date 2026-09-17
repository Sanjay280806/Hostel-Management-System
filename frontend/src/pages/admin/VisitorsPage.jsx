import { useState, useEffect, useCallback } from 'react';
import { visitorService } from '../../services/visitorService';
import { studentService } from '../../services/studentService';

const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2 className="modal-title">{title}</h2>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="modal-body">{children}</div>
    </div>
  </div>
);

const VisitorsPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  const [modal, setModal] = useState(null);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [students, setStudents] = useState([]);
  
  const [form, setForm] = useState({ studentId: '', visitorName: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await visitorService.getAll(statusFilter ? { status: statusFilter } : {});
      setVisitors(data.data);
    } catch {
      showToast('Failed to fetch visitors.', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchVisitors(); }, [fetchVisitors]);

  const openAdd = async () => {
    setForm({ studentId: '', visitorName: '' });
    setFormError('');
    setModal('add');
    try {
      const res = await studentService.getAll({ limit: 200 });
      setStudents(res.data.data);
    } catch {
      showToast('Failed to fetch students.', 'error');
    }
  };

  const openCheckout = (visitor) => {
    setSelectedVisitor(visitor);
    setModal('checkout');
  };

  const closeModal = () => { setModal(null); setSelectedVisitor(null); };

  const handleFormChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (formError) setFormError('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.visitorName) {
      setFormError('All fields are required.'); return;
    }
    setFormLoading(true);
    try {
      await visitorService.checkIn(form);
      showToast('Visitor checked in.');
      closeModal();
      fetchVisitors();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to check in visitor.');
    } finally { setFormLoading(false); }
  };

  const handleCheckout = async () => {
    try {
      await visitorService.checkOut(selectedVisitor._id);
      showToast('Visitor checked out.');
      closeModal();
      fetchVisitors();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to check out.', 'error');
      closeModal();
    }
  };

  return (
    <div className="page">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Visitor Logs</h1>
          <p className="page-subtitle">Track incoming and outgoing hostel visitors</p>
        </div>
        <button className="btn-primary btn-sm" onClick={openAdd}>
          + Check-In Visitor
        </button>
      </div>

      <div className="filter-tabs">
        {[
          { value: '', label: 'All Visitors' },
          { value: 'In', label: 'Currently In' },
          { value: 'Out', label: 'Checked Out' }
        ].map((f) => (
          <button
            key={f.value}
            className={`filter-tab ${statusFilter === f.value ? 'filter-tab-active' : ''}`}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="table-card">
        {loading ? (
          <div className="table-loading"><div className="spinner" /></div>
        ) : visitors.length === 0 ? (
          <div className="table-empty">
            <div className="table-empty-icon">👥</div>
            <p>{statusFilter ? `No ${statusFilter} visitors found.` : 'No visitors logged yet.'}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Visitor Name</th>
                <th>Visiting Student</th>
                <th>Check-In Time</th>
                <th>Check-Out Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <tr key={v._id}>
                  <td className="td-bold">{v.visitorName}</td>
                  <td className="td-bold">
                    {v.studentId?.name} <br/>
                    <span className="td-muted" style={{fontSize: '0.8rem'}}>Room: {v.studentId?.roomNumber || 'N/A'}</span>
                  </td>
                  <td className="td-muted">{new Date(v.checkIn).toLocaleString()}</td>
                  <td className="td-muted">
                    {v.checkOut ? new Date(v.checkOut).toLocaleString() : '—'}
                  </td>
                  <td>
                    <span className={`badge ${v.status === 'In' ? 'badge-amber' : 'badge-gray'}`}>
                      {v.status}
                    </span>
                  </td>
                  <td>
                    {v.status === 'In' && (
                      <button className="btn-outline-danger btn-sm" onClick={() => openCheckout(v)} style={{borderColor: '#8b5cf6', color: '#8b5cf6'}}>
                        Check Out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal === 'add' && (
        <Modal title="Check-In Visitor" onClose={closeModal}>
          <form onSubmit={handleCreate}>
            {formError && <div className="alert alert-error">{formError}</div>}
            
            <div className="form-group">
              <label className="form-label">Visitor Name</label>
              <input
                name="visitorName"
                type="text"
                className="form-input form-input-plain"
                placeholder="e.g. John Doe"
                value={form.visitorName}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Visiting Student</label>
              <select
                name="studentId"
                className="form-input form-input-plain form-select"
                value={form.studentId}
                onChange={handleFormChange}
              >
                <option value="">— Select Student —</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.rollNo})
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn-primary btn-sm" disabled={formLoading}>
                {formLoading ? 'Saving…' : 'Check In'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'checkout' && (
        <Modal title="Check-Out Visitor" onClose={closeModal}>
          <p className="confirm-msg">
            Are you sure you want to check out <strong>{selectedVisitor?.visitorName}</strong>? <br/>
            This will record the current time as the check-out time.
          </p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={closeModal}>Cancel</button>
            <button className="btn-primary btn-sm" onClick={handleCheckout}>Confirm Check-Out</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default VisitorsPage;
