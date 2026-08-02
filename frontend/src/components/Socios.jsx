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