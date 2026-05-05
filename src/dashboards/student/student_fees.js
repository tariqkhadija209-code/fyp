import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../components/constant';

const StudentFees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Fee load karne ka effect
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);

    const fetchFees = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/student/fees/${user.student_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setFees(data);
      } catch (err) {
        console.error("Fee loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFees();

    // Payment Success Alert (URL check)
    if (window.location.search.includes('payment=success')) {
      alert("Transaction Successful: Your records are updated.");
      // URL saaf karne ke liye taake alert baar baar na aaye
      // window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

  // 2. Stripe Checkout Function
  const handlePayment = async (feeId, amount) => {
    if (!feeId || !amount) {
      alert("Payment Error: Missing fee details.");
      return;
    }
    try {
      // 1. FormData ki jagah simple JSON object banayein
      const paymentData = {
        fee_id: feeId,
        amount: amount
      };


      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/student/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      const data = await res.json();
      console.log("Payment Session Response:", data); 

      if (data.url) {
        
        window.location.href = data.url;
      } else {
        
        console.error("Backend Error Response:", data);
        alert("Gateway Error: " + (data || "Unable to initialize payment."));
      }
    } catch (err) {
      console.error("Fetch Error:", err);
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
        <Link to="/login" className="text-danger mt-5" style={linkStyle} onClick={() => {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }}>Logout</Link>
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