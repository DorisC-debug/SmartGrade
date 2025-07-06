import { useState } from 'react';
import axios from 'axios';
import '../Login/Login.css'


export function Recuperar({ volver }) {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/recuperar', { correo });
      setMensaje('Si el correo existe, se envió un enlace.');
    } catch {
      setMensaje('Error al enviar correo.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>Recuperar contraseña</h2>
      <input
        type="email"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        placeholder="Tu correo"
        required
      />
      <button type="submit">Enviar  Enlace</button>
      <button type="button" onClick={volver}>Volver</button>
      {mensaje && <p>{mensaje}</p>}
    </form>
  );
}
