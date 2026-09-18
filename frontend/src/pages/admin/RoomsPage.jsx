import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, Home, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { PageHeader, Card, StatCard, Badge, Button, Input, Modal } from '../../components/ui';
import { roomService } from '../../services/roomService';

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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
  const closeModal = () => { setModal(false); setSelectedRoom(null); };

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

  const totalRooms = rooms.length;
  const available = rooms.filter((r) => r.status === 'Available').length;
  const full = rooms.filter((r) => r.status === 'Full').length;
  const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const totalOccupied = rooms.reduce((acc, r) => acc + r.occupiedCount, 0);

  const filteredRooms = rooms.filter(room => 
    room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      <PageHeader 
        title="Rooms Inventory"
        subtitle="Manage hostel rooms and track availability"
        action={
          <Button variant="primary" onClick={openAdd} icon={Plus} id="add-room-btn">
            Add Room
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Rooms" value={totalRooms} color="indigo" icon={Home} />
        <StatCard title="Available" value={available} color="emerald" icon={CheckCircle} />
        <StatCard title="Full" value={full} color="rose" icon={XCircle} />
        <StatCard title="Occupancy" value={`${totalOccupied}/${totalCapacity}`} color="violet" icon={AlertCircle} />
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center gap-4" style={{ flexWrap: 'wrap' }}>
        <div style={{ width: '100%', maxWidth: '320px' }}>
          <Input 
            placeholder="Search rooms..." 
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {[
            { label: 'All', value: '' },
            { label: 'Available', value: 'Available' },
            { label: 'Full', value: 'Full' }
          ].map((f) => (
            <Button 
              key={f.value}
              variant={statusFilter === f.value ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-8"><div className="ui-spinner" /></div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center text-gray-500 py-12 text-sm bg-white rounded-lg border border-gray-200">No rooms found.</div>
      ) : (
        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {filteredRooms.map((room, index) => {
              const pct = room.capacity > 0 ? Math.round((room.occupiedCount / room.capacity) * 100) : 0;
              const isFull = room.status === 'Full';
              const badgeVariant = isFull ? 'red' : room.occupiedCount > 0 ? 'amber' : 'green';
              
              return (
                <motion.div
                  key={room._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.3) }}
                >
                  <Card hover style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>{room.roomNumber}</h3>
                      <Badge variant={badgeVariant}>{room.status}</Badge>
                    </div>
                    
                    <div style={{ flex: 1, marginBottom: '1.5rem' }}>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Occupancy</p>
                          <p style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-text-primary)', marginTop: '0.25rem' }}>
                            {room.occupiedCount} <span style={{ color: 'var(--color-text-muted)', fontSize: '1rem', fontWeight: 400 }}>/ {room.capacity}</span>
                          </p>
                        </div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                          {pct}%
                        </span>
                      </div>
                      
                      <div className="capacity-bar">
                        <div 
                          className="capacity-fill"
                          style={{ 
                            width: `${pct}%`, 
                            backgroundColor: isFull ? 'var(--color-error)' : room.occupiedCount > 0 ? 'var(--color-warning)' : 'var(--color-success)' 
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button variant="secondary" size="sm" icon={Edit2} onClick={() => openEdit(room)} />
                      <Button variant="danger" size="sm" icon={Trash2} onClick={() => openDelete(room)} disabled={room.occupiedCount > 0} />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={modal === 'add'} onClose={closeModal} title="Add New Room">
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          {formError && <div className="ui-error-text">{formError}</div>}
          <Input label="Room Number" name="roomNumber" placeholder="e.g. A101" value={form.roomNumber} onChange={handleFormChange} required />
          <Input label="Capacity (beds)" type="number" name="capacity" min="1" value={form.capacity} onChange={handleFormChange} required />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" type="submit" loading={formLoading}>Create Room</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={modal === 'edit'} onClose={closeModal} title={`Edit Room ${selectedRoom?.roomNumber}`}>
        <form onSubmit={handleEdit} className="flex flex-col gap-4">
          {formError && <div className="ui-error-text">{formError}</div>}
          <Input label="Room Number" name="roomNumber" value={form.roomNumber} onChange={handleFormChange} required />
          <Input label="Capacity (beds)" type="number" name="capacity" min="1" value={form.capacity} onChange={handleFormChange} required />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" type="submit" loading={formLoading}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={modal === 'delete'} onClose={closeModal} title="Confirm Delete">
        <div className="flex flex-col gap-4">
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Are you sure you want to delete room <strong style={{ color: 'var(--color-text-primary)' }}>{selectedRoom?.roomNumber}</strong>?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete Room</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoomsPage;
