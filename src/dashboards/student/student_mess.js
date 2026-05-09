import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '../../store/slices/authSlice';
import { useGetMenuQuery } from '../../store/api/wardenApi';
import Loader from '../../components/Loader';

const StudentMess = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // RTK Query for fetching menu (sharing wardenApi endpoint)
  const { data: menu = [], isLoading: loading } = useGetMenuQuery();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (loading) return <Loader />;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="d-flex">
      {/* Sidebar Section */}
      <div style={sidebarStyle} className="sidebar shadow">
        <h4 className="text-center py-4 text-white">Student Panel</h4>
        <Link to="/student/dashboard" style={linkStyle}>Home</Link>
        <Link to="/student/attendance" style={linkStyle}>Attendance</Link>
        <Link to="/student/mess" style={{ ...linkStyle, background: '#0d6efd', color: 'white' }}>Mess Menu</Link>
        <Link to="/student/fees" style={linkStyle}>Fee Status</Link>
        <Link to="/student/complaints" style={linkStyle}>My Complaints</Link>
        <button onClick={handleLogout} className="btn text-danger mt-5 w-100 text-start ps-4 border-0 shadow-none" style={linkStyle}>
          Logout
        </button>
      </div>

      {/* Main Content Section */}
      <div style={{ marginLeft: '250px', padding: '30px', width: '100%', minHeight: '100vh', background: '#f0f2f5' }}>
        <h3 className="mb-4 fw-bold"><i className="bi bi-egg-fried me-2 text-primary"></i> Weekly Mess Menu</h3>

        {loading ? (
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2">Loading today's special...</p>
          </div>
        ) : (
          <div className="row g-3">
            {menu.length === 0 ? (
              <div className="col-12">
                <div className="card p-5 text-center border-0 shadow-sm rounded-4">
                  <i className="bi bi-calendar-x text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted">No menu updated by warden yet.</p>
                </div>
              </div>
            ) : (
              menu.map((m, index) => (
                <div className="col-md-4" key={index}>
                  <div className="card menu-card shadow-sm p-3 border-0 rounded-4 bg-white h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="badge bg-info text-dark rounded-pill px-3">{m.day_of_week}</span>
                      <span className="text-primary fw-bold small text-uppercase">{m.meal_type}</span>
                    </div>
                    <h5 className="fw-bold mb-2 text-dark">{m.dish_name}</h5>
                    <div className="mt-auto pt-3 border-top">
                      <small className="text-muted">
                        <i className="bi bi-fire me-1 text-danger"></i>
                        {m.calories || '---'} Calories
                      </small>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Internal Styling
const sidebarStyle = { height: '100vh', background: '#1c2938', color: 'white', position: 'fixed', width: '250px' };
const linkStyle = { color: '#adb5bd', textDecoration: 'none', display: 'block', padding: '15px 20px', borderBottom: '1px solid #2c3e50', transition: '0.3s' };

export default StudentMess;