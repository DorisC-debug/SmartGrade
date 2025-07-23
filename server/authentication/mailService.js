import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();
export const enviarCorreoConToken = async (correoDestino, token, tipo = 'recuperacion') => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
    });

    const asunto = tipo === 'verificacion' ? 'Verificación de cuenta' : 'Recuperación de contraseña';
    const textoPrincipal = tipo === 'verificacion'
      ? 'Haz clic en el siguiente enlace para verificar tu cuenta:'
      : 'Haz clic en el siguiente enlace para restablecer tu contraseña:';

    const url = tipo === 'verificacion'
      ? `http://localhost:5173/verificar/${token}`
      : `http://localhost:5173/resetear/${token}`;

    const mailOptions = {
      from: `SmartGrade <${process.env.EMAIL_USER}>`,
      to: correoDestino,
      subject: asunto,
      html: `
        <h3>${asunto}</h3>
        <p>${textoPrincipal}</p>
        <a href="${url}">${url}</a>
        <p>Si no solicitaste este correo, puedes ignorarlo.</p>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✔️ Correo enviado a ${correoDestino}:`, result.response);
  } catch (error) {
    console.error('❌ Error al enviar el correo:', error);
    throw new Error('No se pudo enviar el correo');
  }
};
