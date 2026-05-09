import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../store/api/authApi';
import { useLazyGetRoomDetailsQuery } from '../store/api/studentApi';
import { setCredentials, selectIsAuthenticated, selectUserRole } from '../store/slices/authSlice';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const userRole = useSelector(selectUserRole);
    const [login] = useLoginMutation();
    const [getRoomDetails] = useLazyGetRoomDetailsQuery();

    useEffect(() => {
        if (isAuthenticated && userRole) {
            const role = userRole.toLowerCase();
            if (role === 'student') navigate('/student/dashboard');
            else if (role === 'admin') navigate('/admin/dashboard');
            else if (role === 'warden') navigate('/warden/dashboard');
        }
    }, [isAuthenticated, userRole, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const result = await login({ email, password }).unwrap();
            console.log("LOGIN RESPONSE:", result);

            if (result.status === 'success') {
                const role = result.role.toLowerCase();

                // Room allocation check for students
                if (role === 'student') {
                    try {
                        const roomCheck = await getRoomDetails(result.student_id || result.user_id).unwrap();
                        if (roomCheck.status !== 'success') {
                            alert("Login Denied: Admin has not allocated your room yet. Please contact the hostel office.");
                            return;
                        }
                    } catch (err) {
                        console.error("Room check failed:", err);
                        // If API fails to find room, we assume not allocated
                        alert("Login Denied: Your room allocation is still pending.");
                        return;
                    }
                }

                dispatch(setCredentials(result));

                if (role === 'student') {
                    navigate('/student/dashboard');
                } else if (role === 'admin') {
                    navigate('/admin/dashboard');
                } else if (role === 'warden') {
                    navigate('/warden/dashboard');
                }
            }
        } catch (error) {
            console.error("Login failed:", error);
            alert(error?.data?.detail || "Login failed. Please check your credentials.");
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