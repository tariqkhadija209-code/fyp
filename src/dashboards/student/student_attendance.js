import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '../../store/slices/authSlice';
import { useMarkAttendanceMutation, useGetAttendanceStatusQuery } from '../../store/api/studentApi';
import Loader from '../../components/Loader';

const StudentAttendance = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [statusMsg, setStatusMsg] = useState("");
  const navigate = useNavigate();

  // Check if attendance is already marked today
  const { data: statusData, isLoading: isStatusLoading } = useGetAttendanceStatusQuery(user?.student_id, {
    skip: !user?.student_id,
  });

  const [markAttendanceMutation, { isLoading: loading }] = useMarkAttendanceMutation();

  const today = new Date().toDateString();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (isStatusLoading) return <Loader />;

  const isMarked = statusData?.is_marked || false;

  const markAttendance = async () => {
    const finalId = user?.student_id || user?.user_id;
    setStatusMsg("");

    try {
      const result = await markAttendanceMutation({
        student_id: finalId,
        status: "Present"
      }).unwrap();

      if (result.status === "success") {
        alert("Attendance Marked Successfully!");
        setStatusMsg("Success! Your presence is recorded.");
      } else {
        setStatusMsg(` ${result.message || "Failed to mark."}`);
      }
    } catch (error) {
      console.error("Mark attendance error:", error);
      alert("Server connection failed!");
    }
  };

  return (
    <div className="d-flex">
      {/* Sidebar Section */}
      <div style={sidebarStyle} className="sidebar shadow">
        <h4 className="text-center py-4 text-white">Student Panel</h4>
        <Link to="/student/dashboard" style={linkStyle}>Home</Link>
        <Link to="/student/attendance" style={{ ...linkStyle, background: '#0d6efd', color: 'white' }}>Attendance</Link>
        <Link to="/student/mess" style={linkStyle}>Mess Menu</Link>
        <Link to="/student/fees" style={linkStyle}>Fee Status</Link>
        <Link to="/student/complaints" style={linkStyle}>My Complaints</Link>
        <button onClick={handleLogout} className="btn text-danger mt-5 w-100 text-start ps-4 border-0 shadow-none" style={linkStyle}>
          Logout
        </button>
      </div>

      {/* Main Content Section */}
      <div style={{ marginLeft: '250px', padding: '30px', width: '100%', minHeight: '100vh', background: '#f0f2f5' }}>
        <h3 className="fw-bold">Daily Presence</h3>

        <div className="card p-5 text-center shadow-sm border-0 mt-4 rounded-4 bg-white">
          <h4 className="text-muted mb-4">{today}</h4>

          <div id="attendance-area">
            <button
              className={`btn btn-lg w-50 mx-auto rounded-pill fw-bold ${isMarked ? 'btn-secondary disabled' : 'btn-success'}`}
              onClick={markAttendance}
              disabled={isMarked || loading}
            >
              {loading ? "Syncing with Server..." : isMarked ? "Already Marked" : "Mark Me Present"}
            </button>
          </div>

          {statusMsg && (
            <div className={`mt-4 fw-bold ${statusMsg.includes('❌') ? 'text-danger' : 'text-success'}`}>
              {statusMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles for Consistency
const sidebarStyle = {
  height: '100vh',
  background: '#1c2938',
  color: 'white',
  position: 'fixed',
  width: '250px',
};

const linkStyle = {
  color: '#adb5bd',
  textDecoration: 'none',
  display: 'block',
  padding: '15px 20px',
  borderBottom: '1px solid #2c3e50',
  transition: '0.3s'
};

export default StudentAttendance;