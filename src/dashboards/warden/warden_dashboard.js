import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../components/constant';

const WardenDashboard = () => {
  const [stats, setStats] = useState({ present_today: '--' });
  const [showSidebar, setShowSidebar] = useState(false);
  const [notif, setNotif] = useState({ title: '', message: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const currentDate = new Date().toLocaleDateString();

  useEffect(() => {
    // 1. Session Check
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }

    // 2. Load Stats (Present Today count)
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/warden/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Stats Error:", err);
      }
    };

    fetchStats();
  }, [navigate]);

  // 3. Send Notification Logic
  const handleNotifSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    setLoading(true);

    const formData = new FormData();
    formData.append("sender_id", user.user_id || user.id);
    formData.append("title", notif.title);
    formData.append("message", notif.message);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/warden/send-notification`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        alert("Notification sent successfully!");
        setNotif({ title: '', message: '' }); // Clear form
      } else {
        alert("Failed to send notification.");
      }
    } catch (err) {
      alert("Server error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex">
      {/* Sidebar Toggle Button */}
      <button className="sidebar-toggle shadow" onClick={() => setShowSidebar(!showSidebar)}>
        <i className={`bi bi-${showSidebar ? 'x' : 'list'}`}></i>
      </button>

      {/* Sidebar - Warden Theme */}
      <div style={sidebarStyle} className={`sidebar shadow ${showSidebar ? 'show' : ''}`}>
        <h4 className="text-center py-4 text-white">Warden Panel</h4>
        <Link to="/warden/dashboard" style={{ ...linkStyle, background: '#e67e22', color: 'white' }}>
          <i className="bi bi-speedometer2 me-2"></i> Overview
        </Link>
        <Link to="/warden/attendance" style={linkStyle}><i className="bi bi-calendar-check me-2"></i> Attendance</Link>
        <Link to="/warden/mess" style={linkStyle}><i className="bi bi-egg-fried me-2"></i> Manage Mess</Link>
        <Link to="/login" className="text-danger mt-5" style={linkStyle} onClick={() => {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }}>
          <i className="bi bi-box-arrow-left me-2"></i> Logout
        </Link>
      </div>

      {/* Main Content */}
      <div style={{ padding: '30px', width: '100%', minHeight: '100vh', background: '#f4f7f6' }} className="dashboard-content">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">Warden Dashboard</h2>
          <span className="badge bg-secondary p-2 shadow-sm">{currentDate}</span>
        </div>

        <div className="row g-4">
          {/* Stat Card */}
          <div className="col-md-4">
            <div className="card stat-card p-4 h-100 border-0">
              <h6 className="text-muted fw-bold text-uppercase small">Present Today</h6>
              <h2 className="text-primary display-5 fw-bold">{stats.present_today}</h2>
              <p className="mb-0 text-muted small">Total students marked present.</p>
            </div>
          </div>

          {/* Notification Form Card */}
          <div className="col-md-8">
            <div className="card p-4 border-0 shadow-sm rounded-4 h-100">
              <h5 className="fw-bold mb-3"><i className="bi bi-megaphone me-2 text-warning"></i> Post Student Notification</h5>
              <form onSubmit={handleNotifSubmit}>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Title (e.g. Mess Timing Change)"
                  value={notif.title}
                  onChange={(e) => setNotif({ ...notif, title: e.target.value })}
                  required
                />
                <textarea
                  className="form-control mb-3"
                  rows="3"
                  placeholder="Write message here..."
                  value={notif.message}
                  onChange={(e) => setNotif({ ...notif, message: e.target.value })}
                  required
                ></textarea>
                <button type="submit" className="btn btn-warning w-100 fw-bold text-white shadow-sm" disabled={loading}>
                  {loading ? "Broadcasting..." : "Broadcast to Students"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal Styling
const sidebarStyle = { height: '100vh', background: '#2c3e50', color: 'white', width: '250px' };
const linkStyle = { color: '#bdc3c7', textDecoration: 'none', display: 'block', padding: '15px 20px', borderBottom: '1px solid #34495e', transition: '0.3s' };
//const statCardStyle = { background: 'white', borderLeft: '5px solid #e67e22' };

export default WardenDashboard;