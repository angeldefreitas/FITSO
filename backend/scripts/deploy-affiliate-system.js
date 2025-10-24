const { query } = require('../src/config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function deployAffiliateSystem() {
  console.log('🚀 Desplegando sistema de afiliados en producción...\n');

  try {
    // 1. Verificar y agregar campo is_affiliate si no existe
    console.log('1️⃣ Verificando campo is_affiliate...');
    const checkField = await query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_affiliate'
    `);
    
    if (checkField.rows.length === 0) {
      console.log('❌ Campo is_affiliate no existe. Agregándolo...');
      await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_affiliate BOOLEAN DEFAULT FALSE');
      await query('CREATE INDEX IF NOT EXISTS idx_users_is_affiliate ON users(is_affiliate)');
      console.log('✅ Campo is_affiliate agregado');
    } else {
      console.log('✅ Campo is_affiliate ya existe');
    }

    // 2. Verificar si angelafiliado@gmail.com existe
    console.log('\n2️⃣ Verificando usuario angelafiliado@gmail.com...');
    const existingUser = await query('SELECT * FROM users WHERE email = $1', ['angelafiliado@gmail.com']);
    
    let userId;
    if (existingUser.rows.length > 0) {
      console.log('✅ Usuario ya existe:', existingUser.rows[0].email);
      userId = existingUser.rows[0].id;
      
      // Marcar como afiliado si no lo está
      if (!existingUser.rows[0].is_affiliate) {
        await query('UPDATE users SET is_affiliate = true WHERE id = $1', [userId]);
        console.log('✅ Usuario marcado como afiliado');
      }
    } else {
      // Crear el usuario
      console.log('❌ Usuario no existe. Creándolo...');
      userId = uuidv4();
      const hashedPassword = await bcrypt.hash('211299', 10);
      
      await query(`
        INSERT INTO users (id, email, password_hash, name, is_verified, is_affiliate)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [userId, 'angelafiliado@gmail.com', hashedPassword, 'Angel Afiliado', true, true]);
      
      console.log('✅ Usuario creado:', 'angelafiliado@gmail.com');
    }

    // 3. Verificar si ya tiene código de afiliado
    console.log('\n3️⃣ Verificando código de afiliado...');
    const existingCode = await query('SELECT * FROM affiliate_codes WHERE affiliate_id = $1', [userId]);
    
    if (existingCode.rows.length === 0) {
      // Crear código de afiliado
      console.log('❌ Código de afiliado no existe. Creándolo...');
      const affiliateCode = `ANGEL_${Date.now()}`;
      const affiliateResult = await query(`
        INSERT INTO affiliate_codes (code, affiliate_id, commission_percentage)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [affiliateCode, userId, 30.0]);

      console.log('✅ Código de afiliado creado:', affiliateCode);

      // 4. Crear datos de prueba
      console.log('\n4️⃣ Creando datos de prueba...');
      
      // Referencias de prueba
      for (let i = 1; i <= 3; i++) {
        const testUserId = uuidv4();
        await query(`
          INSERT INTO user_referrals (id, user_id, affiliate_code_id, referred_at)
          VALUES ($1, $2, $3, $4)
        `, [uuidv4(), testUserId, affiliateResult.rows[0].id, new Date()]);

        // Comisiones de prueba
        const status = i % 2 === 0 ? 'paid' : 'pending';
        const amount = 99.99 * i;
        const commissionAmount = amount * 0.30;

        await query(`
          INSERT INTO affiliate_commissions (id, affiliate_id, user_id, amount, commission_percentage, commission_amount, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          uuidv4(), 
          userId, 
          testUserId, 
          amount,
          30.0, 
          commissionAmount, 
          status
        ]);
      }

      console.log('✅ Datos de prueba creados');
    } else {
      console.log('✅ Código de afiliado ya existe:', existingCode.rows[0].code);
    }

    console.log('\n🎉 ¡Sistema de afiliados desplegado exitosamente en producción!');
    console.log(`📧 Email: angelafiliado@gmail.com`);
    console.log(`🔑 Contraseña: 211299`);
    console.log(`🔑 Código de afiliado: ${existingCode.rows[0]?.code || 'Ya existía'}`);

  } catch (error) {
    console.error('❌ Error desplegando sistema de afiliados:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
}

// Ejecutar el despliegue
deployAffiliateSystem();
