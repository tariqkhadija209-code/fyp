import React from 'react';
//import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="about-container">
      {/* 1. HEADER SECTION */}
      <section className="py-5 text-white text-center" 
        style={{ background: 'linear-gradient(135deg, #001f3f 0%, #003366 100%)', padding: '80px 0' }}>
        <div className="container" data-aos="fade-down">
          <h1 className="display-4 fw-bold">Our Story & Mission</h1>
          <p className="lead mx-auto" style={{ maxWidth: '700px' }}>
            We are redefining student living through technology, safety, and community.
          </p>
        </div>
      </section>

      {/* 2. VISION & IMAGE SECTION */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6" data-aos="fade-right">
              <div className="position-relative">
                <img 
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070" 
                  className="img-fluid rounded-4 shadow-lg" 
                  alt="Students Studying" 
                />
                <div className="position-absolute bottom-0 end-0 bg-primary text-white p-4 rounded-start shadow-lg d-none d-md-block">
                  <h3 className="mb-0 fw-bold">6+ Years</h3>
                  <p className="mb-0">of Excellence</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <h2 className="fw-bold text-navy mb-4">Empowering Students for a Brighter Future</h2>
              <p className="text-muted fs-5 mb-4">
               HostelFlow isn't just a hostel—it's a digital ecosystem. By automating management and removing manual paperwork, we ensure that your only priority is your academic success
              </p>
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="p-3 border-start border-primary border-4 bg-light">
                    <h5 className="fw-bold">Safety First</h5>
                    <p className="small mb-0 text-muted">24/7 CCTV surveillance and verified entries.</p>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="p-3 border-start border-primary border-4 bg-light">
                    <h5 className="fw-bold">Smart Tech</h5>
                    <p className="small mb-0 text-muted">React-based portals for instant feedback.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE VALUES SECTION */}
      <section className="py-5 bg-light">
        <div className="container text-center">
          <h2 className="fw-bold mb-5">Our Core Values</h2>
          <div className="row g-4">
            {[
              { icon: 'hand-holding-heart', title: 'Care', desc: 'Family-like environment for every resident.' },
              { icon: 'shield-check', title: 'Integrity', desc: 'Transparency in every process and fee.' },
              { icon: 'lightbulb', title: 'Innovation', desc: 'Always improving with latest technologies.' }
            ].map((value, idx) => (
              <div className="col-md-4" key={idx} data-aos="zoom-in" data-aos-delay={idx * 100}>
                <div className="p-4 bg-white rounded-4 shadow-sm h-100">
                  <div className="icon-box mb-3 text-primary">
                    <i className={`fas fa-${value.icon} fa-3x`}></i>
                  </div>
                  <h4 className="fw-bold">{value.title}</h4>
                  <p className="text-muted">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;