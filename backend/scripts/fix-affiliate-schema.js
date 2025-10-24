const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixAffiliateSchema() {
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
    
    console.log('✅ Esquema de afiliados corregido exitosamente');
    
  } catch (error) {
    console.error('❌ Error corrigiendo esquema:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  fixAffiliateSchema()
    .then(() => {
      console.log('🎉 Migración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en migración:', error);
      process.exit(1);
    });
}

module.exports = { fixAffiliateSchema };
