import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
        // Not logged in
        return <Navigate to="/login" replace />;
    }

    try {
        const userData = JSON.parse(userStr);
        // We store 'user' as { status, access_token, token_type, user: { user_id, username, role, student_id } }
        // based on the updated backend response.
        const user = userData.user || userData; // Fallback for old structure if any
        
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            // Role not allowed
            alert("Unauthorized Access! Redirecting to your dashboard.");
            if (user.role === 'Student') return <Navigate to="/student/dashboard" replace />;
            if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
            if (user.role === 'Warden') return <Navigate to="/warden/dashboard" replace />;
            return <Navigate to="/login" replace />;
        }

        return children;
    } catch (e) {
        console.error("Auth Error", e);
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;
