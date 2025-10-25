const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la base de datos - SIEMPRE PRODUCCIÓN
const dbConfig = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
} : {
  host: process.env.DB_HOST || 'dpg-d0j8v8h8s0s738f8a8pg-a.oregon-postgres.render.com',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fitso_db_8x0j',
  user: process.env.DB_USER || 'fitso_user_8x0j',
  password: process.env.DB_PASSWORD || 'YOUR_PRODUCTION_PASSWORD',
  ssl: { rejectUnauthorized: false }
};

// Crear pool de conexiones
const pool = new Pool(dbConfig);

// Manejar errores de conexión
pool.on('error', (err) => {
  console.error('Error inesperado en el cliente de base de datos:', err);
  process.exit(-1);
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
    return false;
  }
};

// Función para ejecutar queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query ejecutada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Error en query:', err);
    throw err;
  }
};

module.exports = {
  pool,
  query,
  testConnection
};
