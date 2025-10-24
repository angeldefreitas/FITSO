const { query } = require('../src/config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createAngelAffiliate() {
  console.log('👤 Creando afiliado angelafiliado@gmail.com...\n');

  try {
    // 1. Verificar si el usuario ya existe
    console.log('1️⃣ Verificando si el usuario ya existe...');
    const existingUser = await query('SELECT * FROM users WHERE email = $1', ['angelafiliado@gmail.com']);
    
    if (existingUser.rows.length > 0) {
      console.log('✅ Usuario ya existe:', existingUser.rows[0].email);
      const userId = existingUser.rows[0].id;
      
      // Marcar como afiliado si no lo está
      if (!existingUser.rows[0].is_affiliate) {
        await query('UPDATE users SET is_affiliate = true WHERE id = $1', [userId]);
        console.log('✅ Usuario marcado como afiliado');
      }
      
      // Verificar si ya tiene código de afiliado
      const existingCode = await query('SELECT * FROM affiliate_codes WHERE affiliate_id = $1', [userId]);
      if (existingCode.rows.length > 0) {
        console.log('✅ Código de afiliado ya existe:', existingCode.rows[0].code);
        return;
      }
    } else {
      // 2. Crear el usuario
      console.log('2️⃣ Creando usuario...');
      const userId = uuidv4();
      const hashedPassword = await bcrypt.hash('211299', 10);
      
      await query(`
        INSERT INTO users (id, email, password_hash, name, is_verified, is_affiliate)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [userId, 'angelafiliado@gmail.com', hashedPassword, 'Angel Afiliado', true, true]);
      
      console.log('✅ Usuario creado:', 'angelafiliado@gmail.com');
    }

    // 3. Crear código de afiliado
    console.log('\n3️⃣ Creando código de afiliado...');
    const affiliateCode = `ANGEL_${Date.now()}`;
    const affiliateResult = await query(`
      INSERT INTO affiliate_codes (code, affiliate_id, commission_percentage)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [affiliateCode, existingUser.rows.length > 0 ? existingUser.rows[0].id : userId, 30.0]);

    console.log('✅ Código de afiliado creado:', affiliateCode);

    // 4. Crear algunas referencias y comisiones de prueba
    console.log('\n4️⃣ Creando datos de prueba...');
    
    // Referencia 1
    const testUserId1 = uuidv4();
    await query(`
      INSERT INTO user_referrals (id, user_id, affiliate_code_id, referred_at)
      VALUES ($1, $2, $3, $4)
    `, [uuidv4(), testUserId1, affiliateResult.rows[0].id, new Date()]);

    // Referencia 2
    const testUserId2 = uuidv4();
    await query(`
      INSERT INTO user_referrals (id, user_id, affiliate_code_id, referred_at)
      VALUES ($1, $2, $3, $4)
    `, [uuidv4(), testUserId2, affiliateResult.rows[0].id, new Date()]);

    // Comisión 1
    await query(`
      INSERT INTO affiliate_commissions (id, affiliate_id, user_id, amount, commission_percentage, commission_amount, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      uuidv4(), 
      existingUser.rows.length > 0 ? existingUser.rows[0].id : userId, 
      testUserId1, 
      99.99,
      30.0, 
      29.97, 
      'pending'
    ]);

    // Comisión 2
    await query(`
      INSERT INTO affiliate_commissions (id, affiliate_id, user_id, amount, commission_percentage, commission_amount, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      uuidv4(), 
      existingUser.rows.length > 0 ? existingUser.rows[0].id : userId, 
      testUserId2, 
      199.99,
      30.0, 
      59.97, 
      'paid'
    ]);

    console.log('✅ Datos de prueba creados');

    console.log('\n🎉 ¡Afiliado Angel configurado exitosamente!');
    console.log(`📧 Email: angelafiliado@gmail.com`);
    console.log(`🔑 Contraseña: 211299`);
    console.log(`🔑 Código de afiliado: ${affiliateCode}`);
    console.log(`🆔 User ID: ${existingUser.rows.length > 0 ? existingUser.rows[0].id : userId}`);

  } catch (error) {
    console.error('❌ Error configurando afiliado Angel:', error.message);
  } finally {
    process.exit(0);
  }
}

// Ejecutar la configuración
createAngelAffiliate();
