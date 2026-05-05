import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../components/constant';
const StudentAttendance = () => {
  const [statusMsg, setStatusMsg] = useState("");
  const [isMarked, setIsMarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const today = new Date().toDateString();

  // 1. Check if session exists on load
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert("Session expired. Please login again.");
      navigate('/login');
    }
  }, [navigate]);

  // 2. Mark Attendance Function
  const markAttendance = async () => {
    const userStr = localStorage.getItem('user');
    const user = JSON.parse(userStr);

    // Student ID handle karein
    const finalId = user.student_id || user.user_id;

    setLoading(true);
    setStatusMsg("");

    const formData = new FormData();
    formData.append("student_id", finalId);
    formData.append("status", "Present");

    try {
      const response = await fetch(`${BASE_URL}/student/mark-attendance`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        alert("Attendance Marked Successfully!");
        setIsMarked(true);
        setStatusMsg("Success! Your presence is recorded.");
      } else {
        setStatusMsg(` ${result.message || "Failed to mark."}`);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("Server connection failed!");
    } finally {
      setLoading(false);
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
        <Link to="/login" className="text-danger mt-5" style={linkStyle}>Logout</Link>
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