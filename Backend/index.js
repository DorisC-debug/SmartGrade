import express from 'express'
import cors from 'cors'
import { calcularRutaOrdenadaConCorrequisitos } from './RutaCritica.js'
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
import { PORT } from './config.js'
import { UserRepository } from './UserRepository.js'
import jwt from 'jsonwebtoken'
import { enviarCorreoConToken } from './authentication/mailService.js'

const app = express()
app.use(cors())
app.use(express.json())




app.get('/api/ruta-critica/:idCarrera', async (req, res) => {
  const idCarrera = parseInt(req.params.idCarrera);
  const limite = parseInt(req.query.limitePorCuatrimestre);

  if (isNaN(idCarrera) || isNaN(limite) || limite <= 0) {
    return res.status(400).json({ message: 'Parámetros inválidos' });
  }

  try {
    const todasMaterias = await UserRepository.getVistaCompletaMaterias();
    const materiasCarrera = todasMaterias.filter(m => m.id_carrera === idCarrera);

    if (!Array.isArray(materiasCarrera) || materiasCarrera.length === 0) {
      return res.status(404).json({ message: 'No se encontraron materias para la carrera especificada' });
    }

    const resultado = calcularRutaOrdenadaConCorrequisitos(materiasCarrera, limite);

    return res.json({
      ruta: resultado.cuatrimestres, // Este es un array
      totalCuatrimestres: resultado.totalCuatrimestres,
      rutaCritica: resultado.rutaCritica
    });
  } catch (error) {
    console.error('Error al calcular ruta crítica:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.get('/', (req, res) => {
  res.send('Servidor backend funcionando')
})

app.post('/login', async (req, res) => {
  const { correo, contraseña } = req.body;

  try {
    const user = await UserRepository.login({ correo, contraseña });

    // Verifica si el usuario ha confirmado su correo
    if (!user.verificado) {
      console.log('🔍 Usuario devuelto:', user);
      return res.status(403).send('Debes verificar tu correo electrónico antes de iniciar sesión.');
    }
    // Si todo está correcto, se envía el usuario
    res.send(user);

  } catch (error) {
    res.status(401).send(error.message);
  }
});

app.post('/register', async (req, res) => {
  const { nombre, correo, contraseña } = req.body;

  try {

    const yaExiste = await UserRepository.findByCorreo(correo);
    if (yaExiste && yaExiste.verificado) {
      return res.status(400).send('Ya existe una cuenta  con ese correo');
    }

    const token = jwt.sign({ nombre, correo, contraseña }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await enviarCorreoConToken(correo, token, 'verificacion');

    res.send({ message: 'Se ha enviado un correo de verificación' });
  } catch (error) {
    console.error('Error en /register:', error);
    res.status(500).send('Error al procesar registro');
  }
});

    console.log('→ Contraseña original:', contraseña);
    const correoRegistrado = await UserRepository.create({
      nombre,
      correo,
      contraseña
    });

    res.status(201).json({ mensaje: 'Usuario registrado', correo: correoRegistrado });
  } catch (error) {
    console.error('❌ Error en /register:', error.message);
    res.status(500).json({ error: error.message });
  }
});


app.post('/logout', (req, res) => {
  // Aquí podrías invalidar sesión o token, dependiendo del método de auth que uses
  res.send({ message: 'Logout exitoso' })
})
app.post('/recuperar', async (req, res) => {
  const { correo } = req.body;

  try {
    // Aquí deberías verificar si ese correo existe en la BD
    const usuario = await UserRepository.findByCorreo(correo);
    if (!usuario) return res.status(404).send('Correo no encontrado');

   
    const token = jwt.sign({ correo }, process.env.JWT_SECRET, { expiresIn: '24h' });
    await enviarCorreoConToken(correo, token);

    res.send({ message: 'Correo de recuperación enviado con éxito' });
  } catch (error) {
    console.error('Error en /recuperar:', error);
    res.status(500).send('Error al enviar correo');
  }
});

app.post('/resetear/:token', async (req, res) => {
  const { token } = req.params;
  const { nuevaContraseña } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await UserRepository.updatePassword(decoded.correo, nuevaContraseña);
    res.send({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(400).send('Token inválido o expirado');
  }
});


app.get('/verificar/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    console.log('📦 Token decodificado:', decoded);
    
    const {  nombre, correo, contraseña } = decoded;

    const existente = await UserRepository.findByCorreo(correo);
    if (existente && existente.verificado) {
      return res.send('Este correo ya está verificado.');
    }

    if (!existente) {
      await UserRepository.create({nombre, correo, contraseña, verificado: true });
    } else {
      await UserRepository.marcarComoVerificado(correo);
    }

    res.send('Cuenta verificada correctamente. Ahora puedes iniciar sesión.');
  } catch (error) {
    console.error('Error en /verificar:', error);
    res.status(400).send('Token inválido o expirado');
  }
});


// GET /api/materias
app.get('/api/materias', async (req, res) => {
  const materias = await UserRepository.getVistaCompletaMaterias()
  res.json(materias)
})

// routes/api.js o en tu archivo principal
app.get('/api/prerrequisitos', async (req, res) => {
  try {
    const prerrequisitos = await UserRepository.getPrerrequisitosGraduacion();
    res.json(prerrequisitos);
  } catch (error) {
    console.error('Error al obtener prerrequisitos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


app.get('/api/estudiante-id', async (req, res) => {
  try {
    const correo = req.query.correo;
    if (!correo) return res.status(400).send({ error: 'Correo no proporcionado.' });

    const id = await UserRepository.getEstudianteIdByCorreo(correo);
    res.json({ id });
  } catch (error) {
    console.error('Error en /api/estudiante-id:', error.message);
    res.status(500).send({ error: 'Error interno al obtener ID del estudiante.' });
    console.error('Error en /api/estudiante-id:', error);
  }
});

app.post('/api/guardar-datos-chatbot', async (req, res) => {
  console.log('Datos recibidos en API:', req.body);

  const { estudiante_id, carrera_id, materiasCursadas } = req.body;

  if (!estudiante_id || !carrera_id) {
    return res.status(400).json({ error: 'Faltan datos necesarios.' });
  }

  try {
    await UserRepository.guardarDatosChatbot({ estudiante_id, carrera_id, materiasCursadas });
    res.json({ mensaje: 'Datos guardados correctamente.' });
  } catch (error) {
    console.error('Error al guardar datos del chatbot:', error);
    res.status(500).json({ error: 'No se pudieron guardar los datos del chatbot.' });
  }
});
