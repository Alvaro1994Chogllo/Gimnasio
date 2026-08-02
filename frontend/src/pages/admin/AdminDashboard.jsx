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

function ReservaForm({ initial = {}, onSave, onCancel, currentUser }) {
    const isSocio = currentUser?.role === 'SOCIO';
    const isEntrenador = currentUser?.role === 'ENTRENADOR';

    const [form, setForm] = useState({
        socio: isSocio ? currentUser.socio_id : '',
        zona: '',
        entrenador: isEntrenador ? currentUser.entrenador_id : '',
        fecha_reserva: '',
        estado: 'CONFIRMADA',
        ...initial,
    });
    const [socios, setSocios] = useState([]);
    const [zonas, setZonas] = useState([]);
    const [entrenadores, setEntrenadores] = useState([]);
    const [loadingOpts, setLoadingOpts] = useState(true);

    useEffect(() => {
        Promise.all([
            sociosService.getAll(),
            zonasService.getAll(),
            entrenadoresService.getAll(),
        ]).then(([s, z, e]) => {
            setSocios(s.data);
            setZonas(z.data);
            setEntrenadores(e.data);
        }).finally(() => setLoadingOpts(false));
    }, []);

    // Asegurarse de que si es Socio o Entrenador, se guarden sus IDs correctos al iniciar
    useEffect(() => {
        if (isSocio && currentUser.socio_id) {
            setForm(prev => ({ ...prev, socio: currentUser.socio_id }));
        }
        if (isEntrenador && currentUser.entrenador_id) {
            setForm(prev => ({ ...prev, entrenador: currentUser.entrenador_id }));
        }
    }, [isSocio, isEntrenador, currentUser]);

    const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    if (loadingOpts) return <div style={{ color: '#aaa', padding: 20 }}>Cargando opciones...</div>;

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
            <div style={styles.formGrid}>
                {/* Campo Socio */}
                {isSocio ? (
                    <label style={styles.label}>Socio
                        <input
                            style={{ ...styles.input, opacity: 0.7 }}
                            value={socios.find(s => Number(s.id) === Number(currentUser.socio_id)) ? `${socios.find(s => Number(s.id) === Number(currentUser.socio_id)).nombre} ${socios.find(s => Number(s.id) === Number(currentUser.socio_id)).apellido}` : 'Cargando socio...' }
                            disabled
                        />
                    </label>
                ) : (
                    <label style={styles.label}>Socio {isEntrenador ? '' : '*'}
                        <select style={styles.input} value={form.socio} onChange={f('socio')} required={!isEntrenador}>
                            <option value="">-- Seleccionar socio --</option>
                            {socios.map(s => (
                                <option key={s.id} value={s.id}>{s.nombre} {s.apellido} ({s.cedula})</option>
                            ))}
                        </select>
                    </label>
                )}

                {/* Campo Zona */}
                <label style={styles.label}>Zona *
                    <select style={styles.input} value={form.zona} onChange={f('zona')} required>
                        <option value="">-- Seleccionar zona --</option>
                        {zonas.map(z => (
                            <option key={z.id} value={z.id}>{z.nombre}</option>
                        ))}
                    </select>
                </label>

                {/* Campo Entrenador */}
                {isEntrenador ? (
                    <label style={styles.label}>Entrenador
                        <input
                            style={{ ...styles.input, opacity: 0.7 }}
                            value={entrenadores.find(e => Number(e.id) === Number(currentUser.entrenador_id)) ? `${entrenadores.find(e => Number(e.id) === Number(currentUser.entrenador_id)).nombre} ${entrenadores.find(e => Number(e.id) === Number(currentUser.entrenador_id)).apellido}` : 'Cargando entrenador...' }
                            disabled
                        />
                    </label>
                ) : (
                    <label style={styles.label}>Entrenador
                        <select style={styles.input} value={form.entrenador} onChange={f('entrenador')}>
                            <option value="">-- Sin entrenador --</option>
                            {entrenadores.map(e => (
                                <option key={e.id} value={e.id}>{e.nombre} {e.apellido} · {e.especialidad}</option>
                            ))}
                        </select>
                    </label>
                )}

                {/* Campo Fecha */}
                <label style={styles.label}>Fecha y Hora *
                    <input style={styles.input} type="datetime-local" value={form.fecha_reserva} onChange={f('fecha_reserva')} required />
                </label>

                {/* Campo Estado */}
                <label style={styles.label}>Estado *
                    <select style={styles.input} value={form.estado} onChange={f('estado')} required>
                        <option value="CONFIRMADA">Confirmada</option>
                        <option value="CANCELADA">Cancelada</option>
                        <option value="ASISTIO">Asistió</option>
                    </select>
                </label>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="submit" style={styles.btnPrimary}><Icon name="save" /> Guardar</button>
                <button type="button" onClick={onCancel} style={styles.btnSecondary}>Cancelar</button>
            </div>
        </form>
    );
}

// ─── Vista Unificada de Reservas con Calendario ──────────────────────────────
function ReservasUnifiedView({ currentUser }) {
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
    const [zonas, setZonas] = useState([]);
    const [selectedZona, setSelectedZona] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [reservas, setReservas] = useState([]);
    const [sociosMap, setSociosMap] = useState({});
    const [entrenadoresMap, setEntrenadoresMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | 'create' | 'edit'
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [ticketData, setTicketData] = useState(null); // null | reserva details
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');

    const HOURLY_SLOTS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
    const DAYS_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    const getMonday = (d) => {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(date.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday;
    };

    const monday = getMonday(currentDate);
    const weekDays = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });

    const loadInitialData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [zRes, sRes, eRes] = await Promise.all([
                zonasService.getAll(),
                sociosService.getAll(),
                entrenadoresService.getAll(),
            ]);

            setZonas(zRes.data);
            if (zRes.data.length > 0) {
                setSelectedZona(zRes.data[0].id);
            }

            const sMap = {};
            sRes.data.forEach(s => { sMap[s.id] = `${s.nombre} ${s.apellido}`; });
            setSociosMap(sMap);

            const eMap = {};
            eRes.data.forEach(e => { eMap[e.id] = `${e.nombre} ${e.apellido}`; });
            setEntrenadoresMap(eMap);
        } catch (err) {
            setError('Error al cargar datos base del sistema.');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadReservas = useCallback(async () => {
        try {
            const res = await reservasService.getAll();
            setReservas(res.data);
        } catch (err) {
            setError('Error al cargar reservas.');
        }
    }, []);

    useEffect(() => {
        loadInitialData();
        loadReservas();
    }, [loadInitialData, loadReservas]);

    const handleSave = async (form) => {
        try {
            let savedRes;
            if (modal === 'create') {
                savedRes = await reservasService.create(form);
                setMsg('✅ Reserva creada con éxito.');
            } else {
                savedRes = await reservasService.update(selectedReserva.id, form);
                setMsg('✅ Reserva actualizada con éxito.');
            }

            const savedData = savedRes.data;
            const fullDetails = {
                id: savedData.id,
                socio: savedData.socio_nombre || sociosMap[savedData.socio] || 'Sin Socio / Bloqueo de Sala',
                zona: zonas.find(z => Number(z.id) === Number(savedData.zona))?.nombre || 'Sala',
                entrenador: entrenadoresMap[savedData.entrenador] || 'Sin Entrenador',
                fecha: new Date(savedData.fecha_reserva).toLocaleString('es-EC', { dateStyle: 'long', timeStyle: 'short' }),
                estado: savedData.estado
            };

            setModal(null);
            setSelectedReserva(null);
            loadReservas();

            // Desplegar ticket al finalizar
            setTicketData(fullDetails);
        } catch (e) {
            const detail = e.response?.data;
            setError('Error: ' + JSON.stringify(detail));
        }
    };

    const handleDelete = async (reserva) => {
        if (!window.confirm('¿Desea cancelar esta reserva?')) return;
        try {
            await reservasService.delete(reserva.id);
            setMsg('✅ Reserva eliminada correctamente.');
            loadReservas();
        } catch {
            setError('No se pudo cancelar la reserva.');
        }
    };

    const getReservaForSlot = (day, hour) => {
        return reservas.find(r => {
            const rDate = new Date(r.fecha_reserva);
            return Number(r.zona) === Number(selectedZona) &&
                   rDate.getFullYear() === day.getFullYear() &&
                   rDate.getMonth() === day.getMonth() &&
                   rDate.getDate() === day.getDate() &&
                   rDate.getHours() === hour;
        });
    };

    const handleSlotClick = (day, hour) => {
        const year = day.getFullYear();
        const month = String(day.getMonth() + 1).padStart(2, '0');
        const dateStr = String(day.getDate()).padStart(2, '0');
        const hourStr = String(hour).padStart(2, '0');
        const localDateTime = `${year}-${month}-${dateStr}T${hourStr}:00`;

        setSelectedReserva(null);
        setError('');
        setMsg('');
        setModal('create');
        setSelectedReserva({
            zona: selectedZona,
            fecha_reserva: localDateTime,
            estado: 'CONFIRMADA'
        });
    };

    if (loading) return <div style={styles.loading}>Cargando reservas y zonas...</div>;

    const listColumns = [
        { key: 'id', label: '#' },
        { key: 'socio', label: 'Socio', render: (v, row) => row.socio_nombre || sociosMap[v] || 'Sin Socio (Bloqueo)' },
        { key: 'zona', label: 'Zona', render: (v, row) => row.zona_nombre || 'Sala' },
        { key: 'entrenador', label: 'Entrenador', render: (v, row) => row.entrenador_nombre || entrenadoresMap[v] || 'Sin Entrenador' },
        { key: 'fecha_reserva', label: 'Fecha y Hora', render: (v) => v ? new Date(v).toLocaleString('es-EC') : '-' },
        { key: 'estado', label: 'Estado' }
    ];

    const isAdmin = currentUser?.role === 'ADMIN';

    return (
        <div>
            {/* Cabecera / Controles */}
            <div style={styles.header}>
                <div style={styles.selectorGroup}>
                    {viewMode === 'calendar' && (
                        <>
                            <label style={styles.label}>Zona / Sala:</label>
                            <select
                                value={selectedZona}
                                onChange={(e) => setSelectedZona(e.target.value)}
                                style={styles.select}
                            >
                                {zonas.map(z => (
                                    <option key={z.id} value={z.id}>{z.nombre}</option>
                                ))}
                            </select>
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {isAdmin && (
                        <div style={styles.toggleGroup}>
                            <button
                                onClick={() => setViewMode('calendar')}
                                style={{ ...styles.toggleBtn, background: viewMode === 'calendar' ? '#f36100' : '#333' }}
                            >
                                📅 Calendario
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                style={{ ...styles.toggleBtn, background: viewMode === 'list' ? '#f36100' : '#333' }}
                            >
                                📋 Listado
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => {
                            setSelectedReserva(null);
                            setError('');
                            setMsg('');
                            setModal('create');
                        }}
                        style={styles.btnPrimary}
                    >
                        <Icon name="add" /> Reservar
                    </button>
                </div>
            </div>

            {msg && <div style={styles.success}>{msg}</div>}
            {error && <div style={styles.errorMsg}>{error}</div>}

            {/* Vista 1: Calendario Semanal */}
            {viewMode === 'calendar' && (
                <div>
                    <div style={styles.calendarSubHeader}>
                        <div style={styles.navigation}>
                            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))} style={styles.navBtn}>◀ Anterior</button>
                            <button onClick={() => setCurrentDate(new Date())} style={styles.navBtn}>Hoy</button>
                            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))} style={styles.navBtn}>Siguiente ▶</button>
                            <span style={styles.weekTitle}>
                                Semana del {monday.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })} al {weekDays[6].toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto', marginTop: 12 }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.timeColHeader}>Hora</th>
                                    {weekDays.map((day, idx) => (
                                        <th key={idx} style={styles.dayColHeader}>
                                            <div style={{ color: '#f36100' }}>{DAYS_NAMES[idx]}</div>
                                            <div style={{ fontSize: 11, color: '#aaa', fontWeight: 'normal' }}>
                                                {day.toLocaleDateString('es-EC', { day: 'numeric', month: 'numeric' })}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {HOURLY_SLOTS.map(hour => {
                                    const timeLabel = `${String(hour).padStart(2, '0')}:00 - ${String(hour + 1).padStart(2, '0')}:00`;
                                    return (
                                        <tr key={hour} style={styles.row}>
                                            <td style={styles.timeCell}>{timeLabel}</td>
                                            {weekDays.map((day, idx) => {
                                                const res = getReservaForSlot(day, hour);
                                                return (
                                                    <td key={idx} style={styles.slotCell}>
                                                        {res ? (
                                                            <div style={{
                                                                ...styles.reservedCard,
                                                                background: res.estado === 'CANCELADA' ? 'rgba(244, 67, 54, 0.15)' : 'rgba(243, 97, 0, 0.15)',
                                                                borderLeft: `4px solid ${res.estado === 'CANCELADA' ? '#f44336' : '#f36100'}`,
                                                                cursor: isAdmin ? 'pointer' : 'default'
                                                            }}
                                                            onClick={() => {
                                                                if (isAdmin) {
                                                                    setSelectedReserva(res);
                                                                    setModal('edit');
                                                                    setError('');
                                                                }
                                                            }}>
                                                                <div style={styles.resSocio}>👤 {res.socio_nombre || sociosMap[res.socio] || 'Bloqueo / Clase'}</div>
                                                                {res.entrenador && (
                                                                    <div style={styles.resTrainer}>💪 {entrenadoresMap[res.entrenador]}</div>
                                                                )}
                                                                <div style={{
                                                                    ...styles.resStatus,
                                                                    color: res.estado === 'CONFIRMADA' ? '#4caf50' : res.estado === 'CANCELADA' ? '#f44336' : '#2196f3'
                                                                }}>
                                                                    {res.estado}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                style={styles.freeCard}
                                                                onClick={() => handleSlotClick(day, hour)}
                                                                title="Hacer clic para reservar esta hora"
                                                            >
                                                                <span style={{ color: '#4caf50', fontSize: 11 }}>➕ Libre</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Vista 2: Listado CRUD (para Admins) */}
            {viewMode === 'list' && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                {listColumns.map(c => (
                                    <th key={c.key} style={styles.th}>{c.label}</th>
                                ))}
                                <th style={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservas.length === 0 ? (
                                <tr>
                                    <td colSpan={listColumns.length + 1} style={{ textAlign: 'center', color: '#888', padding: 20 }}>
                                        Sin registros de reservas.
                                    </td>
                                </tr>
                            ) : (
                                reservas.map(row => (
                                    <tr key={row.id} style={styles.tr}>
                                        {listColumns.map(c => (
                                            <td key={c.key} style={styles.td}>
                                                {c.render ? c.render(row[c.key], row) : String(row[c.key] ?? '-')}
                                            </td>
                                        ))}
                                        <td style={styles.td}>
                                            <button onClick={() => { setSelectedReserva(row); setModal('edit'); setError(''); }} style={styles.btnEdit}><Icon name="edit" /></button>
                                            <button onClick={() => handleDelete(row)} style={styles.btnDelete}><Icon name="delete" /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Formulario */}
            {modal && (
                <Modal title={modal === 'create' ? "Nueva Reserva de Clase" : "Editar Reserva"} onClose={() => setModal(null)}>
                    <ReservaForm
                        initial={selectedReserva || {}}
                        onSave={handleSave}
                        onCancel={() => setModal(null)}
                        currentUser={currentUser}
                    />
                </Modal>
            )}

            {/* Modal de Ticket de Confirmación */}
            {ticketData && (
                <div style={styles.overlay}>
                    <div style={{ ...styles.modal, maxWidth: '400px', border: '2px solid #f36100' }}>
                        <div style={{ ...styles.modalHeader, background: '#111', borderBottom: '1px dashed #f36100' }}>
                            <h4 style={{ color: '#f36100', margin: 0, letterSpacing: '1px' }}>🎫 CONFIRMACIÓN DE TURNO</h4>
                            <button onClick={() => setTicketData(null)} style={styles.closeBtn}><Icon name="close" /></button>
                        </div>
                        <div style={{ padding: '24px', background: '#151515', color: '#fff', fontFamily: 'monospace' }}>
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: '0 0 5px 0', color: '#f36100' }}>GYM RESERVA</h3>
                                <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>¡Tu reserva ha sido procesada con éxito!</p>
                            </div>
                            <hr style={{ borderTop: '1px dashed #333', margin: '15px 0' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                                <div><strong>Nº RESERVA:</strong> #{ticketData.id}</div>
                                <div><strong>SOCIO:</strong> {ticketData.socio}</div>
                                <div><strong>SALA/ZONA:</strong> {ticketData.zona}</div>
                                <div><strong>ENTRENADOR:</strong> {ticketData.entrenador}</div>
                                <div><strong>FECHA Y HORA:</strong> {ticketData.fecha}</div>
                                <div><strong>ESTADO:</strong> <span style={{ color: '#4caf50', fontWeight: 'bold' }}>{ticketData.estado}</span></div>
                            </div>
                            <hr style={{ borderTop: '1px dashed #333', margin: '20px 0' }} />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => window.print()}
                                    style={{ ...styles.btnPrimary, flex: 1, justifyContent: 'center' }}
                                >
                                    🖨️ Imprimir
                                </button>
                                <button
                                    onClick={() => setTicketData(null)}
                                    style={{ ...styles.btnSecondary, flex: 1, justifyContent: 'center' }}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
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

        </div>
    );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function AdminDashboard() {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = [
        { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['ADMIN'] },
        { key: 'socios', label: 'Socios', icon: 'socios', roles: ['ADMIN'] },
        { key: 'membresias', label: 'Membresías', icon: 'membresias', roles: ['ADMIN'] },
        { key: 'zonas', label: 'Zonas', icon: 'zonas', roles: ['ADMIN'] },
        { key: 'entrenadores', label: 'Entrenadores', icon: 'entrenadores', roles: ['ADMIN'] },
        { key: 'reservas', label: 'Reservas', icon: 'reservas', roles: ['ADMIN', 'ENTRENADOR', 'SOCIO'] },
    ].filter(item => item.roles.includes(user?.role || 'ADMIN'));

    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            setActiveTab('reservas');
        }
    }, [user]);

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
            case 'reservas': return <ReservasUnifiedView currentUser={user} />;
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
    calendarSubHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#151515',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #222',
        marginBottom: '12px'
    },
    navigation: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    navBtn: {
        background: '#333',
        color: '#fff',
        border: 'none',
        padding: '8px 14px',
        borderRadius: 6,
        cursor: 'pointer',
        fontSize: 13,
        transition: 'background 0.2s',
    },
    weekTitle: { color: '#fff', fontWeight: 600, fontSize: 14, marginLeft: 8 },
    timeColHeader: {
        background: '#1e1e1e',
        color: '#f36100',
        padding: '12px',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 13,
        borderBottom: '2px solid #333',
        width: '100px'
    },
    dayColHeader: {
        background: '#1e1e1e',
        padding: '12px',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 13,
        borderBottom: '2px solid #333',
        minWidth: '120px'
    },
    row: { borderBottom: '1px solid #222' },
    timeCell: {
        background: '#151515',
        color: '#ccc',
        textAlign: 'center',
        padding: '12px 8px',
        fontSize: 12,
        fontWeight: 600,
        borderRight: '1px solid #222'
    },
    slotCell: {
        padding: '6px',
        background: '#0e0e0e',
        height: '60px',
        verticalAlign: 'middle',
        borderRight: '1px solid #1f1f1f'
    },
    reservedCard: {
        borderRadius: 6,
        padding: '8px',
        fontSize: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    },
    resSocio: { color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    resTrainer: { color: '#bbb', fontSize: 11 },
    resStatus: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginTop: 2 },
    freeCard: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        borderRadius: 6,
        border: '1px dashed #222',
        background: 'rgba(0,0,0,0.2)',
        transition: 'all 0.2s',
        cursor: 'pointer'
    },
    toggleGroup: { display: 'flex', background: '#222', borderRadius: '6px', padding: '2px' },
    toggleBtn: {
        border: 'none',
        color: '#fff',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        transition: 'background 0.2s'
    },
    header: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
        background: '#151515',
        padding: 16,
        borderRadius: 8,
        border: '1px solid #222'
    },
    selectorGroup: { display: 'flex', alignItems: 'center', gap: 10 },
    select: {
        background: '#111',
        border: '1px solid #333',
        borderRadius: 6,
        padding: '8px 12px',
        color: '#fff',
        fontSize: 14,
        outline: 'none',
        cursor: 'pointer'
    },
};
