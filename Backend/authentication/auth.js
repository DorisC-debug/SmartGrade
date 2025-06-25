// backend/routes/auth.js
import express from 'express';
import sql from 'mssql';
import crypto from 'crypto';
import { dbSettings } from '../config.js';
import { enviarCorreoRecuperacion } from '../mailService.js';
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;

const router = express.Router();

router.post('/recuperar', async (req, res) => {
  const { correo } = req.body;

  try {
    const pool = await sql.connect(dbSettings);

    const user = await pool.request()
      .input('correo', sql.VarChar, correo)
      .query('SELECT * FROM usuarios WHERE correo = @correo');

    if (user.recordset.length === 0) {
      return res.status(200).send('Si el correo existe, se enviará el enlace.');
    }

    const token = crypto.randomBytes(32).toString('hex');

    await pool.request()
      .input('correo', sql.VarChar, correo)
      .input('token', sql.VarChar, token)
      .query('INSERT INTO Recuperacion (correo, token) VALUES (@correo, @token)');

    await enviarCorreoRecuperacion(correo, token);
    res.status(200).send('Correo enviado.');
  } catch (err) {
    console.error('Error en recuperación:', err);
    res.status(500).send('Error del servidor');
  }
});

router.post('/resetear/:token', async (req, res) => {
  const { token } = req.params;
  const { nuevaClave } = req.body;

  try {
    const pool = await sql.connect(dbSettings);
    const result = await pool.request()
      .input('token', sql.VarChar, token)
      .query('SELECT * FROM Recuperacion WHERE token = @token AND usado = 0');

    if (result.recordset.length === 0) {
      return res.status(400).send('Token inválido o ya usado.');
    }

    const correo = result.recordset[0].correo;
    const hash = await bcrypt.hash(nuevaClave, SALT_ROUNDS);

    await pool.request()
      .input('clave', sql.VarChar, hash)
      .input('correo', sql.VarChar, correo)
      .query('UPDATE usuarios SET clave = @clave WHERE correo = @correo');

    await pool.request()
      .input('token', sql.VarChar, token)
      .query('UPDATE Recuperacion SET usado = 1 WHERE token = @token');

    res.send('Contraseña actualizada');
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
});

export default router;


