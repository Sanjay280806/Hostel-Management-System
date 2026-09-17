import { useState, useEffect, useCallback } from 'react';
import { allocationService } from '../../services/allocationService';
import { studentService } from '../../services/studentService';
import { roomService } from '../../services/roomService';

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

const AllocationsPage = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Active');
  const [modal, setModal] = useState(null);
  const [selectedAlloc, setSelectedAlloc] = useState(null);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ studentId: '', roomId: '', startDate: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAllocations = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await allocationService.getAll(statusFilter ? { status: statusFilter } : {});
      setAllocations(data.data);
    } catch {
      showToast('Failed to fetch allocations.', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchAllocations(); }, [fetchAllocations]);

  const openAssign = async () => {
    setForm({ studentId: '', roomId: '', startDate: new Date().toISOString().split('T')[0] });
    setFormError('');
    setModal('assign');
    // Load students + available rooms for dropdowns
    try {
      const [sRes, rRes] = await Promise.all([
        studentService.getAll({ limit: 200 }),
        roomService.getAll({ status: 'Available' }),
      ]);
      setStudents(sRes.data.data);
      setRooms(rRes.data.data);
    } catch {
      showToast('Failed to load students/rooms.', 'error');
    }
  };

  const openVacate = (alloc) => { setSelectedAlloc(alloc); setModal('vacate'); };
  const closeModal = () => { setModal(null); setSelectedAlloc(null); };

  const handleFormChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (formError) setFormError('');
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.roomId) {
      setFormError('Please select a student and a room.'); return;
    }
    setFormLoading(true);
    try {
      await allocationService.allocate({
        studentId: form.studentId,
        roomId: form.roomId,
        startDate: form.startDate,
      });
      showToast('Room allocated successfully!');
      closeModal();
      fetchAllocations();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Allocation failed.');
    } finally { setFormLoading(false); }
  };

  const handleVacate = async () => {
    try {
      await allocationService.vacate(selectedAlloc._id);
      showToast('Room vacated successfully.');
      closeModal();
      fetchAllocations();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to vacate.', 'error');
      closeModal();
    }
  };

  const activeCount = allocations.filter((a) => a.status === 'Active').length;

  return (
    <div className="page">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Room Allocations</h1>
          <p className="page-subtitle">Assign and manage student room allocations</p>
        </div>
        <button className="btn-primary btn-sm" onClick={openAssign} id="assign-room-btn">
          + Assign Room
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {[
          { value: 'Active', label: 'Active' },
          { value: 'Vacated', label: 'Vacated' },
          { value: '', label: 'All' },
        ].map((f) => (
          <button
            key={f.value}
            className={`filter-tab ${statusFilter === f.value ? 'filter-tab-active' : ''}`}
            onClick={() => setStatusFilter(f.value)}
            id={`alloc-filter-${f.label.toLowerCase()}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="table-card">
        {loading ? (
          <div className="table-loading"><div className="spinner" /></div>
        ) : allocations.length === 0 ? (
          <div className="table-empty">
            <div className="table-empty-icon">🗂️</div>
            <p>{statusFilter ? `No ${statusFilter} allocations found.` : 'No allocations yet.'}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No.</th>
                <th>Room</th>
                <th>Capacity</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((a) => (
                <tr key={a._id}>
                  <td className="td-bold">{a.studentId?.name ?? '—'}</td>
                  <td>{a.studentId?.rollNo ?? '—'}</td>
                  <td><span className="badge badge-indigo">{a.roomId?.roomNumber ?? '—'}</span></td>
                  <td className="td-muted">
                    {a.roomId ? `${a.roomId.occupiedCount}/${a.roomId.capacity}` : '—'}
                  </td>
                  <td className="td-muted">
                    {a.startDate ? new Date(a.startDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="td-muted">
                    {a.endDate ? new Date(a.endDate).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <span className={`badge ${a.status === 'Active' ? 'badge-green' : 'badge-gray'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>
                    {a.status === 'Active' && (
                      <button
                        className="btn-outline-danger btn-sm"
                        onClick={() => openVacate(a)}
                        id={`vacate-alloc-${a._id}`}
                      >
                        Vacate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Assign Modal */}
      {modal === 'assign' && (
        <Modal title="Assign Room to Student" onClose={closeModal}>
          <form onSubmit={handleAssign} id="assign-room-form">
            {formError && <div className="alert alert-error">{formError}</div>}
            <div className="form-group">
              <label className="form-label">Select Student</label>
              <select
                id="assign-studentId"
                name="studentId"
                className="form-input form-input-plain form-select"
                value={form.studentId}
                onChange={handleFormChange}
              >
                <option value="">— Choose a student —</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.rollNo})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Select Available Room</label>
              <select
                id="assign-roomId"
                name="roomId"
                className="form-input form-input-plain form-select"
                value={form.roomId}
                onChange={handleFormChange}
              >
                <option value="">— Choose a room —</option>
                {rooms.map((r) => (
                  <option key={r._id} value={r._id}>
                    Room {r.roomNumber} — {r.occupiedCount}/{r.capacity} beds
                  </option>
                ))}
              </select>
              {rooms.length === 0 && (
                <p className="form-hint">⚠ No available rooms. Add rooms or vacate existing allocations.</p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                id="assign-startDate"
                name="startDate"
                type="date"
                className="form-input form-input-plain"
                value={form.startDate}
                onChange={handleFormChange}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn-primary btn-sm" disabled={formLoading || rooms.length === 0} id="submit-assign-room">
                {formLoading ? 'Assigning…' : 'Assign Room'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Vacate Confirm */}
      {modal === 'vacate' && (
        <Modal title="Vacate Room" onClose={closeModal}>
          <p className="confirm-msg">
            Vacate <strong>{selectedAlloc?.studentId?.name}</strong> from room{' '}
            <strong>{selectedAlloc?.roomId?.roomNumber}</strong>? This will decrement the room's occupancy count.
          </p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={closeModal} id="vacate-cancel">Cancel</button>
            <button className="btn-danger" onClick={handleVacate} id="vacate-confirm">Confirm Vacate</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AllocationsPage;
