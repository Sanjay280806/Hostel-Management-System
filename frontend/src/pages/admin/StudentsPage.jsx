import { useState, useEffect, useCallback } from 'react';
import { studentService } from '../../services/studentService';
import { PageHeader, Button, Badge, Input, Modal, Table, Card } from '../../components/ui';
import { Search, Plus, Edit2, Trash2, Users } from 'lucide-react';

const INITIAL_FORM = { name: '', contact: '', rollNo: '', email: '', password: '' };

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
const ConfirmDialog = ({ isOpen, message, onConfirm, onCancel }) => (
  <Modal isOpen={isOpen} title="Confirm Action" onClose={onCancel}>
    <p className="mb-6 text-gray-600">{message}</p>
    <div className="flex justify-end space-x-3">
      <Button variant="ghost" onClick={onCancel} id="confirm-cancel-btn">Cancel</Button>
      <Button variant="danger" onClick={onConfirm} id="confirm-delete-btn">Delete</Button>
    </div>
  </Modal>
);

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

  const columns = [
    {
      header: 'Student ID',
      field: 'studentId',
      render: (row) => <Badge variant="indigo">{row.studentId}</Badge>
    },
    {
      header: 'Name',
      field: 'name',
      render: (row) => <span className="font-semibold">{row.name}</span>
    },
    { header: 'Roll No.', field: 'rollNo' },
    { header: 'Contact', field: 'contact' },
    {
      header: 'Email',
      field: 'email',
      render: (row) => <span className="text-gray-500">{row.userId?.email}</span>
    },
    {
      header: 'Joined',
      field: 'createdAt',
      render: (row) => <span className="text-gray-500">{new Date(row.createdAt).toLocaleDateString()}</span>
    },
    {
      header: 'Actions',
      field: 'actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Edit2}
            onClick={() => openEdit(row)}
            id={`edit-student-${row._id}`}
            title="Edit student"
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            icon={Trash2}
            onClick={() => openDelete(row)}
            id={`delete-student-${row._id}`}
            title="Delete student"
          />
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Students"
        subtitle="Manage all registered students"
        icon={Users}
        action={
          <Button variant="primary" icon={Plus} onClick={openAdd} id="add-student-btn">
            Add Student
          </Button>
        }
      />

      <Card className="flex flex-col space-y-4">
        {/* Search Bar */}
        <div className="w-full md:w-1/3">
          <Input
            icon={Search}
            placeholder="Search by name, roll number or student ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="student-search-input"
          />
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={students}
          keyField="_id"
          loading={loading}
          emptyMessage={search ? 'No students match your search.' : 'No students yet. Click "Add Student" to begin.'}
        />

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
            <span className="text-sm text-gray-500">
              Showing page {page} of {pagination.pages} ({pagination.total} total)
            </span>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                id="prev-page-btn"
              >
                ← Prev
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                id="next-page-btn"
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <Modal isOpen={modal === 'add'} title="Add New Student" onClose={closeModal}>
        <form onSubmit={handleAdd} id="add-student-form" className="space-y-4">
          {formError && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{formError}</div>}
          
          <Input
            label="Full Name"
            name="name"
            placeholder="e.g. Samuthrika Shree S"
            value={form.name}
            onChange={handleFormChange}
            id="add-name"
          />
          <Input
            label="Roll Number"
            name="rollNo"
            placeholder="e.g. 24BCS237"
            value={form.rollNo}
            onChange={handleFormChange}
            id="add-rollNo"
          />
          <Input
            label="Contact Number"
            name="contact"
            placeholder="e.g. 9876543210"
            value={form.contact}
            onChange={handleFormChange}
            id="add-contact"
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="student@kct.ac.in"
            value={form.email}
            onChange={handleFormChange}
            id="add-email"
          />
          <Input
            label="Initial Password"
            name="password"
            type="password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={handleFormChange}
            id="add-password"
          />

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button type="submit" variant="primary" loading={formLoading} id="submit-add-student">
              Create Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={modal === 'edit'} title="Edit Student" onClose={closeModal}>
        <form onSubmit={handleEdit} id="edit-student-form" className="space-y-4">
          {formError && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{formError}</div>}
          
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleFormChange}
            id="edit-name"
          />
          <Input
            label="Roll Number"
            name="rollNo"
            value={form.rollNo}
            onChange={handleFormChange}
            id="edit-rollNo"
          />
          <Input
            label="Contact Number"
            name="contact"
            value={form.contact}
            onChange={handleFormChange}
            id="edit-contact"
          />

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button type="submit" variant="primary" loading={formLoading} id="submit-edit-student">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={modal === 'delete'}
        message={`Delete student "${selectedStudent?.name}" (${selectedStudent?.rollNo})? This will also remove their login account.`}
        onConfirm={handleDelete}
        onCancel={closeModal}
      />
    </div>
  );
};

export default StudentsPage;
