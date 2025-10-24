#!/usr/bin/env node

/**
 * Script para crear un afiliado directamente en la base de datos de producción de Render
 * Usando la URL de la base de datos de producción
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// URL de la base de datos de producción de Render
// Reemplaza esta URL con la URL real de tu base de datos de Render
const PRODUCTION_DATABASE_URL = 'postgresql://fitso_user:fitso_password@dpg-cp8j8j8l5elc73f8qgq0-a.oregon-postgres.render.com/fitso_database';

async function createAffiliateRender() {
  const client = new Client({
    connectionString: PRODUCTION_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🚀 Conectando a la base de datos de producción de Render...');
    await client.connect();
    console.log('✅ Conectado a PostgreSQL de producción');

    const email = 'afiliado@gmail.com';
    const name = 'Afiliado';
    const password = '211299';
    const referralCode = 'AFILIADO';
    const commissionPercentage = 35.0;

    // Verificar si el usuario ya existe
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      console.log('❌ El usuario ya existe:', existingUser.rows[0].id);
      return;
    }

    // Verificar si el código ya existe
    const existingCode = await client.query('SELECT id FROM affiliate_codes WHERE code = $1', [referralCode]);
    if (existingCode.rows.length > 0) {
      console.log('❌ El código de afiliado ya existe:', existingCode.rows[0].id);
      return;
    }

    // Crear el usuario
    console.log('👤 Creando usuario en producción...');
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userResult = await client.query(`
      INSERT INTO users (id, email, password_hash, name, is_verified, is_affiliate, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, email, name, is_affiliate
    `, [userId, email, hashedPassword, name, true, true]);

    console.log('✅ Usuario creado en producción:', userResult.rows[0]);

    // Crear el código de afiliado
    console.log('🎫 Creando código de afiliado en producción...');
    const codeId = uuidv4();
    
    const codeResult = await client.query(`
      INSERT INTO affiliate_codes (id, code, affiliate_id, commission_percentage, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, code, affiliate_id, commission_percentage
    `, [codeId, referralCode, userId, commissionPercentage, true]);

    console.log('✅ Código de afiliado creado en producción:', codeResult.rows[0]);

    // Verificar que se creó correctamente
    const verifyUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const verifyCode = await client.query('SELECT * FROM affiliate_codes WHERE code = $1', [referralCode]);

    console.log('🔍 Verificación final en producción:');
    console.log('   Usuario:', verifyUser.rows[0]);
    console.log('   Código:', verifyCode.rows[0]);

    console.log('🎉 Afiliado creado exitosamente en producción!');
    console.log('📧 Email:', email);
    console.log('🔑 Contraseña:', password);
    console.log('🎫 Código:', referralCode);

  } catch (error) {
    console.error('❌ Error creando afiliado en producción:', error.message);
    console.error('❌ Detalles del error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('👋 Desconectado de la base de datos de producción');
  }
}

createAffiliateRender()
  .then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
