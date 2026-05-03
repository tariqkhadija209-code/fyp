import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const StudentComplaints = () => {
  const [complaintData, setComplaintData] = useState({ type: '', desc: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. Submit Function
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert("Session expired. Please login again.");
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStr);
    const finalStudentId = user.student_id || user.id;

    if (!finalStudentId) {
      alert("Error: Student ID not found.Please login again.");
      return;
    }

    setLoading(true);

    // Form Data prepare karein (Backend expectations ke mutabiq)
    const formData = new FormData();
    formData.append("type", complaintData.type);
    formData.append("desc", complaintData.desc);
    formData.append("student_id", finalStudentId);

    try {
      const res = await fetch('https://hostelflow-production-e1ce.up.railway.app/student/add-complaint', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data.status === "success") {
        alert(`Success! AI detected this as ${data.detected_priority || 'Medium'} priority.`);
        // Form clear karne ke liye
        setComplaintData({ type: '', desc: '' });
        // Page refresh ki jagah aap list update kar sakti hain, filhal reset karte hain
      } else {
        alert("Oopsy! " + (data.message || "Something went wrong"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend. Server on hai?");
    } finally {
      setLoading(false);
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
        <Link to="/login" className="text-danger mt-5" style={linkStyle}>Logout</Link>
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
                onChange={(e) => setComplaintData({...complaintData, type: e.target.value})}
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
                onChange={(e) => setComplaintData({...complaintData, desc: e.target.value})}
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