/**
 * AuthContext.jsx — Contexto global de autenticación
 * 
 * Arquitectura Cliente-Servidor:
 *   Cliente (React) → POST /api/token/ → Servidor Django → Devuelve JWT
 * 
 * El token se guarda en localStorage y se adjunta automáticamente
 * a todas las peticiones a través del interceptor en services/api.js
 */

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const BASE_URL = 'http://127.0.0.1:8000/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verificar si ya hay sesión activa al montar
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            // Decodificar payload básico del JWT para obtener username
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const isExpired = payload.exp * 1000 < Date.now();
                if (!isExpired) {
                    setUser({
                        token,
                        username: payload.username || 'Admin',
                        role: payload.role || 'ADMIN',
                        socio_id: payload.socio_id || null,
                        entrenador_id: payload.entrenador_id || null
                    });
                } else {
                    // Token expirado — limpiar
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                }
            } catch {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            }
        }
        setLoading(false);
    }, []);

    /**
     * login: Cliente envía credenciales → Servidor Django valida y retorna JWT
     */
    const login = async (username, password) => {
        try {
            const response = await axios.post(`${BASE_URL}/token/`, {
                username,
                password
            });
            const { access, refresh } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            // Decodificar el token para obtener info del usuario
            const payload = JSON.parse(atob(access.split('.')[1]));
            setUser({
                token: access,
                username: payload.username || username,
                role: payload.role || 'ADMIN',
                socio_id: payload.socio_id || null,
                entrenador_id: payload.entrenador_id || null
            });

            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.detail || 'Error de conexión con el servidor';
            return { success: false, message: msg };
        }
    };

    /**
     * logout: Limpia la sesión localmente
     */
    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
