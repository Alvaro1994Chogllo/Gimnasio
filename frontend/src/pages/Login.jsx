import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(username, password);
        setLoading(false);
        if (result.success) {
            navigate('/admin');
        } else {
            setError(result.message || 'Usuario o contraseña incorrectos. Intenta de nuevo.');
        }
    };

    return (
        <>
            {/* Banner Hero */}
            <section
                className="breadcrumb-section set-bg"
                style={{ backgroundImage: "url('/img/banner-bg.jpg')", padding: '80px 0', backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12 text-center">
                            <div className="bs-text">
                                <h2 style={{ color: '#fff', fontWeight: '700', letterSpacing: '2px' }}>
                                    PANEL ADMINISTRATIVO
                                </h2>
                                <div className="bt-tips" style={{ color: '#f36100', fontWeight: '600', fontSize: '16px', marginTop: '10px' }}>
                                    Ingresa tus credenciales para continuar
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Login Form */}
            <section className="contact-section spad" style={{ background: '#111', minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-5 col-md-8">
                            <div style={{
                                background: '#1a1a1a',
                                border: '1px solid #2a2a2a',
                                borderRadius: '4px',
                                padding: '50px 40px',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                            }}>
                                {/* Icon */}
                                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                    <div style={{
                                        width: '70px', height: '70px',
                                        background: '#f36100',
                                        borderRadius: '50%',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '15px'
                                    }}>
                                        <i className="fa fa-user" style={{ fontSize: '28px', color: '#fff' }}></i>
                                    </div>
                                    <h4 style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '2px', margin: 0 }}>
                                        INICIAR SESIÓN
                                    </h4>
                                </div>

                                <form onSubmit={handleSubmit} className="leave-comment" style={{ margin: 0 }}>
                                    {/* Username */}
                                    <div style={{ marginBottom: '15px', position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#f36100' }}>
                                            <i className="fa fa-user-o"></i>
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Usuario"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            style={{
                                                width: '100%', background: '#222', border: '1px solid #333',
                                                color: '#fff', padding: '14px 15px 14px 40px',
                                                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                                                borderRadius: '2px'
                                            }}
                                        />
                                    </div>

                                    {/* Password */}
                                    <div style={{ marginBottom: '20px', position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#f36100' }}>
                                            <i className="fa fa-lock"></i>
                                        </span>
                                        <input
                                            type="password"
                                            placeholder="Contraseña"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            style={{
                                                width: '100%', background: '#222', border: '1px solid #333',
                                                color: '#fff', padding: '14px 15px 14px 40px',
                                                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                                                borderRadius: '2px'
                                            }}
                                        />
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <div style={{
                                            background: 'rgba(243,97,0,0.15)', border: '1px solid #f36100',
                                            color: '#f36100', padding: '10px 15px', borderRadius: '2px',
                                            marginBottom: '15px', fontSize: '13px', textAlign: 'center'
                                        }}>
                                            <i className="fa fa-exclamation-triangle" style={{ marginRight: '6px' }}></i>
                                            {error}
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        className="primary-btn"
                                        disabled={loading}
                                        style={{
                                            width: '100%', padding: '14px', fontSize: '14px',
                                            fontFamily: 'Oswald, sans-serif', letterSpacing: '2px',
                                            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.7 : 1
                                        }}
                                    >
                                        {loading
                                            ? <><i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>VERIFICANDO...</>
                                            : <><i className="fa fa-sign-in" style={{ marginRight: '8px' }}></i>INGRESAR</>
                                        }
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
