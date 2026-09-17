import { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { studentService } from '../../services/studentService';

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
      // 1. Fetch all students (simplified for roster, realistically would use pagination/rooms)
      const stRes = await studentService.getAll({ limit: 200 });
      const allStudents = stRes.data.data;
      setStudents(allStudents);

      // 2. Fetch attendance for selected date
      const atRes = await attendanceService.getAll({ date: selectedDate });
      
      // Map existing attendance records
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

      await attendanceService.batchMark({
        date: selectedDate,
        records
      });

      showToast('Attendance saved successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save attendance.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Attendance</h1>
          <p className="page-subtitle">Record and view student attendance</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="date"
            className="form-input form-input-plain"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: 'auto', padding: '0.45rem 1rem' }}
          />
          <button className="btn-primary btn-sm" onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Saving…' : 'Save Attendance'}
          </button>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="table-loading"><div className="spinner" /></div>
        ) : students.length === 0 ? (
          <div className="table-empty">
            <p>No students found in the system.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>Attendance Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const currentStatus = attendanceDict[student._id] || '';
                return (
                  <tr key={student._id}>
                    <td className="td-bold">{student.name}</td>
                    <td className="td-muted">{student.rollNo}</td>
                    <td>
                      <div className="action-btns" style={{ gap: '0.5rem' }}>
                        <button
                          className={`btn-ghost btn-sm ${currentStatus === 'Present' ? 'badge-green' : ''}`}
                          style={currentStatus === 'Present' ? { border: '1px solid #10b981', color: '#10b981', background: 'rgba(16,185,129,0.1)' } : {}}
                          onClick={() => handleStatusChange(student._id, 'Present')}
                        >
                          Present
                        </button>
                        <button
                          className={`btn-ghost btn-sm ${currentStatus === 'Absent' ? 'badge-red' : ''}`}
                          style={currentStatus === 'Absent' ? { border: '1px solid #ef4444', color: '#ef4444', background: 'rgba(239,68,68,0.1)' } : {}}
                          onClick={() => handleStatusChange(student._id, 'Absent')}
                        >
                          Absent
                        </button>
                        <button
                          className={`btn-ghost btn-sm ${currentStatus === 'Leave' ? 'badge-amber' : ''}`}
                          style={currentStatus === 'Leave' ? { border: '1px solid #f59e0b', color: '#f59e0b', background: 'rgba(245,158,11,0.1)' } : {}}
                          onClick={() => handleStatusChange(student._id, 'Leave')}
                        >
                          Leave
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
