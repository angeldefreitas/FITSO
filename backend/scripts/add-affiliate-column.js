const { query } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function addAffiliateColumn() {
  try {
    console.log('🔄 Agregando columna is_affiliate a la tabla users...');
    
    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'add-affiliate-column.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Ejecutar el SQL
    const result = await query(sql);
    
    console.log('✅ Columna is_affiliate agregada exitosamente');
    console.log('📊 Resultado:', result);
    
    // Verificar que la columna existe
    const checkQuery = `
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_affiliate'
    `;
    
    const checkResult = await query(checkQuery);
    console.log('🔍 Verificación de columna:', checkResult.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error agregando columna is_affiliate:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  addAffiliateColumn();
}

module.exports = addAffiliateColumn;
