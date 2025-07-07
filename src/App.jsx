import React, { useState } from 'react';
import { Login } from './Login/LoginTemp.jsx';
import { Register } from './Login/register.jsx';
import Chatbot from './ChatBot/Chatbot.jsx';
import Landing from './Landing/Landing.jsx';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); // 'landing', 'login', 'register'

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleRegisterSuccess = () => {
    alert('Registro exitoso. Ahora inicia sesión.');
    setView('login');
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
  };

  if (user) {
    return (
      <div>
        <button onClick={handleLogout} style={{ margin: '10px' }}>
          Cerrar sesión
        </button>
        <Chatbot />
      </div>
    );
  }

  return (
    <div className="auth-container">
      {view === 'landing' && <Landing onStart={() => setView('login')} />}
      {view === 'login' && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          switchToRegister={() => setView('register')}
        />
      )}
      {view === 'register' && (
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          switchToLogin={() => setView('login')}
        />
      )}
    </div>
  );
}
