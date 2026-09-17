import { useState, useEffect, useCallback } from 'react';
import { studentService } from '../../services/studentService';

// ─── Reusable Modal ───────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2 className="modal-title">{title}</h2>
        <button className="modal-close" onClick={onClose} id="modal-close-btn">✕</button>
      </div>
      <div className="modal-body">{children}</div>
    </div>
  </div>
);

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <Modal title="Confirm Action" onClose={onCancel}>
    <p className="confirm-msg">{message}</p>
    <div className="modal-actions">
      <button className="btn-ghost" onClick={onCancel} id="confirm-cancel-btn">Cancel</button>
      <button className="btn-danger" onClick={onConfirm} id="confirm-delete-btn">Delete</button>
    </div>
  </Modal>
);

const INITIAL_FORM = { name: '', contact: '', rollNo: '', email: '', password: '' };

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'delete'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await studentService.getAll({ search, page, limit: 8 });
      setStudents(data.data);
      setPagination({ total: data.total, pages: data.pages });
    } catch {
      showToast('Failed to fetch students.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // Debounced search reset page
  useEffect(() => { setPage(1); }, [search]);

  const openAdd = () => { setForm(INITIAL_FORM); setFormError(''); setModal('add'); };
  const openEdit = (s) => {
    setSelectedStudent(s);
    setForm({ name: s.name, contact: s.contact, rollNo: s.rollNo, email: '', password: '' });
    setFormError('');
    setModal('edit');
  };
  const openDelete = (s) => { setSelectedStudent(s); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelectedStudent(null); };

  const handleFormChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (formError) setFormError('');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.contact || !form.rollNo || !form.email || !form.password) {
      setFormError('All fields are required.'); return;
    }
    setFormLoading(true);
    try {
      await studentService.create(form);
      showToast('Student created successfully!');
      closeModal();
      fetchStudents();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create student.');
    } finally { setFormLoading(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await studentService.update(selectedStudent._id, {
        name: form.name,
        contact: form.contact,
        rollNo: form.rollNo,
      });
      showToast('Student updated successfully!');
      closeModal();
      fetchStudents();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update student.');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await studentService.delete(selectedStudent._id);
      showToast('Student deleted.');
      closeModal();
      fetchStudents();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete.', 'error');
      closeModal();
    }
  };

  return (
    <div className="page">
      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">Manage all registered students</p>
        </div>
        <button className="btn-primary btn-sm" onClick={openAdd} id="add-student-btn">
          + Add Student
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar-wrap">
        <div className="search-bar">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="student-search-input"
            type="text"
            className="search-input"
            placeholder="Search by name, roll number or student ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        {loading ? (
          <div className="table-loading"><div className="spinner" /></div>
        ) : students.length === 0 ? (
          <div className="table-empty">
            <div className="table-empty-icon">👥</div>
            <p>{search ? 'No students match your search.' : 'No students yet. Click "Add Student" to begin.'}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Roll No.</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td><span className="badge badge-indigo">{s.studentId}</span></td>
                  <td className="td-bold">{s.name}</td>
                  <td>{s.rollNo}</td>
                  <td>{s.contact}</td>
                  <td className="td-muted">{s.userId?.email}</td>
                  <td className="td-muted">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="btn-icon btn-icon-edit"
                        onClick={() => openEdit(s)}
                        title="Edit student"
                        id={`edit-student-${s._id}`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="btn-icon btn-icon-delete"
                        onClick={() => openDelete(s)}
                        title="Delete student"
                        id={`delete-student-${s._id}`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="pagination">
          <span className="pagination-info">
            Showing page {page} of {pagination.pages} ({pagination.total} total)
          </span>
          <div className="pagination-btns">
            <button
              className="btn-ghost btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              id="prev-page-btn"
            >← Prev</button>
            <button
              className="btn-ghost btn-sm"
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              id="next-page-btn"
            >Next →</button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {modal === 'add' && (
        <Modal title="Add New Student" onClose={closeModal}>
          <form onSubmit={handleAdd} id="add-student-form">
            {formError && <div className="alert alert-error">{formError}</div>}
            {[
              { name: 'name', label: 'Full Name', placeholder: 'e.g. Samuthrika Shree S', type: 'text' },
              { name: 'rollNo', label: 'Roll Number', placeholder: 'e.g. 24BCS237', type: 'text' },
              { name: 'contact', label: 'Contact Number', placeholder: 'e.g. 9876543210', type: 'text' },
              { name: 'email', label: 'Email Address', placeholder: 'student@kct.ac.in', type: 'email' },
              { name: 'password', label: 'Initial Password', placeholder: 'Min. 6 characters', type: 'password' },
            ].map((f) => (
              <div className="form-group" key={f.name}>
                <label className="form-label">{f.label}</label>
                <input
                  id={`add-${f.name}`}
                  name={f.name}
                  type={f.type}
                  className="form-input form-input-plain"
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={handleFormChange}
                />
              </div>
            ))}
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn-primary btn-sm" disabled={formLoading} id="submit-add-student">
                {formLoading ? 'Creating…' : 'Create Student'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {modal === 'edit' && (
        <Modal title="Edit Student" onClose={closeModal}>
          <form onSubmit={handleEdit} id="edit-student-form">
            {formError && <div className="alert alert-error">{formError}</div>}
            {[
              { name: 'name', label: 'Full Name', type: 'text' },
              { name: 'rollNo', label: 'Roll Number', type: 'text' },
              { name: 'contact', label: 'Contact Number', type: 'text' },
            ].map((f) => (
              <div className="form-group" key={f.name}>
                <label className="form-label">{f.label}</label>
                <input
                  id={`edit-${f.name}`}
                  name={f.name}
                  type={f.type}
                  className="form-input form-input-plain"
                  value={form[f.name]}
                  onChange={handleFormChange}
                />
              </div>
            ))}
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn-primary btn-sm" disabled={formLoading} id="submit-edit-student">
                {formLoading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      {modal === 'delete' && (
        <ConfirmDialog
          message={`Delete student "${selectedStudent?.name}" (${selectedStudent?.rollNo})? This will also remove their login account.`}
          onConfirm={handleDelete}
          onCancel={closeModal}
        />
      )}
    </div>
  );
};

export default StudentsPage;
