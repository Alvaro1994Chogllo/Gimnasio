import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Entrenadores = () => {
  const [entrenadores, setEntrenadores] = useState([]);
  const [nuevoEntrenador, setNuevoEntrenador] = useState({
    nombre: '',
    apellido: '',
    especialidad: '',
    telefono: '',
    email: '',
  });

  // 1. LEER (GET)
  const cargarEntrenadores = async () => {
    try {
      const response = await api.get('entrenadores/');
      setEntrenadores(response.data);
    } catch (error) {
      console.error('Error al cargar entrenadores:', error);
    }
  };

  useEffect(() => {
    cargarEntrenadores();
  }, []);

  // 2. CREAR (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('entrenadores/', nuevoEntrenador);
      setNuevoEntrenador({ nombre: '', apellido: '', especialidad: '', telefono: '', email: '' });
      cargarEntrenadores();
    } catch (error) {
      console.error('Error al crear entrenador:', error);
    }
  };

  // 3. ELIMINAR (DELETE)
  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este entrenador?')) {
      try {
        await api.delete(`entrenadores/${id}/`);
        cargarEntrenadores();
      } catch (error) {
        console.error('Error al eliminar entrenador:', error);
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', textAlign: 'left' }}>
      <h2>Gestión de Entrenadores</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Nombre"
          value={nuevoEntrenador.nombre}
          onChange={(e) => setNuevoEntrenador({ ...nuevoEntrenador, nombre: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Apellido"
          value={nuevoEntrenador.apellido}
          onChange={(e) => setNuevoEntrenador({ ...nuevoEntrenador, apellido: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Especialidad"
          value={nuevoEntrenador.especialidad}
          onChange={(e) => setNuevoEntrenador({ ...nuevoEntrenador, especialidad: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={nuevoEntrenador.email}
          onChange={(e) => setNuevoEntrenador({ ...nuevoEntrenador, email: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Teléfono"
          value={nuevoEntrenador.telefono}
          onChange={(e) => setNuevoEntrenador({ ...nuevoEntrenador, telefono: e.target.value })}
        />
        <button type="submit">Agregar Entrenador</button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
        {entrenadores.map((entrenador) => (
          <div key={entrenador.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{entrenador.nombre} {entrenador.apellido}</h3>
            <p style={{ margin: '0 0 6px 0' }}><strong>Especialidad:</strong> {entrenador.especialidad}</p>
            <p style={{ margin: '0 0 6px 0' }}><strong>Email:</strong> {entrenador.email}</p>
            <p style={{ margin: '0 0 10px 0' }}><strong>Teléfono:</strong> {entrenador.telefono}</p>
            <button onClick={() => handleDelete(entrenador.id)} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Entrenadores;
