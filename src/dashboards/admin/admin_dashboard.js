import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  // State for dynamic stats
  const [stats, setStats] = useState({
    total_rooms: '--',
    pending_complaints: '--',
    total_revenue: '--'
  });

  // API Call function (loadStats ka alternative)
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/admin/stats');
        const data = await res.json();
        setStats(data);
      } catch (e) {
        console.error("Stats load failed");
      }
    };
    loadStats();
  }, []);

  // AI Allocation logic
  const triggerAIAllocation = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/admin/allocate-room-ai/${id}`, { method: 'POST' });
      const data = await res.json();
      alert(data.message);
      window.location.reload();
    } catch (e) {
      alert("AI Allocation service down.");
    }
  };

  return (
    <div className="d-flex">
      {/* 1. Sidebar (React Style) */}
      <div style={sidebarStyle} className="sidebar shadow">
        <h4 className="text-center py-4 text-white border-bottom border-secondary">Admin Panel</h4>
        <Link to="/admin/dashboard" style={linkStyle}><i className="bi bi-speedometer2 me-2"></i> Overview</Link>
        <Link to="/admin/rooms" style={linkStyle}><i className="bi bi-door-open me-2"></i> Room Management</Link>
        <Link to="/admin/fees" style={linkStyle}><i className="bi bi-cash-coin me-2"></i> Fee Verification</Link>
        <Link to="/admin/complaints" style={linkStyle}><i className="bi bi-exclamation-triangle me-2"></i> Complaints View</Link>
        <Link to="/login" className="text-danger mt-5" style={linkStyle}><i className="bi bi-box-arrow-left me-2"></i> Logout</Link>
      </div>

      {/* 2. Main Content */}
      <div style={{
        marginLeft: '250px',
        padding: '30px',
        flexGrow: 1,
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div className="container-fluid">
          <h2 className="mb-4 fw-bold text-dark">System Overview</h2>

          <div className="row g-4 text-center">
            {/* Card 1: Total Rooms */}
            <div className="col-md-4">
              <div className="card border-0 border-start border-primary border-5 shadow-sm p-4 rounded-4 h-100">
                <h6 className="text-muted text-uppercase small fw-bold">Total Rooms</h6>
                <h2 className="display-6 fw-bold text-primary">{stats.total_rooms}</h2>
              </div>
            </div>

            {/* Card 2: Pending Complaints */}
            <div className="col-md-4">
              <div className="card border-0 border-start border-danger border-5 shadow-sm p-4 rounded-4 h-100">
                <h6 className="text-muted text-uppercase small fw-bold">Pending Complaints</h6>
                <h2 className="display-6 fw-bold text-danger">{stats.pending_complaints}</h2>
              </div>
            </div>

            {/* Card 3: Total Revenue */}
            <div className="col-md-4">
              <div className="card border-0 border-start border-success border-5 shadow-sm p-4 rounded-4 h-100">
                <h6 className="text-muted text-uppercase small fw-bold">Total Revenue</h6>
                <h2 className="display-6 fw-bold text-success">
                  {stats.total_revenue !== '--' ? `Rs. ${stats.total_revenue}` : '--'}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Inline Styles (Taake extra CSS file ki zaroorat na parray)
const sidebarStyle = {
  height: '100vh',
  background: '#2C3E50',
  color: 'white',
  position: 'fixed',
  width: '250px',
};

const linkStyle = {
  color: '#bdc3c7',
  textDecoration: 'none',
  display: 'block',
  padding: '15px 20px',
  borderBottom: '1px solid #34495e',
  transition: '0.3s'
};

export default AdminDashboard;