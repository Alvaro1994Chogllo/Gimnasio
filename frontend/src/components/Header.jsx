import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  const handlePlanesClick = (e) => {
    e.preventDefault();
    // Si estamos en home, scroll suave a #planes
    if (window.location.pathname === '/') {
      const el = document.getElementById('planes');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#planes');
    }
  };

  return (
    <header className="header-section">
        <div className="container-fluid">
            <div className="row align-items-center">
                <div className="col-lg-3">
                    <div className="logo">
                        <Link to="/">
                            <img src="/img/logo.png" alt="Logo" />
                        </Link>
                    </div>
                </div>
                <div className="col-lg-6">
                    <nav className="nav-menu">
                        <ul>
                            <li><a href="#planes" onClick={handlePlanesClick}>Planes</a></li>
                        </ul>
                    </nav>
                </div>
                <div className="col-lg-3">
                    <div className="top-option" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '15px' }}>
                        <Link
                          to="/login"
                          className="primary-btn"
                          style={{ padding: '10px 25px', fontSize: '14px', letterSpacing: '1px', fontWeight: '600' }}
                        >
                          <i className="fa fa-lock" style={{ marginRight: '6px' }}></i>
                          LOGIN
                        </Link>
                        <div className="to-social" style={{ display: 'none' }}>
                            <Link to="#"><i className="fa fa-facebook"></i></Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className="canvas-open">
                <i className="fa fa-bars"></i>
            </div>
        </div>
    </header>
  );
}
