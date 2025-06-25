
import React, { useState } from 'react';
import  {Login} from './Login/LoginTemp.jsx';
import { Register } from './Login/register.jsx';
import Chatbot  from './ChatBot/Chatbot.jsx';
import './App.css';


export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // login o register

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleRegisterSuccess = () => {
    alert('Registro exitoso. Ahora inicia sesión.');
    setView('login');
  };

  const handleLogout = () => {
    setUser(null);
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
  {view === 'login' ? (
    <Login onLoginSuccess={handleLoginSuccess} switchToRegister={() => setView('register')} />
  ) : (
    <Register onRegisterSuccess={handleRegisterSuccess} switchToLogin={() => setView('login')} />
  )}
</div>
  );


 
}
