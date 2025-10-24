#!/usr/bin/env node

/**
 * Script para verificar si el usuario afiliado existe en la base de datos
 */

require('dotenv').config();
const { query } = require('../src/config/database');

async function checkAffiliateUser() {
  try {
    console.log('🔍 Verificando usuario afiliado...');

    // Buscar el usuario afiliado
    const userResult = await query(`
      SELECT id, email, name, is_admin, is_affiliate, created_at
      FROM users 
      WHERE email = 'afiliado@gmail.com'
    `);

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      console.log('✅ Usuario afiliado encontrado:');
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Nombre: ${user.name}`);
      console.log(`   - Admin: ${user.is_admin}`);
      console.log(`   - Afiliado: ${user.is_affiliate}`);
      console.log(`   - Creado: ${user.created_at}`);
    } else {
      console.log('❌ Usuario afiliado NO encontrado');
    }

    // Buscar códigos de afiliado
    const codeResult = await query(`
      SELECT id, code, affiliate_id, commission_percentage, is_active, created_at
      FROM affiliate_codes 
      WHERE code = 'AFILIADO'
    `);

    if (codeResult.rows.length > 0) {
      const code = codeResult.rows[0];
      console.log('✅ Código de afiliado encontrado:');
      console.log(`   - ID: ${code.id}`);
      console.log(`   - Código: ${code.code}`);
      console.log(`   - Afiliado ID: ${code.affiliate_id}`);
      console.log(`   - Comisión: ${code.commission_percentage}%`);
      console.log(`   - Activo: ${code.is_active}`);
      console.log(`   - Creado: ${code.created_at}`);
    } else {
      console.log('❌ Código de afiliado NO encontrado');
    }

    // Listar todos los usuarios
    const allUsers = await query(`
      SELECT id, email, name, is_admin, is_affiliate, created_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log('👥 Últimos 10 usuarios:');
    allUsers.rows.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.name}) - Admin: ${user.is_admin}, Affiliate: ${user.is_affiliate}`);
    });

  } catch (error) {
    console.error('❌ Error verificando usuario afiliado:', error.message);
    process.exit(1);
  }
}

checkAffiliateUser()
  .then(() => {
    console.log('✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
