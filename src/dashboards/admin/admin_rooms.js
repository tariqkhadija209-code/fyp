import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { useGetRoomsQuery, useGetPendingStudentsQuery, useAddRoomMutation, useAllocateRoomAIMutation } from '../../store/api/adminApi';
import Loader from '../../components/Loader';
import { useState } from 'react';

const AdminRooms = () => {
  const [newRoom, setNewRoom] = useState({ room_no: '', capacity: 3, block: 'A', wing: 'General' });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // RTK Query for fetching rooms and pending students
  const { data: rooms = [], isLoading: roomsLoading } = useGetRoomsQuery();
  const { data: pendingStudents = [], isLoading: pendingLoading } = useGetPendingStudentsQuery();

  // RTK Query for adding room and AI allocation
  const [addRoom] = useAddRoomMutation();
  const [allocateRoomAI] = useAllocateRoomAIMutation();

  if (roomsLoading || pendingLoading) return <Loader />;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const result = await addRoom(newRoom).unwrap();
      if (result.status === 'success') {
        alert("Room Added!");
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error("Add room error:", err);
      alert("Error adding room");
    }
  };

  const runAI = async (id) => {
    if (!window.confirm("AI Allocation shuru karein?")) return;
    try {
      const result = await allocateRoomAI(id).unwrap();
      alert(result.message);
    } catch (err) {
      console.error("AI Allocation error:", err);
      alert("Server error or AI service down!");
    }
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div style={sidebarStyle} className="sidebar shadow">
        <h4 className="text-center py-4 text-white border-bottom border-secondary">Admin Panel</h4>
        <Link to="/admin/dashboard" style={linkStyle}>Overview</Link>
        <Link to="/admin/rooms" style={{ ...linkStyle, background: '#007bff', color: 'white' }}>Room Management</Link>
        <Link to="/admin/fees" style={linkStyle}>Fee Verification</Link>
        <Link to="/admin/complaints" style={linkStyle}>Complaints View</Link>
        <button onClick={handleLogout} className="btn text-danger mt-5 w-100 text-start ps-4 border-0 shadow-none" style={linkStyle}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '250px', padding: '30px', width: '100%', minHeight: '100vh', background: '#f4f7f6' }}>

        {/* Form: Add New Room */}
        <h3 className="fw-bold mb-3">Add New Room</h3>
        <div className="card border-0 p-4 shadow-sm mb-5 rounded-4">
          <form onSubmit={handleAddRoom} className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-bold">Room Number</label>
              <input
                type="text"
                className="form-control"
                required
                onChange={(e) => setNewRoom({ ...newRoom, room_no: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold">Capacity</label>
              <input
                type="number"
                className="form-control"
                defaultValue="3"
                required
                onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold">Block</label>
              <select className="form-select" onChange={(e) => setNewRoom({ ...newRoom, block: e.target.value })}>
                <option value="A">Block A</option>
                <option value="B">Block B</option>
                <option value="C">Block C</option>
              </select>
            </div>
            <div className="col-md-3 mt-4 pt-2">
              <button type="submit" className="btn btn-primary w-100 fw-bold rounded-pill">Save Room</button>
            </div>
          </form>
        </div>

        {/* Table: Active Rooms */}
        <h3 className="fw-bold mb-3">Active Rooms</h3>
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
          <table className="table table-hover mb-0 text-center">
            <thead className="table-dark">
              <tr>
                <th className="py-3">Room No</th>
                <th>Block</th>
                <th>Beds Available</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r, index) => {
                const available = r.capacity - r.current_occupancy;
                return (
                  <tr key={index}>
                    <td className="fw-bold">{r.room_no}</td>
                    <td>Block {r.block} <small className="text-muted">({r.wing || 'General'})</small></td>
                    <td>{available} / {r.capacity}</td>
                    <td>
                      <span className={`badge rounded-pill ${available > 0 ? 'bg-success' : 'bg-danger'}`}>
                        {available > 0 ? 'Available' : 'Full'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table: AI Pending Allocations */}
        <h3 className="text-primary fw-bold mb-1"><i className="bi bi-robot"></i> Pending AI Allocations</h3>
        <p className="text-muted mb-4">Assign the block to students with AI.</p>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <table className="table table-hover mb-0 text-center">
            <thead className="table-info">
              <tr>
                <th className="py-3">Student Name</th>
                <th>Department</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingStudents.length === 0 ? (
                <tr><td colSpan="3" className="text-center py-4 text-muted">No pending students.</td></tr>
              ) : (
                pendingStudents.map((s) => (
                  <tr key={s.student_id}>
                    <td><b>{s.full_name}</b></td>
                    <td>{s.department}</td>
                    <td>
                      <button className="btn btn-info btn-sm text-white rounded-pill px-3" onClick={() => runAI(s.student_id)}>
                        <i className="bi bi-robot me-1"></i> Run AI Allocation
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
  );
};

// Common Styles
const sidebarStyle = { height: '100vh', background: '#2C3E50', color: 'white', position: 'fixed', width: '250px' };
const linkStyle = { color: '#bdc3c7', textDecoration: 'none', display: 'block', padding: '15px 20px', borderBottom: '1px solid #34495e' };

export default AdminRooms;