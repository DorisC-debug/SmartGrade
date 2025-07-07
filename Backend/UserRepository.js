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

  // Login de estudiante 
  static async login({ correo, contraseña }) {
  this.validateCorreo(correo);
  this.validatePassword(contraseña);

  const pool = await this.connect();

  const result = await pool.request()
    .input('correo', sql.NVarChar, correo)
    .input('contraseña', sql.NVarChar, contraseña)
    .query(`
      SELECT nombre, correo, verificado
      FROM Estudiante
      WHERE correo = @correo AND contraseña = @contraseña
    `);

  const user = result.recordset[0];
  if (!user) throw new Error('Correo o contraseña incorrectos');

  return {
    nombre: user.nombre,
    correo: user.correo,
    verificado: Boolean(user.verificado) // Asegura que sea un booleano
  };
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
  static async findByCorreo(correo) {
    this.validateCorreo(correo);

    const pool = await this.connect();

    const result = await pool.request()
      .input('correo', sql.NVarChar, correo)
      .query('SELECT * FROM Estudiante WHERE correo = @correo');

    return result.recordset.length > 0 ? result.recordset[0] : null;
  }
  
  static async updatePassword(correo, nuevaContraseña) {
    this.validateCorreo(correo);
    this.validatePassword(nuevaContraseña);

    const pool = await this.connect();

    const result = await pool.request()
      .input('correo', sql.NVarChar, correo)
      .input('nuevaContraseña', sql.NVarChar, nuevaContraseña)
      .query('UPDATE Estudiante SET contraseña = @nuevaContraseña WHERE correo = @correo');

    return result.rowsAffected[0] > 0;
  }

  // Marca un usuario como verificado
  static async marcarComoVerificado(correo) {
    const pool = await this.connect();
    await pool.request()
    .input('correo', sql.VarChar, correo)
    .query('UPDATE Estudiante SET verificado = 1 WHERE correo = @correo');
  }
  
  

}
