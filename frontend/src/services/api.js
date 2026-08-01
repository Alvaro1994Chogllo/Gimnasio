/**
 * api.js — Servicio centralizado de comunicación con el servidor Django REST API
 * 
 * Arquitectura: Cliente (React) → Servidor (Django REST API) → Modelo (SQLite/BD)
 * 
 * Este módulo intercepta todas las peticiones HTTP para:
 *   - Adjuntar automáticamente el token JWT en el header Authorization
 *   - Manejar la renovación del token cuando expira (401)
 *   - Centralizar la URL base del servidor
 */

import axios from 'axios';

// ─── Configuración base ───────────────────────────────────────────────────────
const BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Interceptor de petición: adjunta el JWT automáticamente ─────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Interceptor de respuesta: renueva token si expira ───────────────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    const response = await axios.post(`${BASE_URL}/token/refresh/`, {
                        refresh: refreshToken,
                    });
                    const newAccessToken = response.data.access;
                    localStorage.setItem('access_token', newAccessToken);
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Token de refresco inválido — cerrar sesión
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ─── Servicios por recurso ────────────────────────────────────────────────────

/** Socios */
export const sociosService = {
    getAll: ()           => api.get('/socios/'),
    getById: (id)        => api.get(`/socios/${id}/`),
    create: (data)       => api.post('/socios/', data),
    update: (id, data)   => api.put(`/socios/${id}/`, data),
    patch: (id, data)    => api.patch(`/socios/${id}/`, data),
    delete: (id)         => api.delete(`/socios/${id}/`),
};

/** Membresías */
export const membresiasService = {
    getAll: ()           => api.get('/membresias/'),
    getById: (id)        => api.get(`/membresias/${id}/`),
    create: (data)       => api.post('/membresias/', data),
    update: (id, data)   => api.put(`/membresias/${id}/`, data),
    patch: (id, data)    => api.patch(`/membresias/${id}/`, data),
    delete: (id)         => api.delete(`/membresias/${id}/`),
};

/** Zonas del Gimnasio */
export const zonasService = {
    getAll: ()           => api.get('/zonas/'),
    getById: (id)        => api.get(`/zonas/${id}/`),
    create: (data)       => api.post('/zonas/', data),
    update: (id, data)   => api.put(`/zonas/${id}/`, data),
    patch: (id, data)    => api.patch(`/zonas/${id}/`, data),
    delete: (id)         => api.delete(`/zonas/${id}/`),
};

/** Entrenadores */
export const entrenadoresService = {
    getAll: ()           => api.get('/entrenadores/'),
    getById: (id)        => api.get(`/entrenadores/${id}/`),
    create: (data)       => api.post('/entrenadores/', data),
    update: (id, data)   => api.put(`/entrenadores/${id}/`, data),
    patch: (id, data)    => api.patch(`/entrenadores/${id}/`, data),
    delete: (id)         => api.delete(`/entrenadores/${id}/`),
};

/** Reservas de Clases */
export const reservasService = {
    getAll: ()           => api.get('/reservas/'),
    getById: (id)        => api.get(`/reservas/${id}/`),
    create: (data)       => api.post('/reservas/', data),
    update: (id, data)   => api.put(`/reservas/${id}/`, data),
    patch: (id, data)    => api.patch(`/reservas/${id}/`, data),
    delete: (id)         => api.delete(`/reservas/${id}/`),
};

export default api;
