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
};

export default Socios;