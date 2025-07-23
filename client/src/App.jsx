import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Login } from './Login/LoginTemp.jsx';
import { Register } from './Login/register.jsx';
import { Recuperar } from './Validation/Validaciones.jsx';
import { ResetPassword } from './Validation/ResetPassword.jsx';
import { Verificar } from './Validation/verificacion.jsx';
import Chatbot from './ChatBot/Chatbot.jsx';
import Landing from './Landing/Landing.jsx';

import './App.css';

function AppContent() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing');
  const navigate = useNavigate();

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    alert('Inicio de sesión exitoso.');
  };

  const handleRegisterSuccess = () => {
    alert('Registro exitoso. Te hemos enviado un enlace para verificar tu correo.');
    setView('verificacion');
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
  };

  const handlePasswordResetSuccess = () => {
    alert('Contraseña actualizada. Ahora puedes iniciar sesión.');
    setView('login'); // vuelve al login desde vista local
    navigate('/'); // redirige a la ruta raíz para mostrar el login
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <div>
              <button onClick={handleLogout} style={{ margin: '10px' }}>
                Cerrar sesión
              </button>
              <Chatbot />
            </div>
          ) : (
            <div className="auth-container">
              {view === 'landing' && <Landing onStart={() => setView('login')} />}
              {view === 'login' && (
                <Login
                  onLoginSuccess={handleLoginSuccess}
                  switchToRegister={() => setView('register')}
                  switchToForgot={() => setView('forgot')}
                />
              )}
              {view === 'register' && (
                <Register
                  onRegisterSuccess={handleRegisterSuccess}
                  switchToLogin={() => setView('login')}
                />
              )}
              {view === 'verificacion' && (
                <div className="form-container">
                  <h2>Verifica tu correo</h2>
                  <p>Te hemos enviado un enlace de verificación a tu correo electrónico.</p>
                  <p>Por favor, haz clic en ese enlace para activar tu cuenta.</p>
                  <button onClick={() => setView('login')}>Volver al inicio</button>
                </div>
              )}
              {view === 'forgot' && <Recuperar volver={() => setView('login')} />}
            </div>
          )
        }
      />
      <Route path="/resetear/:token" element={<ResetPassword onSuccess={handlePasswordResetSuccess} />} />
      <Route path="/verificar/:token" element={<Verificar setView={setView} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
