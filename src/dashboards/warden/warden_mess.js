import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '../../store/slices/authSlice';
import { useGetMenuQuery, useUpdateMessMutation } from '../../store/api/wardenApi';
import Loader from '../../components/Loader';

const WardenMess = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ day: 'Monday', type: 'Breakfast', dish: '' });
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // RTK Query for fetching and updating menu
  const { data: menu = [], isLoading: menuLoading } = useGetMenuQuery();
  const [updateMess, { isLoading: loading }] = useUpdateMessMutation();

  const [sortConfig, setSortConfig] = useState({ key: 'day_of_week', direction: 'asc' });

  const dayOrder = {
    'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
    'Friday': 5, 'Saturday': 6, 'Sunday': 7
  };

  const sortedMenu = [...menu].sort((a, b) => {
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];

    if (sortConfig.key === 'day_of_week') {
      aVal = dayOrder[aVal] || 99;
      bVal = dayOrder[bVal] || 99;
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (menuLoading) return <Loader />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await updateMess({
        day: formData.day,
        type: formData.type,
        dish: formData.dish
      }).unwrap();

      if (result.status === "success") {
        alert("Menu Updated Successfully!");
        setFormData({ ...formData, dish: '' });
      }
    } catch (err) {
      console.error("Update mess error:", err);
      alert("Error updating menu!");
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
        <button onClick={handleLogout} className="btn text-danger mt-5 w-100 text-start ps-4 border-0 shadow-none" style={linkStyle}>
          Logout
        </button>
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
                <th onClick={() => requestSort('day_of_week')} style={{ cursor: 'pointer' }}>
                  Day {sortConfig.key === 'day_of_week' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('meal_type')} style={{ cursor: 'pointer' }}>
                  Meal {sortConfig.key === 'meal_type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('dish_name')} style={{ cursor: 'pointer' }}>
                  Dish Name {sortConfig.key === 'dish_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedMenu.length === 0 ? (
                <tr><td colSpan="3" className="py-4 text-muted">No menu data available.</td></tr>
              ) : (
                sortedMenu.map((m, index) => (
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