import React, { useState, useEffect } from 'react';
import { noticeService } from '../../services/noticeService';
import { useAuth } from '../../context/AuthContext';
import { Megaphone, Plus, Trash2, Calendar, User } from 'lucide-react';
import { PageHeader, Card, Button, Modal, Input } from '../../components/ui';
import { motion } from 'framer-motion';

const NoticeBoardPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [modal, setModal] = useState(null);
  const [selectedNotice, setSelectedNotice] = useState(null);
  
  const [form, setForm] = useState({ title: '', content: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const { data } = await noticeService.getAll();
      setNotices(data.data);
    } catch {
      showToast('Failed to fetch notices.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotices(); }, []);

  const openAdd = () => {
    setForm({ title: '', content: '' });
    setFormError('');
    setModal('add');
  };

  const openDelete = (notice) => {
    setSelectedNotice(notice);
    setModal('delete');
  };

  const closeModal = () => { setModal(null); setSelectedNotice(null); };

  const handleFormChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (formError) setFormError('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      setFormError('Title and content are required.'); return;
    }
    setFormLoading(true);
    try {
      await noticeService.create(form);
      showToast('Notice posted successfully.');
      closeModal();
      fetchNotices();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to post notice.');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await noticeService.delete(selectedNotice._id);
      showToast('Notice deleted.');
      closeModal();
      fetchNotices();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete notice.', 'error');
      closeModal();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg z-50 ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <PageHeader 
        title="Notice Board" 
        subtitle="Announcements and important updates"
        icon={Megaphone}
        action={(user?.role === 'Admin' || user?.role === 'Warden') && (
          <Button onClick={openAdd} icon={Plus}>
            Post Notice
          </Button>
        )}
      />

      {loading ? (
        <div className="flex justify-center p-16">
          <div className="ui-spinner ui-spinner-lg" />
        </div>
      ) : notices.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Megaphone size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No notices posted yet.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {notices.map((n, i) => (
            <motion.div 
              key={n._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.5) }}
            >
              <Card hover>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{n.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <User size={16} /> 
                        {n.postedBy?.role || 'Admin'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={16} /> 
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {user?.role === 'Admin' && (
                    <Button 
                      variant="danger" 
                      size="sm" 
                      icon={Trash2} 
                      onClick={() => openDelete(n)} 
                    />
                  )}
                </div>
                <div className="h-px bg-gray-100 w-full mb-4"></div>
                <p className="text-gray-700 leading-relaxed white-space-pre-wrap">
                  {n.content}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={modal === 'add'} onClose={closeModal} title="Post New Notice">
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && <div className="text-red-500 text-sm font-medium">{formError}</div>}
          
          <Input
            label="Title"
            name="title"
            placeholder="e.g. Maintenance Scheduled for Sunday"
            value={form.title}
            onChange={handleFormChange}
          />

          <div className="ui-input-container">
            <label className="ui-label">Content</label>
            <textarea
              name="content"
              rows="5"
              className="ui-input"
              placeholder="Detailed information..."
              value={form.content}
              onChange={handleFormChange}
              style={{ resize: 'vertical', paddingTop: '0.75rem' }}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={formLoading}>Post Notice</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modal === 'delete'} onClose={closeModal} title="Delete Notice">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete the notice <strong className="text-gray-900">{selectedNotice?.title}</strong>? <br/>
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete Notice</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NoticeBoardPage;
