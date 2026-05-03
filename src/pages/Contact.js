import React from 'react';

const Contact = () => {
  return (
    <div className="contact-container">
      <section className="py-5 bg-light">
        <div className="container py-5">
          <div className="text-center mb-5" data-aos="fade-up">
            <h1 className="fw-bold display-4">Contact Us</h1>
            <p className="text-muted">Have questions? We're here to help you 24/7.</p>
          </div>

          <div className="row g-4 justify-content-center align-items-stretch">
            {/* Contact Info Cards */}
            <div className="col-lg-4" data-aos="fade-right">
              <div className="card border-0 shadow-sm p-4 mb-3 rounded-4 h-auto">
                <div className="d-flex align-items-center">
                  <i className="fas fa-phone-alt fa-2x text-primary me-3"></i>
                  <div>
                    <h5 className="mb-0 fw-bold">Call Us</h5>
                    <p className="mb-0 text-muted">+92 300 1234567</p>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm p-4 mb-3 rounded-4 h-auto">
                <div className="d-flex align-items-center">
                  <i className="fas fa-envelope fa-2x text-primary me-3"></i>
                  <div>
                    <h5 className="mb-0 fw-bold">Email Us</h5>
                    <p className="mb-0 text-muted">info@hostelflow.com</p>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm p-4 rounded-4 h-auto">
                <div className="d-flex align-items-center">
                  <i className="fas fa-map-marker-alt fa-2x text-primary me-3"></i>
                  <div>
                    <h5 className="mb-0 fw-bold">Visit Us</h5>
                    <p className="mb-0 text-muted">Main GT Road, Gujranwala</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map Section */}
            <div className="col-lg-8" data-aos="fade-left">
              <div className="card border-0 shadow-lg overflow-hidden rounded-4 h-100" style={{ minHeight: '400px' }}>
                <iframe
                  title="HostelFlow Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108393.30873405788!2d74.11306354832562!3d32.16635105268393!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391f29063507c309%3A0x6b876274488b3986!2sGujranwala%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1714200000000!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;