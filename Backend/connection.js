// connection.js
import sql from 'mssql';
import { dbSettings } from './config.js'

export let poolPromise = sql.connect(dbSettings);

export async function getConnection() {
  try {
    const pool = await sql.connect(dbSettings)
    return pool
  } catch (error) {
    console.error('Error al conectar con SQL Server:', error)
    throw error
  }
}

