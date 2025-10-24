const { query } = require('../src/config/database');
const AffiliateService = require('../src/monetization/services/affiliateService');
const AffiliateCode = require('../src/monetization/models/AffiliateCode');
const UserReferral = require('../src/monetization/models/UserReferral');
const AffiliateCommission = require('../src/monetization/models/AffiliateCommission');

async function testAffiliateFlow() {
  console.log('🧪 Iniciando prueba del flujo de afiliados...\n');

  try {
    // 1. Crear un código de afiliado
    console.log('1️⃣ Creando código de afiliado...');
    const affiliateCode = await AffiliateCode.create({
      affiliate_name: 'Test Influencer',
      email: 'test@influencer.com',
      commission_percentage: 30.0,
      created_by: 'admin-test-id'
    });
    console.log('✅ Código creado:', affiliateCode.code);

    // 2. Simular registro de usuario con código de referencia
    console.log('\n2️⃣ Simulando registro de usuario con código de referencia...');
    const testUserId = 'test-user-' + Date.now();
    const referral = await UserReferral.create({
      user_id: testUserId,
      affiliate_code: affiliateCode.code
    });
    console.log('✅ Referencia creada para usuario:', testUserId);

    // 3. Simular conversión a premium
    console.log('\n3️⃣ Simulando conversión a premium...');
    const subscriptionId = 'test-subscription-' + Date.now();
    const subscriptionAmount = 99.99;
    const subscriptionType = 'yearly';

    const commission = await AffiliateService.processPremiumConversion(
      testUserId,
      subscriptionId,
      subscriptionAmount,
      subscriptionType
    );

    if (commission) {
      console.log('✅ Comisión creada:', {
        id: commission.id,
        amount: commission.commission_amount,
        percentage: commission.commission_percentage
      });
    } else {
      console.log('❌ No se creó comisión');
    }

    // 4. Verificar estadísticas del afiliado
    console.log('\n4️⃣ Verificando estadísticas del afiliado...');
    const stats = await affiliateCode.getStats();
    console.log('✅ Estadísticas:', {
      total_referrals: stats.total_referrals,
      premium_referrals: stats.premium_referrals,
      total_commissions: stats.total_commissions
    });

    // 5. Verificar comisiones en la base de datos
    console.log('\n5️⃣ Verificando comisiones en la base de datos...');
    const commissions = await AffiliateCommission.findByAffiliateCode(affiliateCode.code);
    console.log('✅ Comisiones encontradas:', commissions.length);
    commissions.forEach(comm => {
      console.log(`   - ID: ${comm.id}, Monto: $${comm.commission_amount}, Pagada: ${comm.is_paid}`);
    });

    // 6. Simular renovación de suscripción
    console.log('\n6️⃣ Simulando renovación de suscripción...');
    const renewalSubscriptionId = 'test-renewal-' + Date.now();
    const renewalCommission = await AffiliateService.processSubscriptionRenewal(
      testUserId,
      renewalSubscriptionId,
      subscriptionAmount,
      subscriptionType
    );

    if (renewalCommission) {
      console.log('✅ Comisión de renovación creada:', {
        id: renewalCommission.id,
        amount: renewalCommission.commission_amount
      });
    } else {
      console.log('ℹ️ No se creó comisión de renovación (probablemente ya existe para este período)');
    }

    // 7. Verificar estadísticas finales
    console.log('\n7️⃣ Verificando estadísticas finales...');
    const finalStats = await affiliateCode.getStats();
    console.log('✅ Estadísticas finales:', {
      total_referrals: finalStats.total_referrals,
      premium_referrals: finalStats.premium_referrals,
      total_commissions: finalStats.total_commissions
    });

    console.log('\n🎉 ¡Prueba del flujo de afiliados completada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - Código de afiliado: ${affiliateCode.code}`);
    console.log(`   - Usuario de prueba: ${testUserId}`);
    console.log(`   - Referencias totales: ${finalStats.total_referrals}`);
    console.log(`   - Conversiones premium: ${finalStats.premium_referrals}`);
    console.log(`   - Comisiones generadas: $${finalStats.total_commissions}`);

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Cerrar conexión a la base de datos
    process.exit(0);
  }
}

// Ejecutar la prueba
testAffiliateFlow();
