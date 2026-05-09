import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { useGetAdminComplaintsQuery, useResolveComplaintMutation } from '../../store/api/adminApi';
import Loader from '../../components/Loader';

const AdminComplaints = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Using RTK Query for fetching and automatic caching
  const { data: complaints = [], isLoading } = useGetAdminComplaintsQuery();

  // Using RTK Query mutation for resolving complaints
  const [resolveComplaintMutation] = useResolveComplaintMutation();

  if (isLoading) return <Loader />;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const resolveComplaint = async (id) => {
    if (window.confirm("Mark this as Resolved? It will be removed from records.")) {
      try {
        const result = await resolveComplaintMutation(id).unwrap();
        if (result.status === "success") {
          // No need to manually refresh, RTK Query handles it via tag invalidation
        }
      } catch (error) {
        console.error("Resolve error:", error);
        alert("Failed to resolve complaint.");
      }
    }
  };

  return (
    <div className="d-flex">
      {/* Sidebar Section */}
      <div style={sidebarStyle} className="sidebar shadow">
        <h4 className="text-center py-4 text-white border-bottom border-secondary">Admin Panel</h4>
        <Link to="/admin/dashboard" style={linkStyle}><i className="bi bi-speedometer2 me-2"></i> Dashboard</Link>
        <Link to="/admin/rooms" style={linkStyle}><i className="bi bi-door-open me-2"></i> Manage Rooms</Link>
        <Link to="/admin/fees" style={linkStyle}><i className="bi bi-cash-coin me-2"></i> Fee Verification</Link>
        <Link to="/admin/complaints" style={{ ...linkStyle, background: '#1abc9c', color: 'white' }}>
          <i className="bi bi-chat-left-text me-2"></i> Complaints
        </Link>
        <button onClick={handleLogout} className="btn text-danger mt-5 w-100 text-start ps-4 border-0 shadow-none" style={linkStyle}>
          <i className="bi bi-box-arrow-left me-2"></i> Logout
        </button>
      </div>

      {/* Main Content Section */}
      <div style={{ marginLeft: '250px', padding: '30px', width: '100%', minHeight: '100vh', background: '#f8f9fa' }}>
        <h2 className="mb-4 fw-bold">Student Complaints</h2>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 py-3">Student Name</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Description</th>
                  <th className="py-3">Priority</th>
                  <th className="py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      <i className="bi bi-emoji-smile d-block fs-1 mb-2"></i>
                      All issues resolved! No pending complaints.
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => (
                    <tr key={c.complaint_id}>
                      <td className="ps-4">
                        <strong>{c.student_name || 'Student'}</strong>
                        <br />
                        <small className="text-muted">ID: {c.student_id}</small>
                      </td>
                      <td><span className="badge bg-light text-dark border">{c.complaint_type}</span></td>
                      <td style={{ maxWidth: "300px" }}>{c.description}</td>
                      <td>
                        <span className={`badge ${c.priority === 'High' ? 'bg-danger' : 'bg-warning'}`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-outline-success btn-sm rounded-pill px-3"
                          onClick={() => resolveComplaint(c.complaint_id)}
                        >
                          <i className="bi bi-check2-circle me-1"></i> Resolve
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusing same Sidebar Styles for Consistency
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

export default AdminComplaints;