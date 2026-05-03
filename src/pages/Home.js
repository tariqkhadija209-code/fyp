import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import bg from '../assets/bg.jpg'; // Extension (.jpg ya .png) check kar lena

const Home = () => {
  return (
    <div className="home-container">
      {/* 1. HERO SECTION */}
      <section className="hero-section d-flex align-items-center text-white"
        style={{
          height: '90vh',
          background: `linear-gradient(rgba(0,31,63,0.8), rgba(0,31,63,0.8)), url(${bg}) center/cover fixed`
        }}>
        <div className="container text-center">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="display-2 fw-bold"
          >
            SMART LIVING FOR <span className="text-primary">MODERN STUDENTS</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="lead fs-3 mb-5"
          >
            A secure, automated, and comfortable hostel experience.
          </motion.p>

          <div className="d-flex justify-content-center gap-3">
            <Link to="/contact" className="btn btn-primary btn-lg rounded-pill px-5 shadow">Apply Now</Link>
            <Link to="/about" className="btn btn-outline-light btn-lg rounded-pill px-5">Explore More</Link>
          </div>
        </div>
      </section>

      {/* 2. QUICK STATS SECTION */}
      <section className="py-5 bg-white shadow-sm">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-md-4" data-aos="fade-up">
              <h2 className="fw-bold text-primary">50+</h2>
              <p className="text-muted">Residents</p>
            </div>
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
              <h2 className="fw-bold text-primary">24/7</h2>
              <p className="text-muted">Security Monitoring</p>
            </div>
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
              <h2 className="fw-bold text-primary">99%</h2>
              <p className="text-muted">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FACILITIES PREVIEW */}
      <section className="py-5 bg-light">
        <div className="container py-5 text-center">
          <h2 className="fw-bold mb-5" data-aos="zoom-in">Our Premium Services</h2>
          <div className="row g-4">

            {/* Gigabit Internet */}
            <div className="col-md-4" data-aos="fade-right">
              <div className="card h-100 border-0 p-4 shadow-sm text-center">
                <div className="mb-3 text-primary fs-1">
                  <i className="fas fa-wifi"></i>
                </div>
                <h4 className="fw-bold">Gigabit Internet</h4>
                <p className="text-muted">High-speed connectivity for your studies and entertainment.</p>
              </div>
            </div>

            {/* Organic Mess */}
            <div className="col-md-4" data-aos="fade-up">
              <div className="card h-100 border-0 p-4 shadow-sm text-center">
                <div className="mb-3 text-primary fs-1">
                  <i className="fas fa-utensils"></i>
                </div>
                <h4 className="fw-bold">Organic Mess</h4>
                <p className="text-muted">Healthy and delicious meals prepared with strict hygiene.</p>
              </div>
            </div>

            {/* AI Assistance (Biometric ki jagah) */}
            <div className="col-md-4" data-aos="fade-left">
              <div className="card h-100 border-0 p-4 shadow-sm text-center">
                <div className="mb-3 text-primary fs-1">
                  <i className="fas fa-robot"></i>
                </div>
                <h4 className="fw-bold">AI Assistance</h4>
                <p className="text-muted">
                  24/7 smart chatbot to resolve your queries and manage complaints instantly.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;