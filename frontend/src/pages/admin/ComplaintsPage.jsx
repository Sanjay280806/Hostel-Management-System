import React, { useState, useEffect, useCallback } from 'react';
import { complaintService } from '../../services/complaintService';
import { studentService } from '../../services/studentService';
import { PageHeader, Card, Button, Badge, Input, Select, Modal, Table } from '../../components/ui';
import { Plus, MessageSquare, AlertCircle, Clock, CheckCircle, Search, Settings2, Edit } from 'lucide-react';

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved': return <Badge variant="success">Resolved</Badge>;
      case 'In-Progress': return <Badge variant="primary">In Progress</Badge>;
      case 'Pending':
      default: return <Badge variant="warning">Pending</Badge>;
    }
  };

  const tableColumns = [
    {
      header: 'Date',
      field: 'createdAt',
      render: (row) => (
        <span className="text-sm text-gray-500 font-medium">
          {new Date(row.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      )
    },
    {
      header: 'Student',
      field: 'student',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.studentId?.name || 'Unknown'}</div>
          <div className="text-xs text-gray-500">{row.studentId?.rollNo || 'N/A'}</div>
        </div>
      )
    },
    {
      header: 'Issue',
      field: 'issue',
      render: (row) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate">{row.title}</div>
          <div className="text-sm text-gray-500 truncate" title={row.description}>{row.description}</div>
        </div>
      )
    },
    {
      header: 'Assigned To',
      field: 'assignedTo',
      render: (row) => (
        <span className="text-sm text-gray-600">
          {row.assignedTo ? row.assignedTo : <span className="text-gray-400 italic">Unassigned</span>}
        </span>
      )
    },
    {
      header: 'Status',
      field: 'status',
      render: (row) => getStatusBadge(row.status)
    },
    {
      header: 'Actions',
      field: 'actions',
      align: 'right',
      render: (row) => (
        <Button 
          variant="outline" 
          size="sm" 
          icon={Edit} 
          onClick={() => openUpdate(row)}
        >
          Update
        </Button>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          toast.type === 'error' ? 'bg-red-50 text-red-900 border border-red-200' : 'bg-green-50 text-green-900 border border-green-200'
        }`}>
          {toast.message}
        </div>
      )}

      <PageHeader 
        title="Issues & Complaints" 
        subtitle="Track and resolve student maintenance and facility issues"
        icon={MessageSquare}
        action={
          <Button variant="primary" icon={Plus} onClick={openAdd}>
            New Issue
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {[
            { value: '', label: 'All Issues' },
            { value: 'Pending', label: 'Pending' },
            { value: 'In-Progress', label: 'In Progress' },
            { value: 'Resolved', label: 'Resolved' }
          ].map((f) => (
            <button
              key={f.value}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === f.value 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        
        {/* Decorative elements or additional filters could go here */}
        <div className="flex items-center text-sm text-gray-500 gap-2">
          <Settings2 size={16} />
          <span>Manage Views</span>
        </div>
      </div>

      <Card noPadding>
        <Table 
          columns={tableColumns} 
          data={complaints} 
          keyField="_id" 
          loading={loading}
          emptyMessage={statusFilter ? `No ${statusFilter.toLowerCase()} issues found.` : 'No issues registered yet.'}
        />
      </Card>

      <Modal 
        isOpen={modal === 'add'} 
        onClose={closeModal} 
        title="Log New Issue"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              {formError}
            </div>
          )}
          
          <Select
            label="Student"
            name="studentId"
            value={form.studentId}
            onChange={handleFormChange}
            options={students.map(s => ({
              value: s._id,
              label: `${s.name} (${s.rollNo})`
            }))}
          />

          <Input
            label="Title"
            name="title"
            placeholder="e.g. Broken window in room 102"
            value={form.title}
            onChange={handleFormChange}
          />

          <div className="ui-input-container">
            <label className="ui-label">Description</label>
            <textarea
              name="description"
              rows="4"
              className="ui-input"
              placeholder="Provide detailed information about the issue..."
              value={form.description}
              onChange={handleFormChange}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button type="submit" variant="primary" loading={formLoading}>
              Create Issue
            </Button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={modal === 'update'} 
        onClose={closeModal} 
        title="Update Issue Status"
        maxWidth="sm"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          {formError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              {formError}
            </div>
          )}
          
          <Select
            label="Status"
            name="status"
            value={statusForm.status}
            onChange={handleStatusFormChange}
            options={[
              { value: 'Pending', label: 'Pending' },
              { value: 'In-Progress', label: 'In Progress' },
              { value: 'Resolved', label: 'Resolved' }
            ]}
          />

          <Input
            label="Assigned To"
            name="assignedTo"
            placeholder="e.g. Maintenance Team"
            value={statusForm.assignedTo}
            onChange={handleStatusFormChange}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button type="submit" variant="primary" loading={formLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ComplaintsPage;
