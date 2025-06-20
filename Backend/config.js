

export const dbSettings = {
  user: 'usuario1',
  password: 'prisi2203ljnA@',
  server: 'PRISILA',         // Solo el host
  database: 'PROJECT',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    instanceName: 'SQLEXPRESS' // Aquí va la instancia
  }
};


export const PORT = 3000;
export const SALT_ROUNDS = 10;
