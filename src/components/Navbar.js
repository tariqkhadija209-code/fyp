import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  // Function to check if a link is active
  const isActive = (path) => location.pathname === path ? 'active text-primary' : '';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top" 
         style={{ background: '#001f3f', padding: '15px 0', borderBottom: '2px solid #007bff' }}>
      <div className="container">
        <Link className="navbar-brand fw-bold fs-3" to="/">
          <i className="fas fa-hotel me-2 text-primary"></i>Hostel<span className="text-primary">Flow</span>
        </Link>
        
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item px-2">
              <Link className={`nav-link fw-medium ${isActive('/')}`} to="/">Home</Link>
            </li>
            <li className="nav-item px-2">
              <Link className={`nav-link fw-medium ${isActive('/about')}`} to="/about">About Us</Link>
            </li>
            <li className="nav-item px-2">
              <Link className={`nav-link fw-medium ${isActive('/contact')}`} to="/contact">Contact</Link>
            </li>
            <li className="nav-item ms-lg-4">
              <Link className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" to="/login">
                <i className="fas fa-user-circle me-2"></i>Portal Login
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;