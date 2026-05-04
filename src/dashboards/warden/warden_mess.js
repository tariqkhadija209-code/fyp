import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../components/constant';

const WardenMess = () => {
  const [menu, setMenu] = useState([]);
  const [formData, setFormData] = useState({ day: 'Monday', type: 'Breakfast', dish: '' });
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();

  // 1. Menu Load Karein
  const loadMenu = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/warden/menu`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMenu(data);
    } catch (err) {
      console.error("Menu load error:", err);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) navigate('/login');
    loadMenu();
  }, [navigate]);

  // 2. Form Submit (Update Menu)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const bodyData = new FormData();
    bodyData.append("day", formData.day);
    bodyData.append("type", formData.type);
    bodyData.append("dish", formData.dish);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/warden/update-mess`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: bodyData
      });

      if (res.ok) {
        alert("Menu Updated Successfully!");
        setFormData({ ...formData, dish: '' }); // Sirf dish field clear karein
        loadMenu(); // Table ko refresh karein baghair page reload kiye
      }
    } catch (err) {
      alert("Error updating menu!");
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
        <h4 className="text-center py-4 text-white fw-bold">Warden Panel</h4>
        <Link to="/warden/dashboard" style={linkStyle}>Overview</Link>
        <Link to="/warden/attendance" style={linkStyle}>View Attendance</Link>
        <Link to="/warden/mess" style={{ ...linkStyle, background: '#f39c12', color: 'white' }}>Manage Mess</Link>
        <Link to="/login" className="text-danger mt-5" style={linkStyle} onClick={() => {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }}>
          Logout
        </Link>
      </div>

      {/* Main Content */}
      <div style={{ padding: '30px', width: '100%', minHeight: '100vh', background: '#f8f9fa' }} className="dashboard-content">
        <h3 className="fw-bold mb-4">Update Mess Menu</h3>

        {/* Update Form Card */}
        <div className="card p-4 border-0 shadow-sm mb-4 rounded-4">
          <form onSubmit={handleSubmit} className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label small fw-bold">Select Day</label>
              <select
                className="form-select"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold">Meal Type</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-bold">Dish Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Dish Name"
                value={formData.dish}
                onChange={(e) => setFormData({ ...formData, dish: e.target.value })}
                required
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-warning w-100 fw-bold shadow-sm" disabled={loading}>
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </div>

        {/* Menu Table */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <table className="table table-hover align-middle mb-0 text-center">
            <thead className="table-dark">
              <tr style={{ height: '50px' }}>
                <th>Day</th>
                <th>Meal</th>
                <th>Dish Name</th>
              </tr>
            </thead>
            <tbody>
              {menu.length === 0 ? (
                <tr><td colSpan="3" className="py-4 text-muted">No menu data available.</td></tr>
              ) : (
                menu.map((m, index) => (
                  <tr key={index} style={{ height: '55px' }}>
                    <td className="fw-bold">{m.day_of_week}</td>
                    <td><span className="badge bg-light text-primary border">{m.meal_type}</span></td>
                    <td className="text-dark">{m.dish_name}</td>
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

// Styles
const sidebarStyle = { height: '100vh', background: '#34495e', color: 'white', width: '250px' };
const linkStyle = { color: '#ecf0f1', textDecoration: 'none', display: 'block', padding: '15px 20px', borderBottom: '1px solid #2c3e50', transition: '0.3s' };

export default WardenMess;