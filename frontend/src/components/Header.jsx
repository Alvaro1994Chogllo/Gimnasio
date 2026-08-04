import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  // Navegación hacia la sección de planes
  const handlePlanesClick = (e) => {
    e.preventDefault();

    if (window.location.pathname === '/') {
      const el = document.getElementById('planes');

      if (el) {
        el.scrollIntoView({
          behavior: 'smooth'
        });
      }
    } else {
      navigate('/#planes');
    }
  };

  return (
    <header className="header-section">
      <div className="container-fluid">
        <div className="row align-items-center">

          {/* Logo */}
          <div className="col-lg-3">
            <div className="logo">
              <Link to="/">
                <img
                  src="/img/logo.png"
                  alt="Sistema de Gestión de Gimnasio"
                />
              </Link>
            </div>
          </div>

          {/* Menú de navegación */}
          <div className="col-lg-6">
            <nav className="nav-menu">
              <ul>
                <li>
                  <Link to="/">Inicio</Link>
                </li>

                <li>
                  <a href="#planes" onClick={handlePlanesClick}>
                    Planes
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Botón de acceso */}
          <div className="col-lg-3">
            <div
              className="top-option"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '15px'
              }}
            >
              <Link
                to="/login"
                className="primary-btn"
                style={{
                  padding: '10px 25px',
                  fontSize: '14px',
                  letterSpacing: '1px',
                  fontWeight: '600'
                }}
              >
                <i
                  className="fa fa-lock"
                  style={{ marginRight: '6px' }}
                ></i>

                INICIAR SESIÓN
              </Link>
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
