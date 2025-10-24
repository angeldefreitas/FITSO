// Endpoint temporal para corregir el esquema de afiliados
// Ejecutar: curl -X POST https://fitso.onrender.com/api/fix-affiliate-schema

const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.use(express.json());

app.post('/api/fix-affiliate-schema', async (req, res) => {
  try {
    console.log('🔧 Iniciando corrección del esquema de afiliados...');
    
    // 1. Agregar columna affiliate_id a affiliate_codes si no existe
    console.log('📝 Agregando columna affiliate_id a affiliate_codes...');
    await pool.query(`
      ALTER TABLE affiliate_codes 
      ADD COLUMN IF NOT EXISTS affiliate_id UUID REFERENCES users(id) ON DELETE CASCADE
    `);
    
    // 2. Crear índice para la nueva columna
    console.log('📝 Creando índice para affiliate_id...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_affiliate_codes_affiliate_id 
      ON affiliate_codes(affiliate_id)
    `);
    
    // 3. Verificar que la columna existe
    console.log('🔍 Verificando estructura de la tabla...');
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'affiliate_codes' 
      ORDER BY ordinal_position
    `);
    
    console.log('✅ Columnas de affiliate_codes:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    res.json({
      success: true,
      message: 'Esquema de afiliados corregido exitosamente',
      columns: result.rows
    });
    
  } catch (error) {
    console.error('❌ Error corrigiendo esquema:', error);
    res.status(500).json({
      success: false,
      message: 'Error corrigiendo esquema',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor temporal ejecutándose en puerto ${PORT}`);
  console.log(`📝 Ejecutar: curl -X POST http://localhost:${PORT}/api/fix-affiliate-schema`);
});
