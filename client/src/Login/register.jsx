import { useState } from 'react'
import axios from 'axios'
import './Login.css'

export function Register({ onRegisterSuccess, switchToLogin }) {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post('http://localhost:3000/register', {
        nombre,
        correo,
        contraseña
      })

      localStorage.setItem('correo', correo)
      onRegisterSuccess()
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Error al registrarse. Inténtalo más tarde.')
      } else {
        setError('Ya existe una cuenta con ese correo electrónico.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h4 className="title">Registro</h4>
      <form onSubmit={handleSubmit}>
        {error && <p className="login-error">{error}</p>}

        <div className="field">
          <svg className="input-icon" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
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
          <svg className="input-icon" viewBox="0 0 500 500">
            <path d="M207.8 20.73c-93.45 18.32-168.7 93.66-187 187.1..." />
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
          <svg className="input-icon" viewBox="0 0 500 500">
            <path d="M80 192V144C80 64.47 144.5 0 224 0..." />
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

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>

        <div className="switch-container">
          <p>¿Ya tienes cuenta?</p>
          <button className="switch-view" type="button" onClick={switchToLogin}>
            Inicia sesión
          </button>
        </div>
      </form>
    </div>
  )
}
