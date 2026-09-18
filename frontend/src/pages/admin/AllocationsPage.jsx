import { useState, useEffect, useCallback } from 'react';
import { allocationService } from '../../services/allocationService';
import { studentService } from '../../services/studentService';
import { roomService } from '../../services/roomService';
import { PageHeader, Table, Badge, Modal, Input, Select, Button, Card } from '../../components/ui';
import { ClipboardList, Plus } from 'lucide-react';

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

  const columns = [
    { header: 'Student', render: (a) => <span className="font-medium">{a.studentId?.name ?? '—'}</span> },
    { header: 'Roll No.', render: (a) => a.studentId?.rollNo ?? '—' },
    { header: 'Room', render: (a) => <Badge variant="indigo">{a.roomId?.roomNumber ?? '—'}</Badge> },
    { header: 'Capacity', render: (a) => a.roomId ? <span className="text-gray-500">{a.roomId.occupiedCount}/{a.roomId.capacity}</span> : '—' },
    { header: 'Start Date', render: (a) => a.startDate ? new Date(a.startDate).toLocaleDateString() : '—' },
    { header: 'End Date', render: (a) => a.endDate ? new Date(a.endDate).toLocaleDateString() : '—' },
    { header: 'Status', render: (a) => (
        <Badge variant={a.status === 'Active' ? 'green' : 'gray'}>
          {a.status}
        </Badge>
      ) 
    },
    { header: 'Actions', render: (a) => (
        a.status === 'Active' ? (
          <Button 
            variant="danger" 
            size="sm"
            onClick={() => openVacate(a)}
            id={`vacate-alloc-${a._id}`}
          >
            Vacate
          </Button>
        ) : null
      )
    }
  ];

  const studentOptions = students.map(s => ({ value: s._id, label: `${s.name} (${s.rollNo})` }));
  const roomOptions = rooms.map(r => ({ value: r._id, label: `Room ${r.roomNumber} — ${r.occupiedCount}/${r.capacity} beds` }));

  return (
    <div className="flex flex-col gap-6">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      <PageHeader
        title="Room Allocations"
        subtitle="Assign and manage student room allocations"
        icon={ClipboardList}
        action={
          <Button onClick={openAssign} icon={Plus} id="assign-room-btn">
            Assign Room
          </Button>
        }
      />

      <div className="filter-tabs mb-6">
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

      <Card noPadding>
        <Table 
          columns={columns} 
          data={allocations} 
          keyField="_id" 
          loading={loading}
          emptyMessage={statusFilter ? `No ${statusFilter} allocations found.` : 'No allocations yet.'}
        />
      </Card>

      <Modal isOpen={modal === 'assign'} onClose={closeModal} title="Assign Room to Student" maxWidth="md">
        <form onSubmit={handleAssign} id="assign-room-form" className="space-y-4">
          {formError && <div className="alert alert-error">{formError}</div>}
          
          <Select
            label="Select Student"
            id="assign-studentId"
            name="studentId"
            value={form.studentId}
            onChange={handleFormChange}
            options={studentOptions}
          />

          <Select
            label="Select Available Room"
            id="assign-roomId"
            name="roomId"
            value={form.roomId}
            onChange={handleFormChange}
            options={roomOptions}
          />
          {rooms.length === 0 && modal === 'assign' && (
            <p className="text-sm text-amber-600 mt-1">⚠ No available rooms. Add rooms or vacate existing allocations.</p>
          )}

          <Input
            label="Start Date"
            type="date"
            id="assign-startDate"
            name="startDate"
            value={form.startDate}
            onChange={handleFormChange}
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={formLoading} disabled={rooms.length === 0} id="submit-assign-room">
              Assign Room
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modal === 'vacate'} onClose={closeModal} title="Vacate Room" maxWidth="sm">
        <p className="mb-6 text-gray-600">
          Vacate <strong className="text-gray-900">{selectedAlloc?.studentId?.name}</strong> from room{' '}
          <strong className="text-gray-900">{selectedAlloc?.roomId?.roomNumber}</strong>? This will decrement the room's occupancy count.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={closeModal} id="vacate-cancel">Cancel</Button>
          <Button variant="danger" onClick={handleVacate} id="vacate-confirm">Confirm Vacate</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AllocationsPage;
