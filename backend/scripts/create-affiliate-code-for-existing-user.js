const { query } = require('../src/config/database');
const { v4: uuidv4 } = require('uuid');

async function createAffiliateCodeForExistingUser() {
  console.log('🔧 Creando código de afiliado para usuario existente...\n');

  try {
    // 1. Buscar el usuario angelafiliado2@gmail.com
    console.log('1️⃣ Buscando usuario angelafiliado2@gmail.com...');
    const userResult = await query('SELECT * FROM users WHERE email = $1', ['angelafiliado2@gmail.com']);
    
    if (userResult.rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    const user = userResult.rows[0];
    console.log('✅ Usuario encontrado:', user.email, 'ID:', user.id);

    // 2. Verificar si ya tiene código de afiliado
    console.log('\n2️⃣ Verificando si ya tiene código de afiliado...');
    const existingCode = await query('SELECT * FROM affiliate_codes WHERE affiliate_id = $1', [user.id]);
    
    if (existingCode.rows.length > 0) {
      console.log('✅ Código de afiliado ya existe:', existingCode.rows[0].code);
      return;
    }

    // 3. Crear código de afiliado
    console.log('\n3️⃣ Creando código de afiliado...');
    const affiliateCode = `ANGEL2_${Date.now()}`;
    const affiliateResult = await query(`
      INSERT INTO affiliate_codes (id, code, affiliate_id, commission_percentage, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      uuidv4(),
      affiliateCode, 
      user.id, 
      30.0, 
      true, 
      new Date(), 
      new Date()
    ]);

    console.log('✅ Código de afiliado creado:', affiliateCode);

    // 4. Crear algunas referencias y comisiones de prueba
    console.log('\n4️⃣ Creando datos de prueba...');
    
    // Referencias de prueba
    for (let i = 1; i <= 2; i++) {
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
        INSERT INTO affiliate_commissions (id, affiliate_id, user_id, amount, commission_percentage, commission_amount, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        uuidv4(), 
        user.id, 
        testUserId, 
        amount,
        30.0, 
        commissionAmount, 
        status,
        new Date(),
        new Date()
      ]);
    }

    console.log('✅ Datos de prueba creados');

    console.log('\n🎉 ¡Código de afiliado creado exitosamente!');
    console.log(`📧 Email: angelafiliado2@gmail.com`);
    console.log(`🔑 Código de afiliado: ${affiliateCode}`);
    console.log(`🆔 User ID: ${user.id}`);

  } catch (error) {
    console.error('❌ Error creando código de afiliado:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
}

// Ejecutar la creación
createAffiliateCodeForExistingUser();
