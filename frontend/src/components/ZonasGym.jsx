import React, { useEffect, useState } from 'react';
import api from '../services/api';

const ZonasGym = () => {
  const [zonas, setZonas] = useState([]);
  const [nuevaZona, setNuevaZona] = useState({ nombre: '', descripcion: '', capacidad_maxima: 20 });

 
  const cargarZonas = async () => {
    try {
      const response = await api.get('zonas/');
      setZonas(response.data);
    } catch (error) {
      console.error('Error al cargar zonas:', error);
    }
  };

  useEffect(() => {
    cargarZonas();
  }, []);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('zonas/', nuevaZona);
      setNuevaZona({ nombre: '', descripcion: '', capacidad_maxima: 20 });
      cargarZonas(); // Recargar listado
    } catch (error) {
      console.error('Error al crear zona:', error);
    }
  };

  
  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta zona?')) {
      try {
        await api.delete(`zonas/${id}/`);
        cargarZonas();
      } catch (error) {
        console.error('Error al eliminar zona:', error);
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
      <h2>Gestión de Zonas / Áreas del Gimnasio</h2>

      {/* Formulario de Creación */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Nombre de la zona"
          value={nuevaZona.nombre}
          onChange={(e) => setNuevaZona({ ...nuevaZona, nombre: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Descripción"
          value={nuevaZona.descripcion}
          onChange={(e) => setNuevaZona({ ...nuevaZona, descripcion: e.target.value })}
        />
        <input
          type="number"
          placeholder="Capacidad"
          value={nuevaZona.capacidad_maxima}
          onChange={(e) => setNuevaZona({ ...nuevaZona, capacidad_maxima: e.target.value })}
          required
          style={{ width: '80px' }}
        />
        <button type="submit">Agregar Zona</button>
      </form>

      {/* Listado de Tarjetas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
        {zonas.map((zona) => (
          <div key={zona.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{zona.nombre}</h3>
            <p style={{ margin: '0 0 10px 0' }}>{zona.descripcion}</p>
            <p style={{ margin: '0 0 10px 0' }}><strong>Capacidad:</strong> {zona.capacidad_maxima} personas</p>
            <button onClick={() => handleDelete(zona.id)} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ZonasGym;
