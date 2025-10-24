#!/usr/bin/env node

/**
 * Script para configurar completamente el sistema de afiliados
 * Uso: node scripts/setup-affiliate-system.js
 */

require('dotenv').config();
const { query } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function setupAffiliateSystem() {
  try {
    console.log('🚀 Configurando sistema de afiliados...');

    // 1. Agregar campos a la tabla users
    console.log('📝 Agregando campos de afiliado a la tabla users...');
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_affiliate BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE
    `);
    console.log('✅ Campos agregados a la tabla users');

    // 2. Hacer admin a angelfritas@gmail.com
    console.log('👑 Configurando usuario admin...');
    const adminResult = await query(`
      UPDATE users 
      SET is_admin = TRUE 
      WHERE email = 'angelfritas@gmail.com'
    `);
    console.log('✅ Usuario admin configurado');

    // 3. Crear tablas de afiliados
    console.log('📊 Creando tablas de afiliados...');
    const schemaPath = path.join(__dirname, '../src/monetization/config/affiliate_schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Ejecutar el schema
    await query(schemaSQL);
    console.log('✅ Tablas de afiliados creadas');

    // 4. Verificar configuración
    console.log('🔍 Verificando configuración...');
    const adminCheck = await query(`
      SELECT id, email, name, is_admin, is_affiliate 
      FROM users 
      WHERE is_admin = TRUE
    `);
    
    console.log('👑 Usuarios administradores:');
    adminCheck.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.name}) - Admin: ${user.is_admin}`);
    });

    // 5. Verificar tablas creadas
    const tablesCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('affiliate_codes', 'user_referrals', 'affiliate_commissions', 'affiliate_payments')
    `);
    
    console.log('📋 Tablas de afiliados creadas:');
    tablesCheck.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    console.log('🎉 Sistema de afiliados configurado exitosamente!');
    console.log('');
    console.log('📋 Próximos pasos:');
    console.log('1. Iniciar el servidor backend: npm start');
    console.log('2. Probar la creación de cuentas de afiliados desde el panel de administración');
    console.log('3. Configurar la URL de la API en el frontend');

  } catch (error) {
    console.error('❌ Error configurando sistema de afiliados:', error.message);
    process.exit(1);
  }
}

setupAffiliateSystem()
  .then(() => {
    console.log('✅ Configuración completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
