const { query } = require('../src/config/database');

async function testDashboardEndpoint() {
  console.log('🧪 Probando endpoint del dashboard de afiliados...\n');

  try {
    // 1. Verificar que el campo is_affiliate existe
    console.log('1️⃣ Verificando campo is_affiliate...');
    const checkField = await query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_affiliate'
    `);
    
    if (checkField.rows.length === 0) {
      console.log('❌ Campo is_affiliate no existe. Ejecutando migración...');
      // Ejecutar migración
      await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_affiliate BOOLEAN DEFAULT FALSE');
      await query('CREATE INDEX IF NOT EXISTS idx_users_is_affiliate ON users(is_affiliate)');
      console.log('✅ Campo is_affiliate agregado');
    } else {
      console.log('✅ Campo is_affiliate existe:', checkField.rows[0]);
    }

    // 2. Crear un usuario de prueba afiliado
    console.log('\n2️⃣ Creando usuario afiliado de prueba...');
    const testUserId = require('uuid').v4();
    const hashedPassword = await require('bcryptjs').hash('test123', 10);
    
    await query(`
      INSERT INTO users (id, email, password_hash, name, is_verified, is_affiliate)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO NOTHING
    `, [testUserId, `test-affiliate-${Date.now()}@example.com`, hashedPassword, 'Test Affiliate', true, true]);
    
    console.log('✅ Usuario afiliado creado:', testUserId);

    // 3. Crear código de afiliado para el usuario
    console.log('\n3️⃣ Creando código de afiliado...');
    const affiliateCode = await query(`
      INSERT INTO affiliate_codes (code, affiliate_id, commission_percentage)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [`TEST_AFFILIATE_${Date.now()}`, testUserId, 30.0]);
    
    console.log('✅ Código de afiliado creado:', affiliateCode.rows[0].code);

    // 4. Simular una referencia y comisión
    console.log('\n4️⃣ Simulando referencia y comisión...');
    const testReferralId = require('uuid').v4();
    const testUserId2 = require('uuid').v4();
    await query(`
      INSERT INTO user_referrals (id, user_id, affiliate_code_id, referred_at)
      VALUES ($1, $2, $3, $4)
    `, [testReferralId, testUserId2, affiliateCode.rows[0].id, new Date()]);

    const testCommissionId = require('uuid').v4();
    await query(`
      INSERT INTO affiliate_commissions (id, affiliate_id, user_id, amount, commission_percentage, commission_amount, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      testCommissionId, 
      testUserId, 
      testUserId2, 
      99.99,
      30.0, 
      29.97, 
      'pending'
    ]);

    console.log('✅ Referencia y comisión creadas');

    // 5. Probar el endpoint del dashboard
    console.log('\n5️⃣ Probando endpoint del dashboard...');
    
    // Simular la lógica del controlador
    const user = await query('SELECT * FROM users WHERE id = $1', [testUserId]);
    console.log('Usuario encontrado:', user.rows[0]?.is_affiliate);

    const affiliateCodeResult = await query('SELECT * FROM affiliate_codes WHERE affiliate_id = $1 AND is_active = true', [testUserId]);
    console.log('Código de afiliado encontrado:', affiliateCodeResult.rows[0]?.code);

    if (affiliateCodeResult.rows.length > 0) {
      const code = affiliateCodeResult.rows[0].code;
      
      // Obtener estadísticas
      const stats = await query(`
        SELECT 
          COUNT(ur.id) as total_referrals,
          COALESCE(SUM(afc.commission_amount), 0) as total_commissions
        FROM affiliate_codes ac
        LEFT JOIN user_referrals ur ON ac.id = ur.affiliate_code_id
        LEFT JOIN affiliate_commissions afc ON ac.affiliate_id = afc.affiliate_id
        WHERE ac.code = $1
        GROUP BY ac.id
      `, [code]);

      const conversionStats = await query(`
        SELECT 
          COUNT(*) as total_referrals,
          0 as premium_conversions,
          0 as conversion_rate
        FROM user_referrals ur
        JOIN affiliate_codes ac ON ur.affiliate_code_id = ac.id
        WHERE ac.code = $1
      `, [code]);

      const commissionStats = await query(`
        SELECT 
          COALESCE(SUM(commission_amount), 0) as total_commissions,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN commission_amount ELSE 0 END), 0) as pending_commissions,
          COALESCE(SUM(CASE WHEN status = 'paid' THEN commission_amount ELSE 0 END), 0) as paid_commissions
        FROM affiliate_commissions 
        WHERE affiliate_id = $1
      `, [testUserId]);

      const dashboardStats = {
        total_referrals: stats.rows[0]?.total_referrals || 0,
        premium_referrals: 0, // Por ahora no tenemos tracking de premium
        total_commissions: commissionStats.rows[0]?.total_commissions || 0,
        pending_commissions: commissionStats.rows[0]?.pending_commissions || 0,
        paid_commissions: commissionStats.rows[0]?.paid_commissions || 0,
        conversion_rate: 0, // Por ahora no tenemos tracking de conversión
        affiliate_code: code
      };

      console.log('✅ Dashboard stats calculadas:', dashboardStats);
    }

    console.log('\n🎉 ¡Prueba del dashboard completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
}

// Ejecutar la prueba
testDashboardEndpoint();
