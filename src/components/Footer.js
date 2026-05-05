import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-5" style={{ background: '#00152b', color: '#cbd5e0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="container">
        <div className="row g-4">
          
          {/* 1. Brand Info & Socials */}
          <div className="col-md-4" data-aos="fade-up">
            <h3 className="text-white fw-bold mb-4">Hostel<span className="text-primary">Flow</span></h3>
            <p style={{ lineHeight: '1.8' }}>
              HostelFlow is a digital platform designed to simplify student life. 
              From secure access to instant communication, we provide a seamless hostel experience.
            </p>
            <div className="d-flex gap-3 fs-4 mt-4">
              <a href="#" className="text-white hover-blue transition"><i className="fab fa-facebook"></i></a>
              <a href="#" className="text-white hover-blue transition"><i className="fab fa-instagram"></i></a>
              <a href="#" className="text-white hover-blue transition"><i className="fab fa-twitter"></i></a>
              <a href="#" className="text-white hover-blue transition"><i className="fab fa-linkedin"></i></a>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div className="col-md-4 px-lg-5" data-aos="fade-up" data-aos-delay="100">
            <h5 className="text-white fw-bold mb-4">Quick Navigation</h5>
            <ul className="list-unstyled">
              {['Home Page', 'Our Mission', 'Get Support', 'Student Login'].map((text, index) => (
                <li key={index} className="mb-2">
                  <Link 
                    to={text === 'Home Page' ? '/' : `/${text.split(' ').pop().toLowerCase()}`} 
                    className="text-decoration-none text-light-50 hover-white transition-sm d-inline-block"
                    style={{ color: '#cbd5e0' }}
                  >
                    <i className="fas fa-chevron-right me-2 small" style={{ fontSize: '10px' }}></i>
                    {text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Contact Info (New Section for better look) */}
          <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
            <h5 className="text-white fw-bold mb-4">Contact Info</h5>
            <ul className="list-unstyled">
              <li className="mb-3 d-flex align-items-center">
                <i className="fas fa-map-marker-alt text-primary me-3"></i>
                <span>Main GT Road, Gujranwala</span>
              </li>
              <li className="mb-3 d-flex align-items-center">
                <i className="fas fa-phone-alt text-primary me-3"></i>
                <span>+92 300 1234567</span>
              </li>
              <li className="mb-3 d-flex align-items-center">
                <i className="fas fa-envelope text-primary me-3"></i>
                <span>info@hostelflow.com</span>
              </li>
            </ul>
          </div>

        </div>

        <hr className="mt-5 mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
        
        <div className="row">
          <div className="col-md-12 text-center">
            <p className="small mb-0">&copy; {new Date().getFullYear()} HostelFlow. All rights reserved by <strong>NASK Innovations.</strong></p>
          </div>
        </div>
      </div>

      {/* Custom Styling for Hover Effects */}
      <style>{`
        .transition { transition: all 0.3s ease; }
        .hover-blue:hover { color: #007bff !important; transform: translateY(-3px); }
        .hover-white:hover { color: #ffffff !important; transform: translateX(5px); }
        .text-light-50 { color: #cbd5e0; }
      `}</style>
    </footer>
  );
};

export default Footer;