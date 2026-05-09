import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useGetAdminStatsQuery } from '../../store/api/adminApi';
import Loader from '../../components/Loader';

const AdminDashboard = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Using RTK Query for automatic data fetching and caching
  const { data: statsData, isLoading } = useGetAdminStatsQuery();

  if (isLoading) return <Loader />;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const stats = statsData || {
    total_rooms: '--',
    pending_complaints: '--',
    total_revenue: '--'
  };

  return (
    <div className="d-flex">
      {/* Sidebar Toggle Button */}
      <button className="sidebar-toggle shadow" onClick={() => setShowSidebar(!showSidebar)}>
        <i className={`bi bi-${showSidebar ? 'x' : 'list'}`}></i>
      </button>

      {/* 1. Sidebar (React Style) */}
      <div style={sidebarStyle} className={`sidebar shadow ${showSidebar ? 'show' : ''}`}>
        <h4 className="text-center py-4 text-white border-bottom border-secondary">Admin Panel</h4>
        <Link to="/admin/dashboard" style={linkStyle}><i className="bi bi-speedometer2 me-2"></i> Overview</Link>
        <Link to="/admin/rooms" style={linkStyle}><i className="bi bi-door-open me-2"></i> Room Management</Link>
        <Link to="/admin/fees" style={linkStyle}><i className="bi bi-cash-coin me-2"></i> Fee Verification</Link>
        <Link to="/admin/complaints" style={linkStyle}><i className="bi bi-exclamation-triangle me-2"></i> Complaints View</Link>
        <button onClick={handleLogout} className="btn text-danger mt-5 w-100 text-start ps-4 border-0 shadow-none" style={linkStyle}>
          <i className="bi bi-box-arrow-left me-2"></i> Logout
        </button>
      </div>

      {/* 2. Main Content */}
      <div style={{
        padding: '30px',
        flexGrow: 1,
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
      }} className="dashboard-content">
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