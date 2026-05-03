import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const WardenAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Session Check (Sirf Warden hi access kar sakay)
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'warden') {
      // navigate('/login'); 
      // Note: Agar aapka role check 'warden' hai toh upar wali line uncomment kar dein
    }

    // 2. Fetch All Attendance for Warden
    const fetchAttendance = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/warden/attendance');
        const data = await res.json();
        console.log("Warden Attendance Data:", data);
        setAttendance(data);
      } catch (error) {
        console.error("Error loading attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [navigate]);

  return (
    <div className="d-flex">
      {/* Sidebar - Warden Theme */}
      <div style={sidebarStyle} className="sidebar shadow">
        <h4 className="text-center py-4 text-white fw-bold">Warden Panel</h4>
        <Link to="/warden/dashboard" style={linkStyle}>Overview</Link>
        <Link to="/warden/attendance" style={{ ...linkStyle, background: '#f39c12', color: 'white' }}>View Attendance</Link>
        <Link to="/warden/mess" style={linkStyle}>Manage Mess</Link>
        <Link to="/login" className="text-danger mt-5" style={linkStyle}>Logout</Link>
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