import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// --- SHARED COMPONENTS ---
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import ProtectedRoute from './components/ProtectedRoute';

import { BASE_URL } from './components/constant';

// --- PAGES ---
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/login'; 
import Signup from './pages/Signup'; 

// --- DASHBOARD COMPONENTS ---
import StudentDashboard from './dashboards/student/student_dashboard';
import StudentAttendance from './dashboards/student/student_attendance';
import StudentComplaints from './dashboards/student/student_complaints';
import StudentFees from './dashboards/student/student_fees';
import StudentMess from './dashboards/student/student_mess';

import WardenDashboard from './dashboards/warden/warden_dashboard';
import WardenAttendance from './dashboards/warden/warden_attendance';
import WardenMess from './dashboards/warden/warden_mess';

import AdminDashboard from './dashboards/admin/admin_dashboard';
import AdminComplaints from './dashboards/admin/admin_complaints';
import AdminFees from './dashboards/admin/admin_fees';
import AdminRooms from './dashboards/admin/admin_rooms';

import { useSelector } from 'react-redux';
import { selectIsLoading } from './store/slices/appSlice';

const AppContent = () => {
  const location = useLocation();
  const isLoading = useSelector(selectIsLoading);
  
  React.useEffect(() => {
    console.log('Redux is integrated. Current isLoading state:', isLoading);
  }, [isLoading]);
  
  // Local storage se user nikalna
  const storedUser = JSON.parse(localStorage.getItem('user'));

  // Dashboard check (Navbar/Footer hide karne ke liye)
  const isDashboard = location.pathname.startsWith('/student') || 
                      location.pathname.startsWith('/admin') || 
                      location.pathname.startsWith('/warden');

  // Chatbot check: Sirf Home, About, aur Contact pages ke liye
  const showChatbot = location.pathname === '/' || 
                      location.pathname === '/about' || 
                      location.pathname === '/contact';

  return (
    <div className="App d-flex flex-column min-vh-100">
      
      {/* Navbar sirf public pages par dikhegi */}
      {!isDashboard && <Navbar />}

      <div className="flex-grow-1">
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />

          {/* STUDENT DASHBOARD LAYOUT */}
          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={['Student']}>
              <div className="dashboard-layout">
                <div className="dashboard-content">
                  <Routes>
                    <Route path="dashboard" element={<StudentDashboard />} />
                    <Route path="attendance" element={<StudentAttendance />} />
                    <Route path="complaints" element={<StudentComplaints />} />
                    <Route path="fees" element={<StudentFees />} />
                    <Route path="mess" element={<StudentMess />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          } />

          {/* WARDEN DASHBOARD LAYOUT */}
          <Route path="/warden/*" element={
            <ProtectedRoute allowedRoles={['Warden', 'Admin']}>
              <div className="dashboard-layout">
                <div className="dashboard-content">
                  <Routes>
                    <Route path="dashboard" element={<WardenDashboard />} />
                    <Route path="attendance" element={<WardenAttendance />} />
                    <Route path="mess" element={<WardenMess />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          } />

          {/* ADMIN DASHBOARD LAYOUT */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <div className="dashboard-layout">
                <div className="dashboard-content">
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="complaints" element={<AdminComplaints />} />
                    <Route path="fees" element={<AdminFees />} />
                    <Route path="rooms" element={<AdminRooms />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      {/* Chatbot ab sirf Home, About aur Contact par nazar aaye ga */}
      {showChatbot && <Chatbot studentId={storedUser?.student_id} />}

      {/* Footer sirf public pages par dikhega */}
      {!isDashboard && <Footer />}

    </div>
  );
};


function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;