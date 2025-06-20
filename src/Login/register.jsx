import { useState } from 'react'
import axios from 'axios'
import './Login.css'

export function Register({ onRegisterSuccess, switchToLogin }) {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:3000/register', {
        nombre,
        correo,
        contraseña
      })
      onRegisterSuccess()
    } catch (err) {
      setError(err.response?.data || 'Error al registrarse')
    }
  }

  return (
    <div className="card">
      <h4 className="title">Registro</h4>
      <form onSubmit={handleSubmit}>
        {error && <p className="login-error">{error}</p>}

        <div className="field">
          <svg className="input-icon" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/>
          </svg>
          <input
            type="text"
            className="input-field"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <svg className="input-icon" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
            <path d="...email icon path..."></path>
          </svg>
          <input
            type="email"
            className="input-field"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <svg className="input-icon" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
            <path d="...password icon path..."></path>
          </svg>
          <input
            type="password"
            className="input-field"
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
          />
        </div>

        <button className="btn" type="submit">Registrarse</button>

        {/* botón para ir a login */}
        <div className="switch-container">
          <p>¿Ya tienes cuenta?</p>
          <button className="switch-view" type="button" onClick={switchToLogin}>Inicia sesión</button>
        </div>
      </form>
    </div>
  )
}
