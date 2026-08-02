import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Socios = () => {
  const [socios, setSocios] = useState([]);
  const [nuevoSocio, setNuevoSocio] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
  });

  // 1. LEER (GET)
  const cargarSocios = async () => {
    try {
      const response = await api.get('socios/');
      setSocios(response.data);
    } catch (error) {
      console.error('Error al cargar socios:', error);
    }
  };

  useEffect(() => {
    cargarSocios();
  }, []);
  
  // 2. CREAR (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('socios/', nuevoSocio);
      setNuevoSocio({ cedula: '', nombre: '', apellido: '', email: '', telefono: '', fecha_nacimiento: '' });
      cargarSocios();
    } catch (error) {
      console.error('Error al crear socio:', error);
    }
  };
   // 3. ELIMINAR (DELETE)
  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este socio?')) {
      try {
        await api.delete(`socios/${id}/`);
        cargarSocios();
      } catch (error) {
        console.error('Error al eliminar socio:', error);
      }
    }
  };
   return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', textAlign: 'left' }}>
      <h2>Gestión de Socios</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Cédula"
          value={nuevoSocio.cedula}
          onChange={(e) => setNuevoSocio({ ...nuevoSocio, cedula: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Nombre"
          value={nuevoSocio.nombre}
          onChange={(e) => setNuevoSocio({ ...nuevoSocio, nombre: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Apellido"
          value={nuevoSocio.apellido}
          onChange={(e) => setNuevoSocio({ ...nuevoSocio, apellido: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={nuevoSocio.email}
          onChange={(e) => setNuevoSocio({ ...nuevoSocio, email: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Teléfono"
          value={nuevoSocio.telefono}
          onChange={(e) => setNuevoSocio({ ...nuevoSocio, telefono: e.target.value })}
        />
        <input
          type="date"
          value={nuevoSocio.fecha_nacimiento}
          onChange={(e) => setNuevoSocio({ ...nuevoSocio, fecha_nacimiento: e.target.value })}
          required
        />
        <button type="submit">Agregar Socio</button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
        {socios.map((socio) => (
          <div key={socio.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{socio.nombre} {socio.apellido}</h3>
            <p style={{ margin: '0 0 6px 0' }}><strong>Cédula:</strong> {socio.cedula}</p>
            <p style={{ margin: '0 0 6px 0' }}><strong>Email:</strong> {socio.email}</p>
            <p style={{ margin: '0 0 10px 0' }}><strong>Teléfono:</strong> {socio.telefono}</p>
            <button onClick={() => handleDelete(socio.id)} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Socios;