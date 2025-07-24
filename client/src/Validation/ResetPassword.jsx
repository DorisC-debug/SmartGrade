import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import '../Login/Login.css';

export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate(); // <-- Hook para redirigir
  const [clave, setClave] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (clave !== confirmar) {
      return setMensaje('Las contraseñas no coinciden.');
    }
    try {
      console.log('Clave a enviar:', clave);
      await axios.post(`${import.meta.env.FRONTEND_URL}/resetear/${token}`, { nuevaContraseña: clave });
      setMensaje('Contraseña actualizada.');
      // Redirigir al login después de un pequeño delay para que vea el mensaje
      setTimeout(() => {
        navigate('/'); // Ruta raíz, que en tu App.jsx muestra el login si no hay usuario
      }, 1500);
    } catch (error) {
      console.error('Error al actualizar la contraseña:', error);
      if (error.response && error.response.status === 400) {
        setMensaje('La contraseña debe tener al menos 8 caracteres.');
      } else {
        setMensaje('Error al actualizar.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Restablecer contraseña</h2>
      <input
        type="password"
        placeholder="Nueva"
        value={clave}
        onChange={(e) => setClave(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirmar"
        value={confirmar}
        onChange={(e) => setConfirmar(e.target.value)}
      />
      <button type="submit">Actualizar</button>
      {mensaje && <p>{mensaje}</p>}
    </form>
  );
}
