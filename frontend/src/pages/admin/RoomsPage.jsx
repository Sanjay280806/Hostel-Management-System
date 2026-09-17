import { useState, useEffect, useCallback } from 'react';
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

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form, setForm] = useState({ roomNumber: '', capacity: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await roomService.getAll(statusFilter ? { status: statusFilter } : {});
      setRooms(data.data);
    } catch {
      showToast('Failed to fetch rooms.', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const openAdd = () => { setForm({ roomNumber: '', capacity: '' }); setFormError(''); setModal('add'); };
  const openEdit = (r) => {
    setSelectedRoom(r);
    setForm({ roomNumber: r.roomNumber, capacity: r.capacity });
    setFormError('');
    setModal('edit');
  };
  const openDelete = (r) => { setSelectedRoom(r); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelectedRoom(null); };

  const handleFormChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (formError) setFormError('');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.roomNumber || !form.capacity) { setFormError('Room number and capacity are required.'); return; }
    if (form.capacity < 1) { setFormError('Capacity must be at least 1.'); return; }
    setFormLoading(true);
    try {
      await roomService.create({ roomNumber: form.roomNumber, capacity: Number(form.capacity) });
      showToast('Room created!');
      closeModal();
      fetchRooms();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create room.');
    } finally { setFormLoading(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await roomService.update(selectedRoom._id, {
        roomNumber: form.roomNumber,
        capacity: Number(form.capacity),
      });
      showToast('Room updated!');
      closeModal();
      fetchRooms();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update room.');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await roomService.delete(selectedRoom._id);
      showToast('Room deleted.');
      closeModal();
      fetchRooms();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete room.', 'error');
      closeModal();
    }
  };

  // Summary counts
  const totalRooms = rooms.length;
  const available = rooms.filter((r) => r.status === 'Available').length;
  const full = rooms.filter((r) => r.status === 'Full').length;
  const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const totalOccupied = rooms.reduce((acc, r) => acc + r.occupiedCount, 0);

  return (
    <div className="page">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Room Inventory</h1>
          <p className="page-subtitle">Manage hostel rooms and track availability</p>
        </div>
        <button className="btn-primary btn-sm" onClick={openAdd} id="add-room-btn">+ Add Room</button>
      </div>

      {/* Summary Stats */}
      <div className="stats-row">
        {[
          { label: 'Total Rooms', value: totalRooms, color: 'indigo' },
          { label: 'Available', value: available, color: 'green' },
          { label: 'Full', value: full, color: 'red' },
          { label: 'Occupancy', value: `${totalOccupied}/${totalCapacity}`, color: 'violet' },
        ].map((s) => (
          <div key={s.label} className={`stat-card stat-${s.color}`}>
            <p className="stat-value">{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['', 'Available', 'Full'].map((f) => (
          <button
            key={f}
            className={`filter-tab ${statusFilter === f ? 'filter-tab-active' : ''}`}
            onClick={() => setStatusFilter(f)}
            id={`filter-${f || 'all'}`}
          >
            {f || 'All Rooms'}
          </button>
        ))}
      </div>

      {/* Room Grid */}
      {loading ? (
        <div className="table-loading"><div className="spinner" /></div>
      ) : rooms.length === 0 ? (
        <div className="table-empty">
          <div className="table-empty-icon">🏠</div>
          <p>{statusFilter ? `No ${statusFilter} rooms.` : 'No rooms yet. Click "Add Room" to start.'}</p>
        </div>
      ) : (
        <div className="room-grid">
          {rooms.map((room) => {
            const pct = room.capacity > 0 ? Math.round((room.occupiedCount / room.capacity) * 100) : 0;
            const isFull = room.status === 'Full';
            return (
              <div key={room._id} className={`room-card ${isFull ? 'room-card-full' : 'room-card-available'}`}>
                <div className="room-card-header">
                  <span className="room-number">{room.roomNumber}</span>
                  <span className={`badge ${isFull ? 'badge-red' : 'badge-green'}`}>
                    {room.status}
                  </span>
                </div>
                <div className="room-card-body">
                  <p className="room-occupancy">
                    <span className="room-occ-num">{room.occupiedCount}</span>
                    <span className="room-occ-sep"> / </span>
                    <span>{room.capacity}</span>
                    <span className="room-occ-label"> beds</span>
                  </p>
                  {/* Capacity bar */}
                  <div className="capacity-bar-wrap">
                    <div
                      className={`capacity-bar-fill ${isFull ? 'capacity-bar-red' : 'capacity-bar-green'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="room-pct">{pct}% occupied</p>
                </div>
                <div className="room-card-actions">
                  <button
                    className="btn-icon btn-icon-edit"
                    onClick={() => openEdit(room)}
                    title="Edit room"
                    id={`edit-room-${room._id}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    className="btn-icon btn-icon-delete"
                    onClick={() => openDelete(room)}
                    title="Delete room"
                    disabled={room.occupiedCount > 0}
                    id={`delete-room-${room._id}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {modal === 'add' && (
        <Modal title="Add New Room" onClose={closeModal}>
          <form onSubmit={handleAdd} id="add-room-form">
            {formError && <div className="alert alert-error">{formError}</div>}
            <div className="form-group">
              <label className="form-label">Room Number</label>
              <input id="add-roomNumber" name="roomNumber" type="text" className="form-input form-input-plain"
                placeholder="e.g. A101" value={form.roomNumber} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Capacity (beds)</label>
              <input id="add-capacity" name="capacity" type="number" className="form-input form-input-plain"
                placeholder="e.g. 3" min="1" value={form.capacity} onChange={handleFormChange} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn-primary btn-sm" disabled={formLoading} id="submit-add-room">
                {formLoading ? 'Creating…' : 'Create Room'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {modal === 'edit' && (
        <Modal title={`Edit Room ${selectedRoom?.roomNumber}`} onClose={closeModal}>
          <form onSubmit={handleEdit} id="edit-room-form">
            {formError && <div className="alert alert-error">{formError}</div>}
            <div className="form-group">
              <label className="form-label">Room Number</label>
              <input id="edit-roomNumber" name="roomNumber" type="text" className="form-input form-input-plain"
                value={form.roomNumber} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Capacity (beds)</label>
              <input id="edit-capacity" name="capacity" type="number" className="form-input form-input-plain"
                min="1" value={form.capacity} onChange={handleFormChange} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn-primary btn-sm" disabled={formLoading} id="submit-edit-room">
                {formLoading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      {modal === 'delete' && (
        <Modal title="Confirm Delete" onClose={closeModal}>
          <p className="confirm-msg">
            Delete room <strong>{selectedRoom?.roomNumber}</strong>? This cannot be undone.
          </p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={closeModal} id="delete-room-cancel">Cancel</button>
            <button className="btn-danger" onClick={handleDelete} id="delete-room-confirm">Delete Room</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RoomsPage;
