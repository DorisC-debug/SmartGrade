

import { useState } from 'react'
import axios from 'axios'
import './Login.css'

export function Login({ onLoginSuccess, switchToRegister}) {
  const [correo, setCorreo] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:3000/login', {
        correo,
        contraseña
      })
      onLoginSuccess()
    } catch (err) {
      setError(err.response?.data || 'Credenciales incorrectas')
    }
  }

  return (
    <div className="card">
      <h4 className="title">Iniciar sesión</h4>
      <form onSubmit={handleSubmit}>
        {error && <p className="login-error">{error}</p>}

        <div className="field">
          <svg className="input-icon" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
            <path d="M207.8 20.73c-93.45 18.32-168.7 93.66-187 187.1..."></path>
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
            <path d="M80 192V144C80 64.47 144.5 0 224 0..."></path>
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

        <button className="btn" type="submit">Ingresar</button>
        <a href="#" className="btn-link">¿Olvidaste tu contraseña?</a>

        {/* botón para ir a registro */}
        <div className="switch-container">
          <p>¿No tienes cuenta?</p>
          <button className="switch-view" type="button" onClick={switchToRegister}>Regístrate</button>
        </div>
      </form>
    </div>
  )
}
