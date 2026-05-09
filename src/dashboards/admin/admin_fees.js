import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { useGetFeesSummaryQuery, useGenerateFeesMutation, useApproveFeeMutation } from '../../store/api/adminApi';
import Loader from '../../components/Loader';
import { useState } from 'react';

const AdminFees = () => {
  const [genData, setGenData] = useState({ amount: '', month: '', type: 'Hostel Fee' });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // RTK Query hooks
  const { data: fees = [], isLoading } = useGetFeesSummaryQuery();
  const [generateFeesMutation] = useGenerateFeesMutation();
  const [approveFeeMutation] = useApproveFeeMutation();

  if (isLoading) return <Loader />;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const generateFeesNow = async () => {
    if (!genData.amount || !genData.month) {
      alert("Please fill all fields");
      return;
    }

    try {
      const result = await generateFeesMutation({
        billing_month: genData.month,
        amount: genData.amount
      }).unwrap();

      if (result.status === "success") {
        alert(result.message || "Fees Generated Successfully");
      }
    } catch (err) {
      console.error("Generate fees error:", err);
      alert("Error: " + (err?.data?.detail || "Validation Failed"));
    }
  };

  const approveFee = async (id) => {
    try {
      const result = await approveFeeMutation(id).unwrap();
      if (result.status === "success") {
        // Automatically refetched due to tags
      }
    } catch (err) {
      console.error("Approval failed", err);
      alert("Failed to mark fee as paid.");
    }
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div style={sidebarStyle} className="sidebar shadow">
        <h4 className="text-center py-4 text-white border-bottom border-secondary">Admin Panel</h4>
        <Link to="/admin/dashboard" style={linkStyle}>Overview</Link>
        <Link to="/admin/rooms" style={linkStyle}>Rooms</Link>
        <Link to="/admin/fees" style={{ ...linkStyle, background: '#007bff', color: 'white' }}>Fees</Link>
        <Link to="/admin/complaints" style={linkStyle}>Complaints</Link>
        <button onClick={handleLogout} className="btn text-danger mt-5 w-100 text-start ps-4 border-0 shadow-none" style={linkStyle}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '250px', padding: '30px', width: '100%', minHeight: '100vh' }}>
        <h3 className="fw-bold mb-4">Fee Management</h3>

        {/* Generate Fee Card */}
        <div className="card border-0 shadow-sm p-4 mb-5 rounded-4 bg-white">
          <h5 className="mb-3 text-secondary fw-bold">Generate Monthly Fees</h5>
          <div className="row g-3">
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Amount (e.g. 10000)"
                value={genData.amount}
                onChange={(e) => setGenData({ ...genData, amount: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Month (e.g. May 2026)"
                value={genData.month}
                onChange={(e) => setGenData({ ...genData, month: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <select className="form-select" onChange={(e) => setGenData({ ...genData, type: e.target.value })}>
                <option value="Hostel Fee">Hostel Fee</option>
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-success w-100 fw-bold" onClick={generateFeesNow}>Generate All</button>
            </div>
          </div>
        </div>

        {/* Fee Table */}
        <div className="table-responsive">
          <table className="table bg-white shadow-sm align-middle text-center rounded-3 overflow-hidden">
            <thead className="table-dark">
              <tr>
                <th className="py-3">Student</th>
                <th>Month</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {fees.length > 0 ? (
                fees.map((f) => (
                  <tr key={f.fee_id}>
                    <td><b>{f.full_name || 'Student'}</b></td>
                    <td>{f.billing_month || '---'}</td>
                    <td>Rs. {f.amount}</td>
                    <td>
                      <span className={`badge ${f.status === 'Paid' ? 'bg-success' : 'bg-danger'}`}>
                        {f.status}
                      </span>
                    </td>
                    <td>
                      {f.status === 'Paid' ? (
                        <small className="text-muted">Payment Cleared</small>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-primary rounded-pill px-3"
                          onClick={() => approveFee(f.fee_id)}
                        >
                          Mark as Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-4 text-muted">No fee records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Styles
const sidebarStyle = { height: '100vh', background: '#2C3E50', color: 'white', position: 'fixed', width: '250px' };
const linkStyle = { color: '#bdc3c7', textDecoration: 'none', display: 'block', padding: '15px 20px', borderBottom: '1px solid #34495e' };

export default AdminFees;