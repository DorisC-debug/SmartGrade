import sql from 'mssql'
import { dbSettings } from './config.js'
import bcrypt from 'bcrypt'



export class UserRepository {
  static async connect() {
    try {
      const pool = await sql.connect({
        user: dbSettings.user,
        password: dbSettings.password,
        server: dbSettings.server,
        database: dbSettings.database,
        options: {
          encrypt: true,
          trustServerCertificate: false
        }
      })
      return pool
    } catch (error) {
      throw new Error('Error al conectar a la base de datos: ' + error.message)
    }
  }
  static async create({ nombre, correo, contraseña }) {
    console.log('→ Datos en create:', { nombre, correo, contraseña })

    this.validateCorreo(correo)
    this.validatePassword(contraseña)

    const pool = await this.connect()

    const check = await pool.request()
      .input('correo', sql.NVarChar, correo)
      .query('SELECT * FROM Estudiante WHERE correo = @correo')

    if (check.recordset.length > 0) {
      throw new Error('Ya existe un usuario con este correo.')
    }
    const hashedPassword = await bcrypt.hash(contraseña, 10)
    console.log('→ Contraseña hasheada en create():', hashedPassword)

    await pool.request()
      .input('nombre', sql.NVarChar, nombre)
      .input('correo', sql.NVarChar, correo)
      .input('contraseña', sql.NVarChar, hashedPassword)
      .input('verificado', sql.Bit, 0)
      .query(`INSERT INTO Estudiante (nombre, correo, contraseña, verificado)
        VALUES (@nombre, @correo, @contraseña, @verificado)`)

    return correo
  }

  static async login({ correo, contraseña }) {
    this.validateCorreo(correo);

    const pool = await this.connect();

    const result = await pool.request()
      .input('correo', sql.NVarChar, correo)
      .query('SELECT * FROM Estudiante WHERE correo = @correo');

    const user = result.recordset[0];
    if (!user) throw new Error('Usuario no encontrado.');

    // Comparar la contraseña con bcrypt
    const isMatch = await bcrypt.compare(contraseña, user.contraseña);
    if (!isMatch) throw new Error('Contraseña incorrecta.');

    if (!user.verificado) {
      throw new Error('Tu cuenta aún no ha sido verificada. Revisa tu correo.');
    }


    return {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo
    };
  }


  static validateCorreo(correo) {
    if (typeof correo !== 'string' || !correo.includes('@')) {
      throw new Error('Correo inválido.')
    }
  }

  static validatePassword(password) {
    console.log('Contraseña recibida:', password);
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

    const hashedPassword = await bcrypt.hash(nuevaContraseña, 10);

    const pool = await this.connect();

    const result = await pool.request()
      .input('correo', sql.NVarChar, correo)
      .input('nuevaContraseña', sql.NVarChar, hashedPassword)
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





  static async getPrerrequisitosGraduacion() {
    const pool = await this.connect()

    const result = await pool.request()
      .query(`SELECT descripcion FROM [SmartGrade].[dbo].[prerrequisitos_graduacion]`)

    return result.recordset
  }

  static async getVistaCompletaMaterias() {
    const pool = await this.connect()

    const result = await pool.request()
      .query(`
        SELECT *
        FROM [SmartGrade].[dbo].[Vista_Completa_Materias]
        ORDER BY id_carrera ASC, semestre_recomendado ASC
      `)

    return result.recordset
  }

  static async getEstudianteIdByCorreo(correo) {
    if (!correo) throw new Error('Correo no proporcionado.')

    const pool = await this.connect()

    const result = await pool.request()
      .input('correo', sql.NVarChar, correo)
      .query('SELECT id FROM Estudiante WHERE correo = @correo')

    if (result.recordset.length === 0) {
      throw new Error('Estudiante no encontrado.')
    }

    return result.recordset[0].id
  }

  static async guardarDatosChatbot({ estudiante_id, carrera_id, materiasCursadas }) {
    const pool = await this.connect();

    try {
      // 1. Insertar EstudianteCarrera si no existe
      const existeCarrera = await pool.request()
        .input('estudiante_id', sql.Int, estudiante_id)
        .query('SELECT * FROM EstudianteCarrera WHERE estudiante_id = @estudiante_id');

      if (existeCarrera.recordset.length === 0) {
        await pool.request()
          .input('estudiante_id', sql.Int, estudiante_id)
          .input('carrera_id', sql.Int, carrera_id)
          .query(`INSERT INTO EstudianteCarrera (estudiante_id, carrera_id) VALUES (@estudiante_id, @carrera_id)`);
      }

      // 2. Si hay materias cursadas
      if (Array.isArray(materiasCursadas) && materiasCursadas.length > 0) {
        for (const nombreMateria of materiasCursadas) {
          const result = await pool.request()
            .input('nombre', sql.NVarChar, nombreMateria)
            .query(`SELECT id_materia FROM Materia WHERE nombre = @nombre`);

          const materia = result.recordset[0];
          if (materia) {
            const yaExiste = await pool.request()
              .input('estudiante_id', sql.Int, estudiante_id)
              .input('materia_id', sql.Int, materia.id_materia)
              .query(`SELECT * FROM Historial_Academico WHERE estudiante_id = @estudiante_id AND materia_id = @materia_id`);

            if (yaExiste.recordset.length === 0) {
              await pool.request()
                .input('estudiante_id', sql.Int, estudiante_id)
                .input('materia_id', sql.Int, materia.id_materia)
                .input('estado', sql.NVarChar, 'aprobada')
                .query(`INSERT INTO Historial_Academico (estudiante_id, materia_id, estado)
                    VALUES (@estudiante_id, @materia_id, @estado)`);
            }
          }
        }
      } else {
        // 3. Si no hay materias cursadas, insertar materia dummy
        const materiaDummyId = 601;

        const yaExiste = await pool.request()
          .input('estudiante_id', sql.Int, estudiante_id)
          .input('materia_id', sql.Int, materiaDummyId)
          .query(`SELECT * FROM Historial_Academico WHERE estudiante_id = @estudiante_id AND materia_id = @materia_id`);

        if (yaExiste.recordset.length === 0) {
          await pool.request()
            .input('estudiante_id', sql.Int, estudiante_id)
            .input('materia_id', sql.Int, materiaDummyId)
            .input('estado', sql.NVarChar, 'pendiente')
            .query(`INSERT INTO Historial_Academico (estudiante_id, materia_id, estado)
                  VALUES (@estudiante_id, @materia_id, @estado)`);
        }
      }
    } catch (error) {
      console.error("❌ Error real:", error); // Mostrar el error completo en consola
      throw new Error("Error al guardar datos del chatbot");
    }
  }
}