import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv';
dotenv.config();
import { PORT } from './connections/config.js'
import { UserRepository } from './UserRepository.js'
import jwt from 'jsonwebtoken'
import { enviarCorreoConToken } from './authentication/mailService.js'



const app = express()
app.use(cors())  // Permite peticiones desde frontend (puertos diferentes)
app.use(express.json())

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


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


