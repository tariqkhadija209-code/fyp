import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BASE_URL } from '../components/constant';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

 const handleLogin = async (e) => {
  e.preventDefault();

const credent = { email, password };



  try {
  const response = await fetch(`${BASE_URL}/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(credent)   // ✅ correct
});

    const result = await response.json();
    console.log("LOGIN RESPONSE:", result);

    if (response.ok) {
      localStorage.setItem('user', JSON.stringify(result));
      localStorage.setItem('token', result.access_token);

      const role = result.role.toLowerCase();

      if (role === 'student') {
        console.log("Student ID:", result.student_id); // ✅ check this
        navigate('/student/dashboard');
      }
      if (role === 'admin') {
        console.log("Student ID:", result.student_id); // ✅ check this
        navigate('/admin/dashboard');
      }
      if (role === 'warden') {
        console.log("Student ID:", result.student_id); // ✅ check this
        navigate('/warden/dashboard');
      }
    }
  } catch (error) {
    console.error(error);
  }
};

    return (
        <div className="d-flex align-items-center justify-content-center vh-100" style={{ backgroundColor: '#2C3E50' }}>
            <div className="login-card shadow-lg" style={{ background: 'white', color: '#333', borderRadius: '15px', padding: '40px', width: '400px' }}>
                <h2 className="text-center mb-4 fw-bold">Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label text-dark fw-medium">Email address</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            placeholder="noorhostel@gmail.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label text-dark fw-medium">Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            placeholder="********" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    <button type="submit" className="btn btn-dark w-100 py-2 fw-bold">Login</button>
                </form>
                <p className="text-center mt-3 text-muted">
                    New student? <Link to="/signup" className="text-primary text-decoration-none">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;