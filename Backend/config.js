
export const dbSettings = {
  user: 'usuario1',
  password: 'doris19',
  server: 'DESKTOP-16NKLSN',
  database: 'SmartGrade',
  options: {
    encrypt: false,
    trustServerCertificate: true
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
