import { useState, useEffect } from 'react';
import { noticeService } from '../../services/noticeService';
import { useAuth } from '../../context/AuthContext';

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

const NoticeBoardPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [modal, setModal] = useState(null);
  const [selectedNotice, setSelectedNotice] = useState(null);
  
  const [form, setForm] = useState({ title: '', content: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const { data } = await noticeService.getAll();
      setNotices(data.data);
    } catch {
      showToast('Failed to fetch notices.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotices(); }, []);

  const openAdd = () => {
    setForm({ title: '', content: '' });
    setFormError('');
    setModal('add');
  };

  const openDelete = (notice) => {
    setSelectedNotice(notice);
    setModal('delete');
  };

  const closeModal = () => { setModal(null); setSelectedNotice(null); };

  const handleFormChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (formError) setFormError('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      setFormError('Title and content are required.'); return;
    }
    setFormLoading(true);
    try {
      await noticeService.create(form);
      showToast('Notice posted successfully.');
      closeModal();
      fetchNotices();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to post notice.');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await noticeService.delete(selectedNotice._id);
      showToast('Notice deleted.');
      closeModal();
      fetchNotices();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete notice.', 'error');
      closeModal();
    }
  };

  return (
    <div className="page">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Notice Board</h1>
          <p className="page-subtitle">Announcements and important updates</p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Warden') && (
          <button className="btn-primary btn-sm" onClick={openAdd}>
            + Post Notice
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
      ) : notices.length === 0 ? (
        <div className="table-card table-empty">
          <div className="table-empty-icon">📢</div>
          <p>No notices posted yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notices.map((n) => (
            <div key={n._id} className="table-card" style={{ padding: '1.5rem', marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>{n.title}</h3>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    <span>Posted by {n.postedBy?.role || 'Admin'}</span>
                    <span>•</span>
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {user?.role === 'Admin' && (
                  <button className="btn-icon btn-icon-delete" onClick={() => openDelete(n)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                )}
              </div>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {n.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {modal === 'add' && (
        <Modal title="Post New Notice" onClose={closeModal}>
          <form onSubmit={handleCreate}>
            {formError && <div className="alert alert-error">{formError}</div>}
            
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                name="title"
                type="text"
                className="form-input form-input-plain"
                placeholder="e.g. Maintenance Scheduled for Sunday"
                value={form.title}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea
                name="content"
                rows="5"
                className="form-input form-input-plain"
                placeholder="Detailed information..."
                value={form.content}
                onChange={handleFormChange}
                style={{resize: 'vertical', paddingTop: '0.75rem'}}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn-primary btn-sm" disabled={formLoading}>
                {formLoading ? 'Posting…' : 'Post Notice'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal title="Delete Notice" onClose={closeModal}>
          <p className="confirm-msg">
            Are you sure you want to delete the notice <strong>{selectedNotice?.title}</strong>? <br/>
            This action cannot be undone.
          </p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={closeModal}>Cancel</button>
            <button className="btn-danger btn-sm" onClick={handleDelete}>Delete Notice</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default NoticeBoardPage;
