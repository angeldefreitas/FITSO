require('dotenv').config();
const { query } = require('../src/config/database');
const AffiliateService = require('../src/monetization/services/affiliateService');

async function simulatePurchase() {
  try {
    // Solicitar datos
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query) => new Promise((resolve) => readline.question(query, resolve));

    console.log('🧪 SIMULADOR DE COMPRA - Sistema de Afiliados');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    
    const userId = await question('ID del Usuario (Firebase/Auth ID): ');
    const affiliateCode = await question('Código de Afiliado (ej: FITNESS_INFLUENCER): ');
    const productId = await question('Producto [1=Monthly, 2=Yearly]: ');
    
    readline.close();
    
    // Determinar precio y tipo
    const isYearly = productId === '2';
    const price = isYearly ? 99.99 : 9.99;
    const subscriptionType = isYearly ? 'yearly' : 'monthly';
    const productName = isYearly ? 'Fitso_Premium_Yearly' : 'Fitso_Premium_Monthly';
    
    console.log('');
    console.log('📋 RESUMEN DE LA COMPRA:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Usuario: ${userId}`);
    console.log(`   Código: ${affiliateCode}`);
    console.log(`   Producto: ${productName}`);
    console.log(`   Precio: $${price}`);
    console.log(`   Tipo: ${subscriptionType}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    
    // Verificar si el usuario existe
    console.log('🔍 Verificando usuario...');
    const userCheck = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      console.log('❌ Usuario no encontrado en la base de datos');
      console.log('   Asegúrate de que el usuario se haya registrado en la app');
      process.exit(1);
    }
    console.log('✅ Usuario encontrado:', userCheck.rows[0].email);
    
    // Verificar si el código existe
    console.log('🔍 Verificando código de afiliado...');
    const codeCheck = await query('SELECT * FROM affiliate_codes WHERE code = $1', [affiliateCode.toUpperCase()]);
    if (codeCheck.rows.length === 0) {
      console.log('❌ Código de afiliado no encontrado');
      console.log('   Ejecuta: node scripts/create-test-affiliate.js');
      process.exit(1);
    }
    console.log('✅ Código encontrado:', codeCheck.rows[0].affiliate_name);
    
    // Verificar si el usuario tiene referencia
    console.log('🔍 Verificando referencia...');
    const referralCheck = await query('SELECT * FROM user_referrals WHERE user_id = $1', [userId]);
    if (referralCheck.rows.length === 0) {
      console.log('⚠️  Usuario no tiene código de referencia registrado');
      console.log('   Creando referencia automáticamente...');
      
      await query(
        'INSERT INTO user_referrals (user_id, affiliate_code, is_premium) VALUES ($1, $2, false)',
        [userId, affiliateCode.toUpperCase()]
      );
      console.log('✅ Referencia creada');
    } else {
      console.log('✅ Referencia existente:', referralCheck.rows[0].affiliate_code);
    }
    
    console.log('');
    console.log('💰 Procesando compra...');
    
    // Generar ID de transacción único
    const transactionId = `test_txn_${Date.now()}`;
    
    // Procesar comisión
    const commission = await AffiliateService.processPremiumConversion(
      userId,
      transactionId,
      price,
      subscriptionType
    );
    
    if (commission) {
      console.log('');
      console.log('✅ ¡COMISIÓN GENERADA EXITOSAMENTE!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   ID: ${commission.id}`);
      console.log(`   Código: ${commission.affiliate_code}`);
      console.log(`   Usuario: ${userId}`);
      console.log(`   Monto Suscripción: $${commission.subscription_amount}`);
      console.log(`   Porcentaje: ${commission.commission_percentage}%`);
      console.log(`   Comisión: $${commission.commission_amount}`);
      console.log(`   Estado: ${commission.is_paid ? 'Pagada ✅' : 'Pendiente ⏳'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('🎯 VERIFICACIÓN:');
      console.log('   1. El afiliado puede ver esta comisión en su dashboard');
      console.log('   2. La comisión está pendiente de pago');
      console.log('   3. El admin puede procesar el pago');
      console.log('');
      
      // Mostrar estadísticas actualizadas
      const stats = await query(`
        SELECT 
          COUNT(ur.id) as total_referrals,
          COUNT(CASE WHEN ur.is_premium THEN 1 END) as premium_referrals,
          COALESCE(SUM(afc.commission_amount), 0) as total_commissions,
          COALESCE(SUM(CASE WHEN afc.is_paid THEN afc.commission_amount ELSE 0 END), 0) as paid_commissions
        FROM user_referrals ur
        LEFT JOIN affiliate_commissions afc ON ur.user_id = afc.user_id
        WHERE ur.affiliate_code = $1
      `, [affiliateCode.toUpperCase()]);
      
      console.log('📊 ESTADÍSTICAS DEL AFILIADO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   Total Referidos: ${stats.rows[0].total_referrals}`);
      console.log(`   Conversiones Premium: ${stats.rows[0].premium_referrals}`);
      console.log(`   Total Comisiones: $${parseFloat(stats.rows[0].total_commissions).toFixed(2)}`);
      console.log(`   Pagado: $${parseFloat(stats.rows[0].paid_commissions).toFixed(2)}`);
      console.log(`   Pendiente: $${(parseFloat(stats.rows[0].total_commissions) - parseFloat(stats.rows[0].paid_commissions)).toFixed(2)}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
    } else {
      console.log('❌ No se pudo generar la comisión');
      console.log('   Revisa los logs para más detalles');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
  
  process.exit(0);
}

simulatePurchase();

