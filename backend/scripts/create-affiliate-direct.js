#!/usr/bin/env node

/**
 * Script para crear un afiliado directamente en la base de datos de producción
 */

require('dotenv').config();
const { query } = require('../src/config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createAffiliateDirect() {
  try {
    console.log('🚀 Creando afiliado directamente en la base de datos...');

    const email = 'afiliado@gmail.com';
    const name = 'Afiliado';
    const password = '211299';
    const referralCode = 'AFILIADO';
    const commissionPercentage = 35.0;

    // Verificar si el usuario ya existe
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      console.log('❌ El usuario ya existe:', existingUser.rows[0].id);
      return;
    }

    // Verificar si el código ya existe
    const existingCode = await query('SELECT id FROM affiliate_codes WHERE code = $1', [referralCode]);
    if (existingCode.rows.length > 0) {
      console.log('❌ El código de afiliado ya existe:', existingCode.rows[0].id);
      return;
    }

    // Crear el usuario
    console.log('👤 Creando usuario...');
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userResult = await query(`
      INSERT INTO users (id, email, password_hash, name, is_verified, is_affiliate, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, email, name, is_affiliate
    `, [userId, email, hashedPassword, name, true, true]);

    console.log('✅ Usuario creado:', userResult.rows[0]);

    // Crear el código de afiliado
    console.log('🎫 Creando código de afiliado...');
    const codeId = uuidv4();
    
    const codeResult = await query(`
      INSERT INTO affiliate_codes (id, code, affiliate_id, commission_percentage, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, code, affiliate_id, commission_percentage
    `, [codeId, referralCode, userId, commissionPercentage, true]);

    console.log('✅ Código de afiliado creado:', codeResult.rows[0]);

    // Verificar que se creó correctamente
    const verifyUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    const verifyCode = await query('SELECT * FROM affiliate_codes WHERE code = $1', [referralCode]);

    console.log('🔍 Verificación final:');
    console.log('   Usuario:', verifyUser.rows[0]);
    console.log('   Código:', verifyCode.rows[0]);

    console.log('🎉 Afiliado creado exitosamente!');
    console.log('📧 Email:', email);
    console.log('🔑 Contraseña:', password);
    console.log('🎫 Código:', referralCode);

  } catch (error) {
    console.error('❌ Error creando afiliado:', error.message);
    process.exit(1);
  }
}

createAffiliateDirect()
  .then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
