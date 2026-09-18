import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { feeService } from '../../services/feeService';
import { allocationService } from '../../services/allocationService';
import { 
  PageHeader, 
  Button, 
  Badge, 
  Input, 
  Select, 
  Modal, 
  Table, 
  StatCard, 
  Card 
} from '../../components/ui';
import { Search, IndianRupee, Clock, CheckCircle, CreditCard, Plus, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';

const FeesPage = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState(null);
  const [selectedFee, setSelectedFee] = useState(null);
  
  const [allocations, setAllocations] = useState([]);
  const [form, setForm] = useState({ allocationId: '', amount: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchFees = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await feeService.getAll(statusFilter ? { status: statusFilter } : {});
      setFees(data.data);
    } catch {
      showToast('Failed to fetch fee records.', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchFees(); }, [fetchFees]);

  const openGenerate = async () => {
    setForm({ allocationId: '', amount: '' });
    setFormError('');
    setModal('generate');
    try {
      const res = await allocationService.getAll({ status: 'Active' });
      setAllocations(res.data.data);
    } catch {
      showToast('Failed to load active allocations.', 'error');
    }
  };

  const openPay = (fee) => { setSelectedFee(fee); setModal('pay'); };
  const closeModal = () => { setModal(null); setSelectedFee(null); };

  const handleFormChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (formError) setFormError('');
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.allocationId || !form.amount) {
      setFormError('Allocation and amount are required.');
      return;
    }
    setFormLoading(true);
    try {
      await feeService.create({
        allocationId: form.allocationId,
        amount: Number(form.amount)
      });
      showToast('Fee record generated successfully!');
      closeModal();
      fetchFees();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to generate fee.');
    } finally { setFormLoading(false); }
  };

  const handleMarkAsPaid = async () => {
    try {
      await feeService.markAsPaid(selectedFee._id);
      showToast('Fee marked as paid.');
      closeModal();
      fetchFees();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update fee.', 'error');
      closeModal();
    }
  };

  // Stats calculation
  const totalFees = fees.reduce((acc, f) => acc + f.amount, 0);
  const collectedFees = fees.filter(f => f.status === 'Paid').reduce((acc, f) => acc + f.amount, 0);
  const pendingFees = fees.filter(f => f.status === 'Pending').reduce((acc, f) => acc + f.amount, 0);

  // Filtering by search term
  const filteredFees = useMemo(() => {
    return fees.filter(fee => {
      const studentName = fee.studentId?.name?.toLowerCase() || '';
      const rollNo = fee.studentId?.rollNo?.toLowerCase() || '';
      const roomNo = fee.allocationId?.roomId?.roomNumber?.toLowerCase() || '';
      const searchLower = searchTerm.toLowerCase();
      return studentName.includes(searchLower) || rollNo.includes(searchLower) || roomNo.includes(searchLower);
    });
  }, [fees, searchTerm]);

  const columns = [
    { 
      header: 'Student', 
      accessor: (f) => (
        <div>
          <div className="font-medium text-gray-900">{f.studentId?.name}</div>
          <div className="text-xs text-gray-500">{f.studentId?.rollNo}</div>
        </div>
      )
    },
    { 
      header: 'Room', 
      accessor: (f) => (
        <Badge variant="indigo">{f.allocationId?.roomId?.roomNumber || '—'}</Badge>
      )
    },
    { 
      header: 'Amount', 
      accessor: (f) => <span className="font-semibold text-gray-900">₹{f.amount}</span>
    },
    { 
      header: 'Status', 
      accessor: (f) => (
        <Badge variant={f.status === 'Paid' ? 'green' : 'amber'}>
          {f.status}
        </Badge>
      )
    },
    { 
      header: 'Receipt ID', 
      accessor: (f) => <span className="text-gray-500 text-sm font-mono">{f.receiptId || '—'}</span>
    },
    { 
      header: 'Paid On', 
      accessor: (f) => (
        <span className="text-gray-500 text-sm">
          {f.paidAt ? new Date(f.paidAt).toLocaleDateString() : '—'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (f) => f.status === 'Pending' ? (
        <Button variant="outline" size="sm" onClick={() => openPay(f)} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
          Mark Paid
        </Button>
      ) : (
        <span className="text-sm text-gray-400">Paid</span>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {toast.message}
        </div>
      )}

      <PageHeader 
        title="Fee Management" 
        subtitle="Track student fee payments and generate receipts"
        action={
          <Button onClick={openGenerate} icon={Plus}>
            Generate Fee
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard 
            title="Total Fees" 
            value={`₹${totalFees}`} 
            icon={IndianRupee} 
            trend="Total Generated" 
            trendUp={true} 
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard 
            title="Collected" 
            value={`₹${collectedFees}`} 
            icon={CheckCircle} 
            trend="Total Paid" 
            trendUp={true} 
            className="text-emerald-600"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatCard 
            title="Pending" 
            value={`₹${pendingFees}`} 
            icon={Clock} 
            trend="Awaiting Payment" 
            trendUp={false} 
            className="text-amber-600"
          />
        </motion.div>
      </div>

      <Card noPadding>
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
            {[
              { value: '', label: 'All Fees' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Paid', label: 'Paid' }
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
          <div className="w-full sm:w-64">
            <Input 
              icon={Search} 
              placeholder="Search student or room..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Table 
          columns={columns} 
          data={filteredFees} 
          loading={loading} 
          emptyMessage={
            statusFilter 
              ? `No ${statusFilter} fees found matching your criteria.` 
              : 'No fee records found.'
          }
        />
      </Card>

      <Modal 
        isOpen={modal === 'generate'} 
        onClose={closeModal} 
        title="Generate Fee Record"
        icon={Receipt}
      >
        <form onSubmit={handleGenerate} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {formError}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Active Allocation</label>
            <select
              name="allocationId"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={form.allocationId}
              onChange={handleFormChange}
            >
              <option value="">— Choose Allocation —</option>
              {allocations.map(a => (
                <option key={a._id} value={a._id}>
                  {a.studentId?.name} ({a.studentId?.rollNo}) - Room {a.roomId?.roomNumber}
                </option>
              ))}
            </select>
            {allocations.length === 0 && <p className="mt-1 text-xs text-gray-500">No active allocations available.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <Input
              name="amount"
              type="number"
              min="0"
              placeholder="e.g. 5000"
              value={form.amount}
              onChange={handleFormChange}
              icon={IndianRupee}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={formLoading || allocations.length === 0}>
              {formLoading ? 'Generating…' : 'Generate Fee'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={modal === 'pay'} 
        onClose={closeModal} 
        title="Mark Fee as Paid"
        icon={CreditCard}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to mark the fee of <strong className="text-gray-900">₹{selectedFee?.amount}</strong> for <strong className="text-gray-900">{selectedFee?.studentId?.name}</strong> as Paid?
          </p>
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-md text-sm">
            This action will generate a Receipt ID automatically.
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" onClick={handleMarkAsPaid} className="bg-emerald-600 hover:bg-emerald-700 border-none">
              Confirm Payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FeesPage;
