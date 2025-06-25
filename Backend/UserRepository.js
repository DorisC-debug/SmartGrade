import sql from 'mssql'
import { dbSettings } from './connections/config.js'

export class UserRepository {
  static async connect() {
    try {
      const pool = await sql.connect({
        user: dbSettings.user,
        password: dbSettings.password,
        server: dbSettings.server,
        database: dbSettings.database,
        options: {
          encrypt: false,
          trustServerCertificate: true
        }
      })
      return pool
    } catch (error) {
      throw new Error('Error al conectar a la base de datos: ' + error.message)
    }
  }

  // Crear nuevo estudiante (sin hash)
  static async create({ correo, contraseña }) {
    this.validateCorreo(correo)
    this.validatePassword(contraseña)

    const pool = await this.connect()

    const check = await pool.request()
      .input('correo', sql.NVarChar, correo)
      .query('SELECT * FROM Estudiante WHERE correo = @correo')

    if (check.recordset.length > 0) {
      throw new Error('Ya existe un usuario con este correo.')
    }

    await pool.request()
      .input('correo', sql.NVarChar, correo)
      .input('contraseña', sql.NVarChar, contraseña)  // sin hash
      .query(`INSERT INTO Estudiante ([correo], [contraseña])
              VALUES (@correo, @contraseña)`)

    return correo
  }

  // Login de estudiante (sin hash)
  static async login({ correo, contraseña }) {
    this.validateCorreo(correo)
    this.validatePassword(contraseña)

    const pool = await this.connect()

    const result = await pool.request()
      .input('correo', sql.NVarChar, correo)
      .query('SELECT * FROM Estudiante WHERE correo = @correo')

    const user = result.recordset[0]
    if (!user) throw new Error('Usuario no encontrado.')

    // Comparación directa de contraseñas (texto plano)
    if (user.contraseña !== contraseña) {
      throw new Error('Contraseña incorrecta.')
    }

    return {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      carrera_id: user.carrera_id
    }
  }

  // Validaciones
  static validateCorreo(correo) {
    if (typeof correo !== 'string' || !correo.includes('@')) {
      throw new Error('Correo inválido.')
    }
  }

  static validatePassword(password) {
    if (typeof password !== 'string' || password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres.')
    }
  }
}
