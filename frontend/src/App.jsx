import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './components/home/Home.jsx';
import Services from './components/services/Services.jsx';
import AdminServices from './components/admin/services/AdminServices.jsx';
import './styles/global.css';

function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="container header-content">
          <h1 className="logo">Roof Service</h1>
          <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="/services">Services</Link>
            <Link to="/admin/services">Admin Services</Link>
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/admin/services" element={<AdminServices />} />
          </Routes>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} Roof Service. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
