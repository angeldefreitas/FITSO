#!/usr/bin/env node

/**
 * Script para crear un afiliado directamente en la base de datos de producción de Render
 * Usando la URL de la base de datos de producción
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// URL de la base de datos de producción de Render
// Esta es la URL que debería estar en las variables de entorno de Render
const PRODUCTION_DATABASE_URL = process.env.DATABASE_URL || 'postgresql://fitso_user:fitso_password@dpg-cp8j8j8l5elc73f8qgq0-a.oregon-postgres.render.com/fitso_database';

async function createAffiliateRenderDirect() {
  const client = new Client({
    connectionString: PRODUCTION_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🚀 Conectando a la base de datos de producción de Render...');
    console.log('🔗 URL:', PRODUCTION_DATABASE_URL.replace(/\/\/.*@/, '//***:***@')); // Ocultar credenciales
    
    await client.connect();
    console.log('✅ Conectado a PostgreSQL de producción');

    const email = 'afiliado@gmail.com';
    const name = 'Afiliado';
    const password = '211299';
    const referralCode = 'AFILIADO';
    const commissionPercentage = 35.0;

    // Verificar si el usuario ya existe
    console.log('🔍 Verificando si el usuario ya existe...');
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      console.log('⚠️ El usuario ya existe:', existingUser.rows[0].id);
      console.log('🔄 Actualizando usuario existente...');
      
      // Actualizar el usuario existente para marcarlo como afiliado
      await client.query(`
        UPDATE users 
        SET is_affiliate = TRUE, updated_at = CURRENT_TIMESTAMP 
        WHERE email = $1
      `, [email]);
      
      console.log('✅ Usuario actualizado como afiliado');
    } else {
      // Crear el usuario
      console.log('👤 Creando nuevo usuario...');
      const userId = uuidv4();
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const userResult = await client.query(`
        INSERT INTO users (id, email, password_hash, name, is_verified, is_affiliate, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, email, name, is_affiliate
      `, [userId, email, hashedPassword, name, true, true]);

      console.log('✅ Usuario creado:', userResult.rows[0]);
    }

    // Verificar si el código ya existe
    console.log('🔍 Verificando si el código ya existe...');
    const existingCode = await client.query('SELECT id FROM affiliate_codes WHERE code = $1', [referralCode]);
    if (existingCode.rows.length > 0) {
      console.log('⚠️ El código de afiliado ya existe:', existingCode.rows[0].id);
    } else {
      // Crear el código de afiliado
      console.log('🎫 Creando código de afiliado...');
      const codeId = uuidv4();
      
      // Obtener el ID del usuario
      const userResult = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      const userId = userResult.rows[0].id;
      
      const codeResult = await client.query(`
        INSERT INTO affiliate_codes (id, code, affiliate_id, commission_percentage, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, code, affiliate_id, commission_percentage
      `, [codeId, referralCode, userId, commissionPercentage, true]);

      console.log('✅ Código de afiliado creado:', codeResult.rows[0]);
    }

    // Verificar que se creó correctamente
    console.log('🔍 Verificación final...');
    const verifyUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const verifyCode = await client.query('SELECT * FROM affiliate_codes WHERE code = $1', [referralCode]);

    console.log('✅ Usuario final:', {
      id: verifyUser.rows[0].id,
      email: verifyUser.rows[0].email,
      name: verifyUser.rows[0].name,
      is_affiliate: verifyUser.rows[0].is_affiliate
    });
    
    console.log('✅ Código final:', {
      id: verifyCode.rows[0].id,
      code: verifyCode.rows[0].code,
      affiliate_id: verifyCode.rows[0].affiliate_id,
      commission_percentage: verifyCode.rows[0].commission_percentage
    });

    console.log('🎉 Afiliado configurado exitosamente en producción!');
    console.log('📧 Email:', email);
    console.log('🔑 Contraseña:', password);
    console.log('🎫 Código:', referralCode);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Error de conexión - verificar URL de la base de datos');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🌐 Error de DNS - verificar host de la base de datos');
    } else if (error.code === '28000') {
      console.error('🔐 Error de autenticación - verificar credenciales');
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('👋 Desconectado de la base de datos');
  }
}

createAffiliateRenderDirect()
  .then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
