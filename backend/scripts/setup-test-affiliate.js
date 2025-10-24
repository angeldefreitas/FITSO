const { query } = require('../src/config/database');
const { v4: uuidv4 } = require('uuid');

async function setupTestAffiliate() {
  console.log('🔧 Configurando afiliado de prueba...\n');

  try {
    // 1. Obtener el usuario de prueba
    console.log('1️⃣ Obteniendo usuario de prueba...');
    const userResult = await query('SELECT * FROM users WHERE email LIKE \'test-%@example.com\' ORDER BY created_at DESC LIMIT 1');
    
    if (userResult.rows.length === 0) {
      console.log('❌ No se encontró usuario de prueba');
      return;
    }

    const user = userResult.rows[0];
    console.log('✅ Usuario encontrado:', user.email);

    // 2. Marcar usuario como afiliado
    console.log('\n2️⃣ Marcando usuario como afiliado...');
    await query('UPDATE users SET is_affiliate = true WHERE id = $1', [user.id]);
    console.log('✅ Usuario marcado como afiliado');

    // 3. Crear código de afiliado
    console.log('\n3️⃣ Creando código de afiliado...');
    const affiliateCode = `TEST_${Date.now()}`;
    const affiliateResult = await query(`
      INSERT INTO affiliate_codes (code, affiliate_id, commission_percentage)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [affiliateCode, user.id, 30.0]);

    console.log('✅ Código de afiliado creado:', affiliateCode);

    // 4. Crear una referencia de prueba
    console.log('\n4️⃣ Creando referencia de prueba...');
    const testUserId = uuidv4();
    await query(`
      INSERT INTO user_referrals (id, user_id, affiliate_code_id, referred_at)
      VALUES ($1, $2, $3, $4)
    `, [uuidv4(), testUserId, affiliateResult.rows[0].id, new Date()]);

    console.log('✅ Referencia de prueba creada');

    // 5. Crear una comisión de prueba
    console.log('\n5️⃣ Creando comisión de prueba...');
    await query(`
      INSERT INTO affiliate_commissions (id, affiliate_id, user_id, amount, commission_percentage, commission_amount, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      uuidv4(), 
      user.id, 
      testUserId, 
      99.99,
      30.0, 
      29.97, 
      'pending'
    ]);

    console.log('✅ Comisión de prueba creada');

    console.log('\n🎉 ¡Afiliado de prueba configurado exitosamente!');
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Código de afiliado: ${affiliateCode}`);
    console.log(`🆔 User ID: ${user.id}`);

  } catch (error) {
    console.error('❌ Error configurando afiliado de prueba:', error.message);
  } finally {
    process.exit(0);
  }
}

// Ejecutar la configuración
setupTestAffiliate();
