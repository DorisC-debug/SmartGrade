// config.js
export const dbSettings = {
  user: 'usuario1',
  password: 'D@ris27022006',
  server: 'smartgrade.database.windows.net',
  database: 'SmartGrade',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};



export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
}

export const PORT = 3000;
export const SALT_ROUNDS = 10;
