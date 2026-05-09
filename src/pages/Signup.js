import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSignupMutation } from '../store/api/authApi';
import { selectIsAuthenticated, selectUserRole } from '../store/slices/authSlice';

const Signup = () => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const userRole = useSelector(selectUserRole);
    const [signup] = useSignupMutation();

    useEffect(() => {
        if (isAuthenticated && userRole) {
            const role = userRole.toLowerCase();
            if (role === 'student') navigate('/student/dashboard');
            else if (role === 'admin') navigate('/admin/dashboard');
            else if (role === 'warden') navigate('/warden/dashboard');
        }
    }, [isAuthenticated, userRole, navigate]);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        full_name: '',
        roll_no: '',
        department: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const result = await signup(formData).unwrap();
            
            if (result.status === 'success') {
                alert(result.message || "Account Created Successfully!");
                navigate("/login");
            }
        } catch (error) {
            console.error("Signup failed:", error);
            alert(error?.data?.detail || "Signup failed. Please check your data.");
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100" style={{ backgroundColor: '#2C3E50', fontFamily: 'Segoe UI, sans-serif' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card shadow-lg p-4" style={{ borderRadius: '15px', border: 'none' }}>
                            <h3 className="text-center mb-4" style={{ color: '#2C3E50', fontWeight: 'bold' }}>Student Registration</h3>
                            <form onSubmit={handleSignup}>
                                <div className="row g-2">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Username</label>
                                        <input type="text" name="username" className="form-control" onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Email</label>
                                        <input type="email" name="email" className="form-control" onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Full Name</label>
                                    <input type="text" name="full_name" className="form-control" onChange={handleChange} required />
                                </div>
                                <div className="row g-2">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Roll Number</label>
                                        <input type="text" name="roll_no" className="form-control" placeholder="BIT22-001" onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Department</label>
                                        <input type="text" name="department" className="form-control" onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Password</label>
                                    <input type="password" name="password" className="form-control" onChange={handleChange} required />
                                </div>
                                <button type="submit" className="btn w-100 py-2 text-white" style={{ backgroundColor: '#18BC9C', border: 'none' }}>
                                    Create Account
                                </button>
                            </form>
                            <p className="text-center mt-3 small">
                                Already have an account? <Link to="/login" className="text-decoration-none">Login</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;