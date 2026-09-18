import { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { studentService } from '../../services/studentService';
import { PageHeader, Card, Table, Button, Input } from '../../components/ui';
import { CalendarCheck, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const AttendancePage = () => {
  const [students, setStudents] = useState([]);
  const [attendanceDict, setAttendanceDict] = useState({}); // studentId -> status
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const stRes = await studentService.getAll({ limit: 200 });
      const allStudents = stRes.data.data;
      setStudents(allStudents);

      const atRes = await attendanceService.getAll({ date: selectedDate });
      const existing = {};
      atRes.data.data.forEach(record => {
        existing[record.studentId._id || record.studentId] = record.status;
      });
      setAttendanceDict(existing);
    } catch {
      showToast('Failed to fetch data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceDict(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.keys(attendanceDict).map(studentId => ({
        studentId,
        status: attendanceDict[studentId]
      }));

      await attendanceService.batchMark({ date: selectedDate, records });
      showToast('Attendance saved successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save attendance.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: 'Student', render: (s) => <span className="font-semibold">{s.name}</span> },
    { header: 'Roll No', field: 'rollNo' },
    { 
      header: 'Attendance Status', 
      render: (s) => {
        const currentStatus = attendanceDict[s._id] || '';
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={currentStatus === 'Present' ? 'secondary' : 'ghost'}
              onClick={() => handleStatusChange(s._id, 'Present')}
              style={currentStatus === 'Present' ? { background: 'var(--color-success)', color: '#fff', borderColor: 'var(--color-success)'} : {}}
            >
              Present
            </Button>
            <Button
              size="sm"
              variant={currentStatus === 'Absent' ? 'secondary' : 'ghost'}
              onClick={() => handleStatusChange(s._id, 'Absent')}
              style={currentStatus === 'Absent' ? { background: 'var(--color-error)', color: '#fff', borderColor: 'var(--color-error)'} : {}}
            >
              Absent
            </Button>
            <Button
              size="sm"
              variant={currentStatus === 'Leave' ? 'secondary' : 'ghost'}
              onClick={() => handleStatusChange(s._id, 'Leave')}
              style={currentStatus === 'Leave' ? { background: 'var(--color-warning)', color: '#fff', borderColor: 'var(--color-warning)'} : {}}
            >
              Leave
            </Button>
          </div>
        );
      }
    }
  ];

  const presentCount = Object.values(attendanceDict).filter(s => s === 'Present').length;
  const absentCount = Object.values(attendanceDict).filter(s => s === 'Absent').length;
  const leaveCount = Object.values(attendanceDict).filter(s => s === 'Leave').length;
  const totalMarked = presentCount + absentCount + leaveCount;

  return (
    <div className="flex flex-col gap-6">
      {toast && (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className={`toast toast-${toast.type}`}>
          {toast.message}
        </motion.div>
      )}

      <PageHeader
        title="Daily Attendance"
        subtitle="Manage and track student daily attendance records"
        icon={CalendarCheck}
        action={
          <div className="flex items-center gap-4">
            <input
              type="date"
              className="ui-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: '0.5rem 1rem' }}
            />
            <Button icon={Save} onClick={handleSave} loading={saving} disabled={loading}>
              Save Records
            </Button>
          </div>
        }
      />

      <div className="dashboard-grid mb-6">
        <Card className="flex flex-col gap-1 items-center justify-center p-4">
          <span className="text-3xl font-bold text-gray-900">{students.length}</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Students</span>
        </Card>
        <Card className="flex flex-col gap-1 items-center justify-center p-4">
          <span className="text-3xl font-bold text-emerald-600">{presentCount}</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Present</span>
        </Card>
        <Card className="flex flex-col gap-1 items-center justify-center p-4">
          <span className="text-3xl font-bold text-red-600">{absentCount}</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Absent</span>
        </Card>
        <Card className="flex flex-col gap-1 items-center justify-center p-4">
          <span className="text-3xl font-bold text-amber-600">{leaveCount}</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">On Leave</span>
        </Card>
      </div>

      <Card noPadding>
        <Table 
          columns={columns}
          data={students}
          keyField="_id"
          loading={loading}
          emptyMessage="No students found."
        />
      </Card>
    </div>
  );
};

export default AttendancePage;
