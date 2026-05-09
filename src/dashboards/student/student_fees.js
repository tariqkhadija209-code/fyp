import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '../../store/slices/authSlice';
import { useGetStudentFeesQuery, useCreateCheckoutSessionMutation } from '../../store/api/studentApi';
import Loader from '../../components/Loader';

const StudentFees = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // RTK Query for fetching fees
  const { data: fees = [], isLoading: loading } = useGetStudentFeesQuery(user?.student_id, {
    skip: !user?.student_id,
  });

  // RTK Query for creating payment session
  const [createCheckoutSession] = useCreateCheckoutSessionMutation();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }

    if (window.location.search.includes('payment=success')) {
      alert("Transaction Successful: Your records are updated.");
    }
  }, [user, navigate]);

  if (loading) return <Loader />;

  const handlePayment = async (feeId, amount) => {
    if (!feeId || !amount) {
      alert("Payment Error: Missing fee details.");
      return;
    }
    try {
      const result = await createCheckoutSession({ fee_id: feeId, amount }).unwrap();
      if (result.url) {
        window.location.href = result.url;
      } else {
        alert("Gateway Error: Unable to initialize payment.");
      }
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Connection Error: Could not reach the payment server.");
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
        <Link to="/student/fees" style={{ ...linkStyle, background: '#3498db', color: 'white' }}>Fee Status</Link>
        <Link to="/student/complaints" style={linkStyle}>My Complaints</Link>
        <button onClick={handleLogout} className="btn text-danger mt-5 w-100 text-start ps-4 border-0 shadow-none" style={linkStyle}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '250px', padding: '40px', width: '100%', minHeight: '100vh', background: '#f4f7f6' }}>
        <h2 className="fw-bold mb-4">My Fee History</h2>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <table className="table align-middle text-center mb-0">
            <thead className="table-light">
              <tr style={{ height: '60px' }}>
                <th>Month</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="py-5 text-muted">Loading your fee records...</td></tr>
              ) : fees.length === 0 ? (
                <tr><td colSpan="4" className="py-5 text-muted">No fee records found.</td></tr>
              ) : (
                fees.map((f, index) => (
                  <tr key={index} style={{ height: '70px' }}>
                    <td className="fw-bold">{f.billing_month}</td>
                    <td><span className="text-dark">Rs. {f.amount}</span></td>
                    <td>
                      <span className={`badge rounded-pill px-3 py-2 ${f.status === 'Paid' ? 'bg-success' : 'bg-danger'}`}>
                        {f.status}
                      </span>
                    </td>
                    <td>
                      {f.status === 'Unpaid' ? (
                        <button
                          className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm"
                          onClick={() => handlePayment(f.fee_id, f.amount)}
                        >
                          <i className="bi bi-credit-card me-1"></i> Pay Securely
                        </button>
                      ) : (
                        <span className="text-success small fw-bold">
                          <i className="bi bi-check-circle-fill me-1"></i> Payment Cleared
                        </span>
                      )}
                    </td>
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
const sidebarStyle = { height: '100vh', background: '#1c2938', color: 'white', position: 'fixed', width: '250px' };
const linkStyle = { color: '#adb5bd', textDecoration: 'none', display: 'block', padding: '15px 20px', borderBottom: '1px solid #2c3e50', transition: '0.3s' };

export default StudentFees;