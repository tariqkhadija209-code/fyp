import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '../../store/slices/authSlice';
import { useAddComplaintMutation } from '../../store/api/studentApi';

const StudentComplaints = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [complaintData, setComplaintData] = useState({ type: '', desc: '' });
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const [addComplaint, { isLoading: loading }] = useAddComplaintMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Session expired. Please login again.");
      navigate('/login');
      return;
    }

    const finalStudentId = user.student_id || user.id;

    try {
      const result = await addComplaint({
        type: complaintData.type,
        desc: complaintData.desc,
        student_id: finalStudentId
      }).unwrap();

      if (result.status === "success") {
        alert(`Success! AI detected this as ${result.detected_priority || 'Medium'} priority.`);
        setComplaintData({ type: '', desc: '' });
      } else {
        alert("Oopsy! " + (result.message || "Something went wrong"));
      }
    } catch (err) {
      console.error("Add complaint error:", err);
      alert("Failed to connect to backend. Server on hai?");
    }
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div style={sidebarStyle} className="sidebar shadow">
        <h4 className="text-center py-4 text-white">Student Panel</h4>
        <Link to="/student/dashboard" style={linkStyle}>Home</Link>
        <Link to="/student/attendance" style={linkStyle}>Attendance</Link>
        <Link to="/student/mess" style={linkStyle}>Mess Menu</Link>
        <Link to="/student/fees" style={linkStyle}>Fee Status</Link>
        <Link to="/student/complaints" style={{ ...linkStyle, background: '#0d6efd', color: 'white' }}>My Complaints</Link>
        <button onClick={handleLogout} className="btn text-danger mt-5 w-100 text-start ps-4 border-0 shadow-none" style={linkStyle}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '250px', padding: '30px', width: '100%', minHeight: '100vh', background: '#f0f2f5' }}>
        <h3 className="fw-bold mb-4">Submit a New Complaint</h3>

        <div className="card p-4 border-0 shadow-sm rounded-4 bg-white" style={{ maxWidth: '600px' }}>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Issue Type</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Water, Mess, Electricity"
                value={complaintData.type}
                onChange={(e) => setComplaintData({ ...complaintData, type: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Description</label>
              <textarea
                className="form-control"
                placeholder="Describe your issue in detail..."
                rows="4"
                value={complaintData.desc}
                onChange={(e) => setComplaintData({ ...complaintData, desc: e.target.value })}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 fw-bold rounded-pill"
              disabled={loading}
            >
              {loading ? "Analyzing with AI..." : "Submit Complaint"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Common Sidebar Styles
const sidebarStyle = { height: '100vh', background: '#1c2938', color: 'white', position: 'fixed', width: '250px' };
const linkStyle = { color: '#adb5bd', textDecoration: 'none', display: 'block', padding: '15px 20px', borderBottom: '1px solid #2c3e50', transition: '0.3s' };

export default StudentComplaints;