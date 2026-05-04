import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BASE_URL } from '../components/constant';

const Signup = () => {
    const navigate = useNavigate();
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
        
        const params = new URLSearchParams();
        Object.keys(formData).forEach(key => params.append(key, formData[key]));

        try {
            const response = await fetch(`${BASE_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert(result.message || "Account Created Successfully!");
                navigate("/login"); // Login page par redirect
            } else {
                alert("Error: " + (result.detail || "Signup failed"));
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            alert("Connection Error! Apna FastAPI server check karein.");
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