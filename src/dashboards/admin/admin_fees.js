import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AdminFees = () => {
  const [fees, setFees] = useState([]);
  const [genData, setGenData] = useState({ amount: '', month: '', type: 'Hostel Fee' });

  // 1. Load Fees from Backend
  const loadFees = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/admin/fees-summary');
      const data = await res.json();
      setFees(data);
    } catch (err) {
      console.error("Critical Error while loading fees:", err);
    }
  };

  useEffect(() => {
    loadFees();
  }, []);

  // 2. Generate Fees for All Students (Fixed for FastAPI Form)
  const generateFeesNow = async () => {
    if (!genData.amount || !genData.month) {
      alert("Please fill all fields");
      return;
    }

    try {
      // FastAPI Form(...) expect karta hai, isliye FormData use kar rahe hain
      const formData = new FormData();
      formData.append('billing_month', genData.month); // Backend field name match kar diya
      formData.append('amount', genData.amount);

      const res = await fetch('http://127.0.0.1:8000/admin/generate-fees', {
        method: 'POST',
        // Note: Headers mein Content-Type nahi lagana, browser khud boundary set karega
        body: formData
      });

      const result = await res.json();
      
      if (res.ok) {
        alert(result.message || "Fees Generated Successfully");
        loadFees(); // Table refresh karein
      } else {
        alert("Error: " + (result.detail || "Validation Failed"));
        console.error("Validation Details:", result);
      }
    } catch (err) {
      alert("Critical Error: Backend server is not responding.");
      console.error(err);
    }
  };

  // 3. Approve / Mark as Paid
  const approveFee = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/admin/approve-fee/${id}`, {
        method: 'PUT'
      });
      if (res.ok) {
        loadFees(); // Table update karein
      }
    } catch (err) {
      console.error("Approval failed", err);
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
        <Link to="/login" className="text-danger mt-5" style={linkStyle}>Logout</Link>
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
                onChange={(e) => setGenData({...genData, amount: e.target.value})}
              />
            </div>
            <div className="col-md-3">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Month (e.g. May 2026)" 
                value={genData.month}
                onChange={(e) => setGenData({...genData, month: e.target.value})}
              />
            </div>
            <div className="col-md-3">
              <select className="form-select" onChange={(e) => setGenData({...genData, type: e.target.value})}>
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