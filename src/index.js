import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Global CSS Imports (Inka yahan hona zaroori hai taake poori website par apply hon)
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './App.css'; 

// FontAwesome ko global access denay ke liye (Icons ke liye)
// Note: Agar aapne public/index.html mein CDN link dala hai toh ye line skip kar sakti hain
// Lekin humne yahan ensure kiya hai ke bootstrap ke sath styling default set ho.

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);