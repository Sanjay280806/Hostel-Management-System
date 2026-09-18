import React, { useState, useEffect, useCallback } from 'react';
import { visitorService } from '../../services/visitorService';
import { studentService } from '../../services/studentService';
import { Card, PageHeader, Button, Badge, Input, Select, Modal, Table } from '../../components/ui';
import { Users, Plus, LogOut, Clock } from 'lucide-react';

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

  const columns = [
    {
      header: 'Visitor Name',
      field: 'visitorName',
      render: (v) => <span className="font-medium text-gray-900">{v.visitorName}</span>
    },
    {
      header: 'Visiting Student',
      field: 'studentId',
      render: (v) => (
        <div>
          <div className="font-medium text-gray-900">{v.studentId?.name}</div>
          <div className="text-xs text-gray-500">Room: {v.studentId?.roomNumber || 'N/A'}</div>
        </div>
      )
    },
    {
      header: 'Check-In Time',
      field: 'checkIn',
      render: (v) => (
        <div className="flex items-center text-gray-500 text-sm">
          <Clock size={14} className="mr-1.5" />
          {new Date(v.checkIn).toLocaleString()}
        </div>
      )
    },
    {
      header: 'Check-Out Time',
      field: 'checkOut',
      render: (v) => (
        <div className="flex items-center text-gray-500 text-sm">
          {v.checkOut ? (
            <>
              <Clock size={14} className="mr-1.5" />
              {new Date(v.checkOut).toLocaleString()}
            </>
          ) : (
            '—'
          )}
        </div>
      )
    },
    {
      header: 'Status',
      field: 'status',
      render: (v) => (
        <Badge variant={v.status === 'In' ? 'amber' : 'gray'}>
          {v.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      field: 'actions',
      render: (v) => (
        v.status === 'In' ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => openCheckout(v)}
            icon={LogOut}
          >
            Check Out
          </Button>
        ) : null
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      <PageHeader 
        title="Visitor Logs" 
        subtitle="Track incoming and outgoing hostel visitors"
        icon={Users}
        action={
          <Button icon={Plus} onClick={openAdd}>
            Check-In Visitor
          </Button>
        }
      />

      <div className="flex gap-2">
        {[
          { value: '', label: 'All Visitors' },
          { value: 'In', label: 'Currently In' },
          { value: 'Out', label: 'Checked Out' }
        ].map((f) => (
          <button
            key={f.value}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              statusFilter === f.value 
                ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card noPadding>
        <Table 
          columns={columns} 
          data={visitors} 
          keyField="_id" 
          loading={loading}
          emptyMessage={statusFilter ? `No ${statusFilter.toLowerCase()} visitors found.` : 'No visitors logged yet.'}
        />
      </Card>

      <Modal 
        isOpen={modal === 'add'} 
        onClose={closeModal} 
        title="Check-In Visitor"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          {formError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md ring-1 ring-red-500/20">
              {formError}
            </div>
          )}
          
          <Input
            label="Visitor Name"
            name="visitorName"
            placeholder="e.g. John Doe"
            value={form.visitorName}
            onChange={handleFormChange}
            icon={Users}
          />

          <Select
            label="Visiting Student"
            name="studentId"
            value={form.studentId}
            onChange={handleFormChange}
            options={students.map(s => ({
              value: s._id,
              label: `${s.name} (${s.rollNo})`
            }))}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              Check In
            </Button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={modal === 'checkout'} 
        onClose={closeModal} 
        title="Check-Out Visitor"
      >
        <div className="space-y-5">
          <p className="text-gray-600">
            Are you sure you want to check out <strong className="text-gray-900">{selectedVisitor?.visitorName}</strong>? <br/>
            This will record the current time as the check-out time.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleCheckout} icon={LogOut}>
              Confirm Check-Out
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VisitorsPage;
