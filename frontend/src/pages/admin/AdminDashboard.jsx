/**
 * AdminDashboard.jsx — Panel Administrativo Completo
 * 
 * Arquitectura Modelo-Vista-Controlador (cliente-servidor):
 *   Vista     → React Components (este archivo)
 *   Servicio  → api.js con interceptores JWT
 *   Modelo    → Django REST API → SQLite
 * 
 * Módulos: Dashboard, Socios, Membresías, Zonas, Entrenadores, Reservas
 */


import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
    sociosService,
    membresiasService,
    zonasService,
    entrenadoresService,
    reservasService,
} from '../../services/api';

// ─── Íconos SVG simples ───────────────────────────────────────────────────────
const Icon = ({ name }) => {
    const icons = {
        dashboard: '📊', socios: '👥', membresias: '🏷️',
        zonas: '🏋️', entrenadores: '💪', reservas: '📅',
        logout: '🚪', add: '➕', edit: '✏️', delete: '🗑️',
        close: '✕', save: '💾', refresh: '🔄',
    };
    return <span>{icons[name] || '●'}</span>;
};

// ─── Modal genérico reutilizable ──────────────────────────────────────────────
function Modal({ title, onClose, children }) {
    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.modalHeader}>
                    <h5 style={{ margin: 0, color: '#f36100' }}>{title}</h5>
                    <button onClick={onClose} style={styles.closeBtn}><Icon name="close" /></button>
                </div>
                <div style={styles.modalBody}>{children}</div>
            </div>
        </div>
    );
}

// ─── Tarjeta de estadística ───────────────────────────────────────────────────
function StatCard({ label, value, icon, color }) {
    return (
        <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
            <div style={{ fontSize: 32 }}><Icon name={icon} /></div>
            <div>
                <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
                <div style={{ color: '#aaa', fontSize: 13 }}>{label}</div>
            </div>
        </div>
    );
}

// ─── Formularios por módulo ───────────────────────────────────────────────────
function SocioForm({ initial = {}, onSave, onCancel }) {
    const [form, setForm] = useState({
        cedula: '', nombre: '', apellido: '', email: '',
        telefono: '', fecha_nacimiento: '', activo: true,
        ...initial,
    });
    const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
            <div style={styles.formGrid}>
                <label style={styles.label}>Cédula *
                    <input style={styles.input} value={form.cedula} onChange={f('cedula')} required />
                </label>
                <label style={styles.label}>Nombre *
                    <input style={styles.input} value={form.nombre} onChange={f('nombre')} required />
                </label>
                <label style={styles.label}>Apellido *
                    <input style={styles.input} value={form.apellido} onChange={f('apellido')} required />
                </label>
                <label style={styles.label}>Email *
                    <input style={styles.input} type="email" value={form.email} onChange={f('email')} required />
                </label>
                <label style={styles.label}>Teléfono
                    <input style={styles.input} value={form.telefono} onChange={f('telefono')} />
                </label>
                <label style={styles.label}>Fecha Nacimiento *
                    <input style={styles.input} type="date" value={form.fecha_nacimiento} onChange={f('fecha_nacimiento')} required />
                </label>
            </div>
            <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={form.activo}
                    onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
                Socio activo
            </label>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="submit" style={styles.btnPrimary}><Icon name="save" /> Guardar</button>
                <button type="button" onClick={onCancel} style={styles.btnSecondary}>Cancelar</button>
            </div>
        </form>
    );
}

function MembresiaForm({ initial = {}, onSave, onCancel }) {
    const [form, setForm] = useState({
        nombre: '', descripcion: '', precio: '', duracion_dias: '', activa: true, ...initial,
    });
    const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
            <div style={styles.formGrid}>
                <label style={styles.label}>Nombre del Plan *
                    <input style={styles.input} value={form.nombre} onChange={f('nombre')} required />
                </label>
                <label style={styles.label}>Precio ($) *
                    <input style={styles.input} type="number" step="0.01" value={form.precio} onChange={f('precio')} required />
                </label>
                <label style={styles.label}>Duración (días) *
                    <input style={styles.input} type="number" value={form.duracion_dias} onChange={f('duracion_dias')} required />
                </label>
            </div>
            <label style={styles.label}>Descripción
                <textarea style={{ ...styles.input, height: 80 }} value={form.descripcion} onChange={f('descripcion')} />
            </label>
            <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={form.activa}
                    onChange={(e) => setForm({ ...form, activa: e.target.checked })} />
                Plan activo
            </label>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="submit" style={styles.btnPrimary}><Icon name="save" /> Guardar</button>
                <button type="button" onClick={onCancel} style={styles.btnSecondary}>Cancelar</button>
            </div>
        </form>
    );
}

function ZonaForm({ initial = {}, onSave, onCancel }) {
    const [form, setForm] = useState({
        nombre: '', descripcion: '', capacidad_maxima: '', disponible: true, ...initial,
    });
    const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
            <div style={styles.formGrid}>
                <label style={styles.label}>Nombre *
                    <input style={styles.input} value={form.nombre} onChange={f('nombre')} required />
                </label>
                <label style={styles.label}>Capacidad Máxima *
                    <input style={styles.input} type="number" value={form.capacidad_maxima} onChange={f('capacidad_maxima')} required />
                </label>
            </div>
            <label style={styles.label}>Descripción
                <textarea style={{ ...styles.input, height: 80 }} value={form.descripcion} onChange={f('descripcion')} />
            </label>
            <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={form.disponible}
                    onChange={(e) => setForm({ ...form, disponible: e.target.checked })} />
                Zona disponible
            </label>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="submit" style={styles.btnPrimary}><Icon name="save" /> Guardar</button>
                <button type="button" onClick={onCancel} style={styles.btnSecondary}>Cancelar</button>
            </div>
        </form>
    );
}

function EntrenadorForm({ initial = {}, onSave, onCancel }) {
    const [form, setForm] = useState({
        nombre: '', apellido: '', especialidad: '', telefono: '', email: '', ...initial,
    });
    const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
            <div style={styles.formGrid}>
                <label style={styles.label}>Nombre *
                    <input style={styles.input} value={form.nombre} onChange={f('nombre')} required />
                </label>
                <label style={styles.label}>Apellido *
                    <input style={styles.input} value={form.apellido} onChange={f('apellido')} required />
                </label>
                <label style={styles.label}>Especialidad *
                    <input style={styles.input} value={form.especialidad} onChange={f('especialidad')} required />
                </label>
                <label style={styles.label}>Email *
                    <input style={styles.input} type="email" value={form.email} onChange={f('email')} required />
                </label>
                <label style={styles.label}>Teléfono
                    <input style={styles.input} value={form.telefono} onChange={f('telefono')} />
                </label>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="submit" style={styles.btnPrimary}><Icon name="save" /> Guardar</button>
                <button type="button" onClick={onCancel} style={styles.btnSecondary}>Cancelar</button>
            </div>
        </form>
    );
}

// ─── Sección CRUD genérica ────────────────────────────────────────────────────
function CrudSection({ title, icon, service, columns, FormComponent, rowKey = 'id' }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | 'create' | 'edit'
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await service.getAll();
            setData(res.data);
        } catch {
            setError('Error al cargar datos del servidor.');
        } finally {
            setLoading(false);
        }
    }, [service]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (form) => {
        try {
            if (modal === 'create') {
                await service.create(form);
                setMsg('✅ Registro creado exitosamente.');
            } else {
                await service.update(selected[rowKey], form);
                setMsg('✅ Registro actualizado exitosamente.');
            }
            setModal(null);
            setSelected(null);
            load();
        } catch (e) {
            const detail = e.response?.data;
            setError('Error: ' + JSON.stringify(detail));
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`¿Eliminar "${Object.values(item).slice(1, 3).join(' ')}"?`)) return;
        try {
            await service.delete(item[rowKey]);
            setMsg('✅ Eliminado correctamente.');
            load();
        } catch {
            setError('No se pudo eliminar el registro.');
        }
    };

    return (
        <div>
            <div style={styles.sectionHeader}>
                <h4 style={{ color: '#f36100', margin: 0 }}><Icon name={icon} /> {title}</h4>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={load} style={styles.btnSecondary}><Icon name="refresh" /> Actualizar</button>
                    <button onClick={() => { setModal('create'); setSelected(null); setError(''); setMsg(''); }}
                        style={styles.btnPrimary}><Icon name="add" /> Nuevo</button>
                </div>
            </div>

            {msg && <div style={styles.success}>{msg}</div>}
            {error && <div style={styles.errorMsg}>{error}</div>}

            {loading ? (
                <div style={styles.loading}>Cargando datos...</div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                {columns.map(c => (
                                    <th key={c.key} style={styles.th}>{c.label}</th>
                                ))}
                                <th style={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center', color: '#888', padding: 20 }}>
                                    Sin registros. Haz clic en "Nuevo" para agregar.
                                </td></tr>
                            ) : data.map((row) => (
                                <tr key={row[rowKey]} style={styles.tr}>
                                    {columns.map(c => (
                                        <td key={c.key} style={styles.td}>
                                            {c.render ? c.render(row[c.key], row) : String(row[c.key] ?? '-')}
                                        </td>
                                    ))}
                                    <td style={styles.td}>
                                        <button onClick={() => { setSelected(row); setModal('edit'); setError(''); setMsg(''); }}
                                            style={styles.btnEdit}><Icon name="edit" /></button>
                                        <button onClick={() => handleDelete(row)}
                                            style={styles.btnDelete}><Icon name="delete" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modal && (
                <Modal title={modal === 'create' ? `Nuevo ${title}` : `Editar ${title}`}
                    onClose={() => { setModal(null); setSelected(null); }}>
                    <FormComponent
                        initial={selected || {}}
                        onSave={handleSave}
                        onCancel={() => { setModal(null); setSelected(null); }}
                    />
                    {error && <div style={styles.errorMsg}>{error}</div>}
                </Modal>
            )}
        </div>
    );
}

// ─── Vista Dashboard: Estadísticas ───────────────────────────────────────────
function DashboardHome() {
    const [stats, setStats] = useState({ socios: '...', membresias: '...', zonas: '...', entrenadores: '...', reservas: '...' });

    useEffect(() => {
        const load = async () => {
            try {
                const [s, m, z, e, r] = await Promise.all([
                    sociosService.getAll(),
                    membresiasService.getAll(),
                    zonasService.getAll(),
                    entrenadoresService.getAll(),
                    reservasService.getAll(),
                ]);
                setStats({
                    socios: s.data.length,
                    membresias: m.data.length,
                    zonas: z.data.length,
                    entrenadores: e.data.length,
                    reservas: r.data.length,
                });
            } catch {
                setStats({ socios: '?', membresias: '?', zonas: '?', entrenadores: '?', reservas: '?' });
            }
        };
        load();
    }, []);

    return (
        <div>
            <h4 style={{ color: '#f36100', marginBottom: 24 }}>📊 Resumen General del Sistema</h4>
            <div style={styles.statsGrid}>
                <StatCard label="Socios Registrados" value={stats.socios} icon="socios" color="#f36100" />
                <StatCard label="Planes / Membresías" value={stats.membresias} icon="membresias" color="#e91e63" />
                <StatCard label="Zonas del Gimnasio" value={stats.zonas} icon="zonas" color="#2196f3" />
                <StatCard label="Entrenadores" value={stats.entrenadores} icon="entrenadores" color="#4caf50" />
                <StatCard label="Reservas Totales" value={stats.reservas} icon="reservas" color="#ff9800" />
            </div>
            <div style={{ marginTop: 32, padding: 20, background: '#1a1a1a', borderRadius: 12 }}>
                <h5 style={{ color: '#fff', marginBottom: 12 }}>ℹ️ Información del Sistema</h5>
                <p style={{ color: '#aaa', margin: 0 }}>
                    Panel administrativo conectado a <strong style={{ color: '#f36100' }}>Django REST API</strong> en{' '}
                    <code style={{ color: '#4caf50' }}>http://127.0.0.1:8000/api/</code>.
                    Autenticación mediante <strong style={{ color: '#f36100' }}>JWT (Bearer Token)</strong>.
                </p>
                <p style={{ color: '#aaa', marginTop: 8, marginBottom: 0 }}>
                    Usa el menú lateral para gestionar Socios, Membresías, Zonas, Entrenadores y Reservas.
                </p>
            </div>
        </div>
    );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function AdminDashboard() {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = [
        { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { key: 'socios', label: 'Socios', icon: 'socios' },
        { key: 'membresias', label: 'Membresías', icon: 'membresias' },
        { key: 'zonas', label: 'Zonas', icon: 'zonas' },
        { key: 'entrenadores', label: 'Entrenadores', icon: 'entrenadores' },
        { key: 'reservas', label: 'Reservas', icon: 'reservas' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardHome />;
            case 'socios': return (
                <CrudSection title="Socios" icon="socios" service={sociosService}
                    FormComponent={SocioForm}
                    columns={[
                        { key: 'id', label: '#' },
                        { key: 'cedula', label: 'Cédula' },
                        { key: 'nombre', label: 'Nombre' },
                        { key: 'apellido', label: 'Apellido' },
                        { key: 'email', label: 'Email' },
                        { key: 'telefono', label: 'Teléfono' },
                        { key: 'activo', label: 'Estado', render: (v) => v ? '✅ Activo' : '❌ Inactivo' },
                    ]}
                />
            );
            case 'membresias': return (
                <CrudSection title="Membresías" icon="membresias" service={membresiasService}
                    FormComponent={MembresiaForm}
                    columns={[
                        { key: 'id', label: '#' },
                        { key: 'nombre', label: 'Plan' },
                        { key: 'precio', label: 'Precio', render: (v) => `$${v}` },
                        { key: 'duracion_dias', label: 'Duración', render: (v) => `${v} días` },
                        { key: 'activa', label: 'Estado', render: (v) => v ? '✅ Activo' : '❌ Inactivo' },
                    ]}
                />
            );
            case 'zonas': return (
                <CrudSection title="Zonas del Gimnasio" icon="zonas" service={zonasService}
                    FormComponent={ZonaForm}
                    columns={[
                        { key: 'id', label: '#' },
                        { key: 'nombre', label: 'Zona' },
                        { key: 'capacidad_maxima', label: 'Capacidad' },
                        { key: 'disponible', label: 'Estado', render: (v) => v ? '✅ Disponible' : '❌ No disponible' },
                    ]}
                />
            );
            case 'entrenadores': return (
                <CrudSection title="Entrenadores" icon="entrenadores" service={entrenadoresService}
                    FormComponent={EntrenadorForm}
                    columns={[
                        { key: 'id', label: '#' },
                        { key: 'nombre', label: 'Nombre' },
                        { key: 'apellido', label: 'Apellido' },
                        { key: 'especialidad', label: 'Especialidad' },
                        { key: 'email', label: 'Email' },
                        { key: 'telefono', label: 'Teléfono' },
                    ]}
                />
            );
            case 'reservas': return (
                <CrudSection title="Reservas de Clases" icon="reservas" service={reservasService}
                    FormComponent={({ onCancel }) => (
                        <div>
                            <p style={{ color: '#aaa' }}>Para crear reservas usa el API directamente o agrega el formulario con IDs de socio, zona y entrenador.</p>
                            <button onClick={onCancel} style={styles.btnSecondary}>Cerrar</button>
                        </div>
                    )}
                    columns={[
                        { key: 'id', label: '#' },
                        { key: 'socio', label: 'Socio ID' },
                        { key: 'zona', label: 'Zona ID' },
                        { key: 'entrenador', label: 'Entrenador ID' },
                        { key: 'fecha_reserva', label: 'Fecha', render: (v) => v ? new Date(v).toLocaleString('es-EC') : '-' },
                        { key: 'estado', label: 'Estado' },
                    ]}
                />
            );
            default: return null;
        }
    };

    return (
        <div style={styles.adminLayout}>
            {/* Sidebar */}
            <aside style={{ ...styles.sidebar, width: sidebarOpen ? 240 : 60 }}>
                <div style={styles.sidebarBrand} onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? (
                        <><span style={{ color: '#f36100', fontWeight: 700, fontSize: 18 }}>GYM</span>
                            <span style={{ color: '#fff', fontWeight: 300 }}>Admin</span></>
                    ) : <span style={{ color: '#f36100', fontSize: 20 }}>G</span>}
                </div>

                <nav style={{ flex: 1 }}>
                    {menuItems.map(item => (
                        <button key={item.key}
                            onClick={() => setActiveTab(item.key)}
                            style={{
                                ...styles.navBtn,
                                background: activeTab === item.key ? '#f36100' : 'transparent',
                                color: activeTab === item.key ? '#fff' : '#ccc',
                                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                            }}>
                            <span style={{ fontSize: 18 }}><Icon name={item.icon} /></span>
                            {sidebarOpen && <span style={{ marginLeft: 10 }}>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <button onClick={logout} style={{ ...styles.navBtn, color: '#ff6b6b', marginTop: 'auto', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
                    <span style={{ fontSize: 18 }}><Icon name="logout" /></span>
                    {sidebarOpen && <span style={{ marginLeft: 10 }}>Cerrar Sesión</span>}
                </button>
            </aside>

            {/* Main content */}
            <div style={styles.mainContent}>
                {/* Top bar */}
                <header style={styles.topBar}>
                    <h6 style={{ margin: 0, color: '#fff' }}>
                        {menuItems.find(m => m.key === activeTab)?.label || 'Dashboard'}
                    </h6>
                    <div style={{ color: '#aaa', fontSize: 13 }}>
                        👤 <strong style={{ color: '#f36100' }}>{user?.username || 'Admin'}</strong>
                        &nbsp;|&nbsp; Sistema de Gestión Gym
                    </div>
                </header>

                {/* Content */}
                <main style={styles.content}>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

// ─── Estilos inline (sin conflicto con plantilla) ─────────────────────────────
const styles = {
    adminLayout: {
        display: 'flex', minHeight: '100vh',
        background: '#0d0d0d', fontFamily: "'Lato', sans-serif",
    },
    sidebar: {
        background: '#111', display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s', overflow: 'hidden',
        position: 'sticky', top: 0, height: '100vh',
        borderRight: '1px solid #222',
    },
    sidebarBrand: {
        padding: '20px 16px', display: 'flex', gap: 6, alignItems: 'center',
        borderBottom: '1px solid #222', cursor: 'pointer', minHeight: 60,
    },
    navBtn: {
        width: '100%', background: 'transparent', border: 'none',
        padding: '12px 16px', cursor: 'pointer', display: 'flex',
        alignItems: 'center', borderRadius: 6, margin: '2px 4px',
        transition: 'all 0.2s', fontSize: 14, width: 'calc(100% - 8px)',
    },
    mainContent: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
    topBar: {
        background: '#151515', padding: '12px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #222', position: 'sticky', top: 0, zIndex: 10,
    },
    content: { padding: 24, flex: 1 },
    statsGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 16,
    },
    statCard: {
        background: '#1a1a1a', borderRadius: 12, padding: 20,
        display: 'flex', gap: 16, alignItems: 'center',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
    },
    sectionHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16,
    },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
    th: {
        background: '#1e1e1e', color: '#f36100', padding: '10px 14px',
        textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #333',
    },
    td: { padding: '10px 14px', borderBottom: '1px solid #1e1e1e', color: '#ddd', verticalAlign: 'middle' },
    tr: { transition: 'background 0.2s', cursor: 'default' },
    loading: { padding: 40, textAlign: 'center', color: '#888' },
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    },
    modal: {
        background: '#1a1a1a', borderRadius: 12, width: '90%', maxWidth: 600,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
    },
    modalHeader: {
        padding: '16px 20px', borderBottom: '1px solid #333',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    modalBody: { padding: 20 },
    closeBtn: {
        background: 'none', border: 'none', color: '#fff',
        fontSize: 18, cursor: 'pointer',
    },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
    label: { display: 'flex', flexDirection: 'column', gap: 4, color: '#ccc', fontSize: 13 },
    input: {
        background: '#111', border: '1px solid #333', borderRadius: 6,
        padding: '8px 12px', color: '#fff', outline: 'none', fontSize: 14,
        width: '100%', boxSizing: 'border-box',
    },
    btnPrimary: {
        background: '#f36100', color: '#fff', border: 'none',
        padding: '8px 18px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
        display: 'flex', alignItems: 'center', gap: 6,
    },
    btnSecondary: {
        background: '#333', color: '#fff', border: 'none',
        padding: '8px 18px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
        display: 'flex', alignItems: 'center', gap: 6,
    },
    btnEdit: {
        background: '#2196f3', color: '#fff', border: 'none',
        padding: '5px 10px', borderRadius: 4, cursor: 'pointer', marginRight: 6,
    },
    btnDelete: {
        background: '#f44336', color: '#fff', border: 'none',
        padding: '5px 10px', borderRadius: 4, cursor: 'pointer',
    },
    success: {
        background: '#1b5e20', color: '#a5d6a7', padding: '10px 16px',
        borderRadius: 6, marginBottom: 16, fontSize: 13,
    },
    errorMsg: {
        background: '#b71c1c', color: '#ffcdd2', padding: '10px 16px',
        borderRadius: 6, marginBottom: 16, fontSize: 13,
    },
};
