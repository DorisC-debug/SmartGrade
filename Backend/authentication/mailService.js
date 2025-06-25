// backend/mailService.js
import nodemailer from 'nodemailer';

export const enviarCorreoRecuperacion = async (correoDestino, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tu_correo@gmail.com',
      pass: 'tu_contraseña_de_aplicacion',
    },
  });

  const mailOptions = {
    from: 'tu_correo@gmail.com',
    to: correoDestino,
    subject: 'Recuperación de contraseña',
    html: `
      <h3>Recuperación de contraseña</h3>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="http://localhost:5173/resetear/${token}">Restablecer contraseña</a>
      <p>Si no solicitaste este cambio, ignora este correo.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
