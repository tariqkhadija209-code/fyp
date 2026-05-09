import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '../../store/slices/authSlice';
import { useGetWardenAttendanceQuery } from '../../store/api/wardenApi';
import Loader from '../../components/Loader';

const WardenAttendance = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // RTK Query for fetching all attendance records
  const { data: attendance = [], isLoading: loading } = useGetWardenAttendanceQuery();

  useEffect(() => {
    if (!user || user.role !== 'warden') {
      // navigate('/login');
    }
  }, [user, navigate]);

  if (loading) return <Loader />;

  return (
    <div className="d-flex">
      {/* Sidebar - Warden Theme */}
      <div style={sidebarStyle} className="sidebar shadow">
        <h4 className="text-center py-4 text-white fw-bold">Warden Panel</h4>
        <Link to="/warden/dashboard" style={linkStyle}>Overview</Link>
        <Link to="/warden/attendance" style={{ ...linkStyle, background: '#f39c12', color: 'white' }}>View Attendance</Link>
        <Link to="/warden/mess" style={linkStyle}>Manage Mess</Link>
        <button onClick={handleLogout} className="btn text-danger mt-5 w-100 text-start ps-4 border-0 shadow-none" style={linkStyle}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '250px', padding: '30px', width: '100%', minHeight: '100vh', background: '#f8f9fa' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">Daily Attendance Records</h3>
          <span className="badge bg-dark px-3 py-2">Total Records: {attendance.length}</span>
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <table className="table table-hover align-middle mb-0 text-center">
            <thead className="table-dark">
              <tr style={{ height: '50px' }}>
                <th>Date</th>
                <th>Student Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="py-5">
                    <div className="spinner-border text-warning" role="status"></div>
                    <p className="mt-2 text-muted">Fetching records...</p>
                  </td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr><td colSpan="3" className="py-5 text-muted">No attendance marked yet today.</td></tr>
              ) : (
                attendance.map((a, index) => (
                  <tr key={index} style={{ height: '60px' }}>
                    <td className="text-muted">{a.marked_date}</td>
                    <td className="fw-bold">{a.full_name || a.student_id || 'Unknown'}</td>
                    <td>
                      <span className={`badge rounded-pill px-3 py-2 ${a.status === 'Present' ? 'bg-success' : 'bg-danger'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Internal Styling
const sidebarStyle = {
  height: '100vh',
  background: '#34495e',
  color: 'white',
  position: 'fixed',
  width: '250px',
};

const linkStyle = {
  color: '#ecf0f1',
  textDecoration: 'none',
  display: 'block',
  padding: '15px 20px',
  borderBottom: '1px solid #2c3e50',
  transition: '0.3s'
};

export default WardenAttendance;