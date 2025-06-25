import { useParams } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

export function ResetPassword() {
  const { token } = useParams();
  const [clave, setClave] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (clave !== confirmar) {
      return setMensaje('Las contraseñas no coinciden.');
    }
    try {
      await axios.post(`http://localhost:3000/resetear/${token}`, { nuevaClave: clave });
      setMensaje('Contraseña actualizada.');
    } catch {
      setMensaje('Error al actualizar.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Restablecer contraseña</h2>
      <input type="password" placeholder="Nueva" value={clave} onChange={(e) => setClave(e.target.value)} />
      <input type="password" placeholder="Confirmar" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
      <button type="submit">Actualizar</button>
      {mensaje && <p>{mensaje}</p>}
    </form>
  );
}
