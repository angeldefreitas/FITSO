const { query } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function addAffiliateField() {
  try {
    console.log('🔄 Agregando campo is_affiliate a la tabla users...');
    
    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'add-affiliate-field-to-users.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Ejecutar las consultas SQL
    await query(sql);
    
    console.log('✅ Campo is_affiliate agregado exitosamente');
    
    // Verificar que el campo se agregó correctamente
    const checkQuery = `
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_affiliate'
    `;
    
    const result = await query(checkQuery);
    
    if (result.rows.length > 0) {
      console.log('✅ Campo verificado:', result.rows[0]);
    } else {
      console.log('❌ Campo no encontrado');
    }
    
  } catch (error) {
    console.error('❌ Error agregando campo is_affiliate:', error.message);
  } finally {
    process.exit(0);
  }
}

// Ejecutar la migración
addAffiliateField();
