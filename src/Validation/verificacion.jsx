import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export function Verificar({ setView }) {
  const { token } = useParams();
  const navigate = useNavigate(); // ✅ Navegador
  const [mensaje, setMensaje] = useState('Verificando tu cuenta...');
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    const verificar = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/verificar/${token}`);
        setMensaje(res.data || 'Cuenta verificada correctamente.');
        setVerificado(true);

        // Redirige automáticamente luego de 3s
        setTimeout(() => {
          setView('login');
          navigate('/');
        }, 3000);
      } catch (e) {
        console.error('Error al verificar el token:', e);
        setMensaje('Enlace inválido o expirado.');
      }
    };

    verificar();
  }, [token, setView, navigate]);

  const volverAlInicio = () => {
    setView('login');
    navigate('/');
  };

  return (
    <div className="form-container">
      <h2>{mensaje}</h2>
      <p>Redirigiendo al inicio de sesión...</p>

      {verificado && (
        <button onClick={volverAlInicio}>Volver al inicio</button>
      )}
    </div>
  );
}
