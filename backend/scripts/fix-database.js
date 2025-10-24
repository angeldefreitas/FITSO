#!/usr/bin/env node

/**
 * Script para arreglar la base de datos y crear campos necesarios
 */

require('dotenv').config();
const { query } = require('../src/config/database');

async function fixDatabase() {
  try {
    console.log('🔍 Verificando y arreglando base de datos...');

    // Crear columnas faltantes en users
    console.log('🔧 Creando columnas is_admin e is_affiliate...');
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_affiliate BOOLEAN DEFAULT FALSE
    `);
    
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE
    `);
    
    console.log('✅ Columnas creadas exitosamente');

    // Hacer admin a angelfritas@gmail.com
    console.log('👑 Configurando usuario admin...');
    const adminResult = await query(`
      UPDATE users 
      SET is_admin = TRUE 
      WHERE email = 'angelfritas@gmail.com'
    `);
    console.log('✅ Usuario admin configurado');

    // Verificar configuración final
    const finalCheck = await query(`
      SELECT id, email, name, is_admin, is_affiliate 
      FROM users 
      WHERE email = 'angelfritas@gmail.com'
    `);
    
    if (finalCheck.rows.length > 0) {
      const user = finalCheck.rows[0];
      console.log(`👤 Usuario encontrado: ${user.email} (${user.name})`);
      console.log(`   - Admin: ${user.is_admin}`);
      console.log(`   - Affiliate: ${user.is_affiliate}`);
    }

    console.log('🎉 Base de datos arreglada exitosamente!');

  } catch (error) {
    console.error('❌ Error arreglando base de datos:', error.message);
    process.exit(1);
  }
}

fixDatabase()
  .then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
