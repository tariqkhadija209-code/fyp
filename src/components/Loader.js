import React from 'react';

const Loader = () => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: 'rgba(255, 255, 255, 0.8)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
      <div className="text-center">
        <div className="spinner-grow text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="mt-3 fw-bold text-primary">Fetching Data...</h5>
      </div>
    </div>
  );
};

export default Loader;
