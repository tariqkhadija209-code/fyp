import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '../../store/slices/authSlice';
import { useGetRoomDetailsQuery, useGetNotificationsQuery } from '../../store/api/studentApi';
import Loader from '../../components/Loader';

const StudentDashboard = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // RTK Query hooks for data fetching
  const { data: roomData, isLoading: isRoomLoading } = useGetRoomDetailsQuery(user?.student_id, {
    skip: !user?.student_id,
  });
  const { data: notificationsData, isLoading: isNotifLoading } = useGetNotificationsQuery();

  if (isRoomLoading || isNotifLoading) return <Loader />;

  const roomDetails = roomData?.status === "success" 
    ? { no: roomData.room_no, block: roomData.block, wing: roomData.wing || "General" }
    : { no: "Pending Allocation", block: "---", wing: "---" };

  const notifications = Array.isArray(notificationsData) ? notificationsData : [];

  const handleLogout = () => {
    dispatch(logout());
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

        {/* Room Pending Alert */}
        {roomData?.status !== "success" && (
          <div className="alert alert-warning border-0 shadow-sm rounded-4 mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Room Status:</strong> Admin has not allocated your room yet. Please check back later.
          </div>
        )}

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