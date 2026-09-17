import { useState, useEffect, useCallback } from 'react';
import { complaintService } from '../../services/complaintService';
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

const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  const [modal, setModal] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [students, setStudents] = useState([]);
  
  const [form, setForm] = useState({ studentId: '', title: '', description: '' });
  const [statusForm, setStatusForm] = useState({ status: '', assignedTo: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await complaintService.getAll(statusFilter ? { status: statusFilter } : {});
      setComplaints(data.data);
    } catch {
      showToast('Failed to fetch complaints.', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const openAdd = async () => {
    setForm({ studentId: '', title: '', description: '' });
    setFormError('');
    setModal('add');
    try {
      const res = await studentService.getAll({ limit: 200 });
      setStudents(res.data.data);
    } catch {
      showToast('Failed to fetch students.', 'error');
    }
  };

  const openUpdate = (complaint) => {
    setSelectedComplaint(complaint);
    setStatusForm({
      status: complaint.status,
      assignedTo: complaint.assignedTo || ''
    });
    setFormError('');
    setModal('update');
  };

  const closeModal = () => { setModal(null); setSelectedComplaint(null); };

  const handleFormChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (formError) setFormError('');
  };
  
  const handleStatusFormChange = (e) => {
    setStatusForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (formError) setFormError('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.title || !form.description) {
      setFormError('All fields are required.'); return;
    }
    setFormLoading(true);
    try {
      await complaintService.create({
        studentId: form.studentId,
        title: form.title,
        description: form.description
      });
      showToast('Complaint registered.');
      closeModal();
      fetchComplaints();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create complaint.');
    } finally { setFormLoading(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await complaintService.update(selectedComplaint._id, statusForm);
      showToast('Complaint status updated.');
      closeModal();
      fetchComplaints();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update complaint.');
    } finally { setFormLoading(false); }
  };

  return (
    <div className="page">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Complaint Tracking</h1>
          <p className="page-subtitle">Manage student issues and maintenance requests</p>
        </div>
        <button className="btn-primary btn-sm" onClick={openAdd}>
          + Log Complaint
        </button>
      </div>

      <div className="filter-tabs">
        {[
          { value: '', label: 'All Complaints' },
          { value: 'Pending', label: 'Pending' },
          { value: 'In-Progress', label: 'In-Progress' },
          { value: 'Resolved', label: 'Resolved' }
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
        ) : complaints.length === 0 ? (
          <div className="table-empty">
            <div className="table-empty-icon">🛠️</div>
            <p>{statusFilter ? `No ${statusFilter} complaints found.` : 'No complaints registered yet.'}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Title</th>
                <th>Description</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id}>
                  <td className="td-muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="td-bold">
                    {c.studentId?.name} <br/>
                    <span className="td-muted" style={{fontSize: '0.8rem'}}>{c.studentId?.rollNo}</span>
                  </td>
                  <td className="td-bold">{c.title}</td>
                  <td className="td-muted" style={{maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {c.description}
                  </td>
                  <td className="td-muted">{c.assignedTo || 'Unassigned'}</td>
                  <td>
                    <span className={`badge ${
                      c.status === 'Resolved' ? 'badge-green' : 
                      c.status === 'In-Progress' ? 'badge-indigo' : 'badge-amber'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-outline-danger btn-sm" onClick={() => openUpdate(c)} style={{borderColor: '#6366f1', color: '#8b5cf6'}}>
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal === 'add' && (
        <Modal title="Log New Complaint" onClose={closeModal}>
          <form onSubmit={handleCreate}>
            {formError && <div className="alert alert-error">{formError}</div>}
            
            <div className="form-group">
              <label className="form-label">Student</label>
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

            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                name="title"
                type="text"
                className="form-input form-input-plain"
                placeholder="e.g. Broken window"
                value={form.title}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                rows="3"
                className="form-input form-input-plain"
                placeholder="Provide details about the issue..."
                value={form.description}
                onChange={handleFormChange}
                style={{resize: 'vertical', paddingTop: '0.75rem'}}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn-primary btn-sm" disabled={formLoading}>
                {formLoading ? 'Submitting…' : 'Submit Complaint'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'update' && (
        <Modal title="Update Complaint Status" onClose={closeModal}>
          <form onSubmit={handleUpdate}>
            {formError && <div className="alert alert-error">{formError}</div>}
            
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-input form-input-plain form-select"
                value={statusForm.status}
                onChange={handleStatusFormChange}
              >
                <option value="Pending">Pending</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned To (Staff Name)</label>
              <input
                name="assignedTo"
                type="text"
                className="form-input form-input-plain"
                placeholder="e.g. John Doe (Maintenance)"
                value={statusForm.assignedTo}
                onChange={handleStatusFormChange}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn-primary btn-sm" disabled={formLoading}>
                {formLoading ? 'Saving…' : 'Update Status'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ComplaintsPage;
