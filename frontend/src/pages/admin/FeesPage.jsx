import { useState, useEffect, useCallback } from 'react';
import { feeService } from '../../services/feeService';
import { allocationService } from '../../services/allocationService';

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

const FeesPage = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
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

  return (
    <div className="page">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Fee Management</h1>
          <p className="page-subtitle">Track student fee payments and generate receipts</p>
        </div>
        <button className="btn-primary btn-sm" onClick={openGenerate}>
          + Generate Fee
        </button>
      </div>

      <div className="filter-tabs">
        {[
          { value: '', label: 'All Fees' },
          { value: 'Pending', label: 'Pending' },
          { value: 'Paid', label: 'Paid' }
        ].map((f) => (
          <button
            key={f.value}
            className={`filter-tab ${statusFilter === f.value ? 'filter-tab-active' : ''}`}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="table-card">
        {loading ? (
          <div className="table-loading"><div className="spinner" /></div>
        ) : fees.length === 0 ? (
          <div className="table-empty">
            <div className="table-empty-icon">💳</div>
            <p>{statusFilter ? `No ${statusFilter} fees found.` : 'No fee records generated yet.'}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Room</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Receipt ID</th>
                <th>Paid On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee._id}>
                  <td className="td-bold">
                    {fee.studentId?.name} <br/>
                    <span className="td-muted" style={{fontSize: '0.8rem'}}>{fee.studentId?.rollNo}</span>
                  </td>
                  <td><span className="badge badge-indigo">{fee.allocationId?.roomId?.roomNumber || '—'}</span></td>
                  <td className="td-bold">₹{fee.amount}</td>
                  <td>
                    <span className={`badge ${fee.status === 'Paid' ? 'badge-green' : 'badge-amber'}`}>
                      {fee.status}
                    </span>
                  </td>
                  <td className="td-muted">{fee.receiptId || '—'}</td>
                  <td className="td-muted">
                    {fee.paidAt ? new Date(fee.paidAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    {fee.status === 'Pending' && (
                      <button className="btn-outline-danger btn-sm" onClick={() => openPay(fee)} style={{borderColor: '#10b981', color: '#10b981'}}>
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal === 'generate' && (
        <Modal title="Generate Fee Record" onClose={closeModal}>
          <form onSubmit={handleGenerate}>
            {formError && <div className="alert alert-error">{formError}</div>}
            
            <div className="form-group">
              <label className="form-label">Select Active Allocation</label>
              <select
                name="allocationId"
                className="form-input form-input-plain form-select"
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
              {allocations.length === 0 && <p className="form-hint">No active allocations available.</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input
                name="amount"
                type="number"
                min="0"
                className="form-input form-input-plain"
                placeholder="e.g. 5000"
                value={form.amount}
                onChange={handleFormChange}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn-primary btn-sm" disabled={formLoading || allocations.length === 0}>
                {formLoading ? 'Generating…' : 'Generate Fee'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'pay' && (
        <Modal title="Mark Fee as Paid" onClose={closeModal}>
          <p className="confirm-msg">
            Are you sure you want to mark the fee of <strong>₹{selectedFee?.amount}</strong> for <strong>{selectedFee?.studentId?.name}</strong> as Paid? <br/>
            This will generate a Receipt ID automatically.
          </p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={closeModal}>Cancel</button>
            <button className="btn-primary btn-sm" onClick={handleMarkAsPaid}>Confirm Payment</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FeesPage;
