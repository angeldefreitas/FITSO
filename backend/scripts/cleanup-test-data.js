const { query } = require('../src/config/database');

async function cleanupTestData() {
  console.log('🧹 Limpiando datos de prueba...\n');

  try {
    // Limpiar comisiones de prueba
    console.log('1️⃣ Limpiando comisiones de prueba...');
    const commissionResult = await query(`
      DELETE FROM affiliate_commissions 
      WHERE user_id LIKE 'test-user-%' 
      OR subscription_id LIKE 'test-subscription-%' 
      OR subscription_id LIKE 'test-renewal-%'
    `);
    console.log(`✅ ${commissionResult.rowCount} comisiones eliminadas`);

    // Limpiar referencias de prueba
    console.log('2️⃣ Limpiando referencias de prueba...');
    const referralResult = await query(`
      DELETE FROM user_referrals 
      WHERE user_id LIKE 'test-user-%'
    `);
    console.log(`✅ ${referralResult.rowCount} referencias eliminadas`);

    // Limpiar códigos de afiliado de prueba
    console.log('3️⃣ Limpiando códigos de afiliado de prueba...');
    const affiliateResult = await query(`
      DELETE FROM affiliate_codes 
      WHERE affiliate_name = 'Test Influencer' 
      OR email = 'test@influencer.com'
    `);
    console.log(`✅ ${affiliateResult.rowCount} códigos de afiliado eliminados`);

    console.log('\n🎉 ¡Limpieza completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en la limpieza:', error.message);
  } finally {
    process.exit(0);
  }
}

// Ejecutar la limpieza
cleanupTestData();
