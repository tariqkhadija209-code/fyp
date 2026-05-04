import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../components/constant';

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [roomDetails, setRoomDetails] = useState({ no: 'Checking...', block: '---', wing: 'Loading...' });
  const [notifications, setNotifications] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Session Check
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(storedUser);

    // 2. Load Data
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch Room Details
        const roomRes = await fetch(`${BASE_URL}/student/room-details/${storedUser.student_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const roomData = await roomRes.json();

        if (roomData.status === "success") {
          setRoomDetails({
            no: roomData.room_no,
            block: roomData.block,
            wing: roomData.wing || "General"
          });
        } else {
          setRoomDetails({ no: "Pending Allocation", block: "---", wing: "---" });
        }

        // Fetch Notifications (Synchronization point)
        const notifRes = await fetch(`${BASE_URL}/student/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const notifData = await notifRes.json();

        // Ensure notifData is an array before setting state
        setNotifications(Array.isArray(notifData) ? notifData : []);

      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      }
    };

    loadDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="d-flex">
      {/* Sidebar Toggle Button */}
      <button className="sidebar-toggle shadow" onClick={() => setShowSidebar(!showSidebar)}>
        <i className={`bi bi-${showSidebar ? 'x' : 'list'}`}></i>
      </button>

      {/* Sidebar Section */}
      <div style={sidebarStyle} className={`sidebar shadow ${showSidebar ? 'show' : ''}`}>
        <h4 className="text-center py-4 text-white">Student Panel</h4>
        <Link to="/student/dashboard" style={{ ...linkStyle, background: '#3498db', color: 'white' }}>
          <i className="bi bi-house-door me-2"></i> Home
        </Link>
        <Link to="/student/attendance" style={linkStyle}><i className="bi bi-calendar-check me-2"></i> Attendance</Link>
        <Link to="/student/mess" style={linkStyle}><i className="bi bi-egg-fried me-2"></i> Mess Menu</Link>
        <Link to="/student/fees" style={linkStyle}><i className="bi bi-credit-card me-2"></i> Fee Status</Link>
        <Link to="/student/complaints" style={linkStyle}><i className="bi bi-chat-dots me-2"></i> My Complaints</Link>
        <button onClick={handleLogout} className="btn text-danger mt-5 w-100 text-start ps-4 border-0">
          <i className="bi bi-box-arrow-left me-2"></i> Logout
        </button>
      </div>

      {/* Main Content Section */}
      <div style={{ padding: '30px', width: '100%', minHeight: '100vh', background: '#f0f2f5' }} className="dashboard-content">

        {/* Welcome Card */}
        <div className="card welcome-card p-4 mb-4 shadow border-0" style={welcomeCardStyle}>
          <h2 className="fw-bold">Welcome, {user ? user.username : 'Student'}!</h2>
          <p className="mb-0">Always stay updated with hostel announcements.</p>
        </div>

        <div className="row">
          {/* Notifications Section - Left Side */}
          <div className="col-md-7">
            <div className="card p-4 border-0 shadow-sm rounded-4">
              <h5 className="fw-bold"><i className="bi bi-bell me-2 text-primary"></i> Recent Notifications</h5>
              <hr />
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <p className="text-muted small">No new alerts from Warden.</p>
                ) : (
                  notifications.map((n, index) => (
                    <div key={index} className="mb-3 p-3 rounded-3 border-start border-4 border-primary bg-light shadow-sm">
                      <div className="fw-bold text-primary">{n.title}</div>
                      <div className="small text-dark">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Room Info Section - Right Side */}
          <div className="col-md-5">
            <div className="card p-4 border-0 shadow-sm rounded-4 mb-4">
              <h6 className="text-primary fw-bold"><i className="bi bi-door-open-fill me-2"></i> Room Details</h6>
              <hr />
              <p className="small mb-2">
                <strong>Room No:</strong>
                <span className={`badge ms-2 ${roomDetails.no.includes('Pending') ? 'bg-warning text-dark' : 'bg-success'}`}>
                  {roomDetails.no}
                </span>
              </p>
              <p className="small mb-2"><strong>Block:</strong> <span className="text-muted">{roomDetails.block}</span></p>
              <p className="small mb-0"><strong>Wing:</strong> <span className="text-muted">{roomDetails.wing}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal Styling remains same
const sidebarStyle = { height: '100vh', background: '#1c2938', color: 'white', width: '250px' };
const linkStyle = { color: '#adb5bd', textDecoration: 'none', display: 'block', padding: '15px 20px', borderBottom: '1px solid #2c3e50', transition: '0.3s' };
const welcomeCardStyle = { background: 'linear-gradient(135deg, #3498db, #1abc9c)', color: 'white', borderRadius: '15px' };

export default StudentDashboard;