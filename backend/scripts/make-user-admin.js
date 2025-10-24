#!/usr/bin/env node

/**
 * Script para convertir un usuario en administrador
 * Uso: node scripts/make-user-admin.js angelfritas@gmail.com
 */

require('dotenv').config();
const { query } = require('../src/config/database');

async function makeUserAdmin(email) {
  try {
    console.log(`🔧 Convirtiendo usuario ${email} en administrador...`);

    // Verificar si el usuario existe
    const userCheck = await query('SELECT id, email FROM users WHERE email = $1', [email]);
    
    if (userCheck.rows.length === 0) {
      console.error(`❌ Usuario ${email} no encontrado`);
      process.exit(1);
    }

    const userId = userCheck.rows[0].id;
    console.log(`✅ Usuario encontrado: ${userId}`);

    // Verificar si ya tiene el campo is_admin
    const columnCheck = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_admin'
    `);

    // Si no existe la columna, crearla
    if (columnCheck.rows.length === 0) {
      console.log('📝 Creando columna is_admin...');
      await query('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE');
      console.log('✅ Columna is_admin creada');
    }

    // Actualizar el usuario para que sea admin
    await query('UPDATE users SET is_admin = TRUE WHERE email = $1', [email]);
    console.log(`✅ Usuario ${email} convertido en administrador`);

    // Verificar el cambio
    const updatedUser = await query('SELECT email, is_admin FROM users WHERE email = $1', [email]);
    console.log(`📊 Estado actual: ${updatedUser.rows[0].email} - Admin: ${updatedUser.rows[0].is_admin}`);

  } catch (error) {
    console.error('❌ Error convirtiendo usuario en administrador:', error.message);
    process.exit(1);
  }
}

// Obtener email desde argumentos de línea de comandos
const email = process.argv[2];

if (!email) {
  console.error('❌ Por favor proporciona un email: node scripts/make-user-admin.js angelfritas@gmail.com');
  process.exit(1);
}

makeUserAdmin(email)
  .then(() => {
    console.log('🎉 Proceso completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
