import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Página pública principal con plantilla completa */}
          <Route path="/" element={<Home />} />

          {/* Login: Header + Login + Footer con estilo de plantilla */}
          <Route path="/login" element={
            <>
              <Header />
              <Login />
              <Footer />
            </>
          } />

          {/* Panel Administrativo protegido — layout propio con sidebar */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
