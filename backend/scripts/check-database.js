#!/usr/bin/env node

/**
 * Script para verificar y crear campos necesarios en la base de datos
 */

require('dotenv').config();
const { query } = require('../src/config/database');

async function checkDatabase() {
  try {
    console.log('🔍 Verificando estructura de la base de datos...');

    // Verificar si existen las columnas necesarias
    const columnsCheck = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('is_affiliate', 'is_admin')
    `);

    console.log('📋 Columnas encontradas en users:');
    columnsCheck.rows.forEach(col => {
      console.log(`  - ${col.column_name}`);
    });

    // Si faltan columnas, crearlas
    if (columnsCheck.rows.length < 2) {
      console.log('🔧 Creando columnas faltantes...');
      
      await query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS is_affiliate BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE
      `);
      
      console.log('✅ Columnas creadas exitosamente');
    }

    // Verificar si existen las tablas de afiliados
    const tablesCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('affiliate_codes', 'user_referrals', 'affiliate_commissions', 'affiliate_payments')
    `);

    console.log('📋 Tablas de afiliados encontradas:');
    tablesCheck.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    // Si faltan tablas, crearlas
    if (tablesCheck.rows.length < 4) {
      console.log('🔧 Creando tablas de afiliados...');
      
      const fs = require('fs');
      const path = require('path');
      const schemaPath = path.join(__dirname, '../src/monetization/config/affiliate_schema.sql');
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      
      await query(schemaSQL);
      console.log('✅ Tablas de afiliados creadas exitosamente');
    }

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
      WHERE is_admin = TRUE OR is_affiliate = TRUE
    `);
    
    console.log('👥 Usuarios especiales:');
    finalCheck.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.name}) - Admin: ${user.is_admin}, Affiliate: ${user.is_affiliate}`);
    });

    console.log('🎉 Verificación completada exitosamente!');

  } catch (error) {
    console.error('❌ Error verificando base de datos:', error.message);
    process.exit(1);
  }
}

checkDatabase()
  .then(() => {
    console.log('✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
