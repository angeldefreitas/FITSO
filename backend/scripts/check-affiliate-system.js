require('dotenv').config();
const { query } = require('../src/config/database');

async function checkSystem() {
  try {
    console.log('🔍 VERIFICACIÓN DEL SISTEMA DE AFILIADOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    
    // 1. Verificar códigos de afiliado
    console.log('📋 CÓDIGOS DE AFILIADO:');
    const codes = await query(`
      SELECT 
        code, 
        affiliate_name, 
        email, 
        commission_percentage, 
        is_active,
        created_at
      FROM affiliate_codes
      ORDER BY created_at DESC
    `);
    
    if (codes.rows.length === 0) {
      console.log('   ⚠️  No hay códigos creados');
      console.log('   Ejecuta: node scripts/create-test-affiliate.js');
    } else {
      codes.rows.forEach((code, index) => {
        console.log(`   ${index + 1}. ${code.code}`);
        console.log(`      Nombre: ${code.affiliate_name}`);
        console.log(`      Email: ${code.email || 'N/A'}`);
        console.log(`      Comisión: ${code.commission_percentage}%`);
        console.log(`      Estado: ${code.is_active ? '✅ Activo' : '❌ Inactivo'}`);
        console.log('');
      });
    }
    
    // 2. Verificar referidos
    console.log('👥 REFERIDOS:');
    const referrals = await query(`
      SELECT 
        ur.affiliate_code,
        COUNT(ur.id) as total_referrals,
        COUNT(CASE WHEN ur.is_premium THEN 1 END) as premium_referrals
      FROM user_referrals ur
      GROUP BY ur.affiliate_code
    `);
    
    if (referrals.rows.length === 0) {
      console.log('   ⚠️  No hay referidos registrados');
    } else {
      referrals.rows.forEach(ref => {
        const conversionRate = ref.total_referrals > 0 
          ? ((ref.premium_referrals / ref.total_referrals) * 100).toFixed(1)
          : 0;
        console.log(`   ${ref.affiliate_code}:`);
        console.log(`      Total: ${ref.total_referrals}`);
        console.log(`      Premium: ${ref.premium_referrals}`);
        console.log(`      Conversión: ${conversionRate}%`);
        console.log('');
      });
    }
    
    // 3. Verificar comisiones
    console.log('💰 COMISIONES:');
    const commissions = await query(`
      SELECT 
        affiliate_code,
        COUNT(id) as total_commissions,
        SUM(commission_amount) as total_amount,
        SUM(CASE WHEN is_paid THEN commission_amount ELSE 0 END) as paid_amount,
        SUM(CASE WHEN NOT is_paid THEN commission_amount ELSE 0 END) as pending_amount
      FROM affiliate_commissions
      GROUP BY affiliate_code
    `);
    
    if (commissions.rows.length === 0) {
      console.log('   ⚠️  No hay comisiones generadas');
      console.log('   Los usuarios deben comprar premium para generar comisiones');
    } else {
      let grandTotal = 0;
      let grandPaid = 0;
      let grandPending = 0;
      
      commissions.rows.forEach(comm => {
        const total = parseFloat(comm.total_amount);
        const paid = parseFloat(comm.paid_amount);
        const pending = parseFloat(comm.pending_amount);
        
        grandTotal += total;
        grandPaid += paid;
        grandPending += pending;
        
        console.log(`   ${comm.affiliate_code}:`);
        console.log(`      Comisiones: ${comm.total_commissions}`);
        console.log(`      Total: $${total.toFixed(2)}`);
        console.log(`      Pagado: $${paid.toFixed(2)}`);
        console.log(`      Pendiente: $${pending.toFixed(2)}`);
        console.log('');
      });
      
      console.log('   TOTALES GENERALES:');
      console.log(`      Total: $${grandTotal.toFixed(2)}`);
      console.log(`      Pagado: $${grandPaid.toFixed(2)}`);
      console.log(`      Pendiente: $${grandPending.toFixed(2)}`);
      console.log('');
    }
    
    // 4. Verificar webhooks
    console.log('🔗 WEBHOOKS:');
    console.log(`   Stripe: ${process.env.STRIPE_WEBHOOK_SECRET ? '✅ Configurado' : '❌ NO configurado'}`);
    console.log(`   RevenueCat: ${process.env.REVENUECAT_WEBHOOK_SECRET ? '✅ Configurado' : '❌ NO configurado'}`);
    console.log('');
    
    // 5. Verificar Stripe
    console.log('💳 STRIPE:');
    console.log(`   Secret Key: ${process.env.STRIPE_SECRET_KEY ? '✅ Configurado' : '❌ NO configurado'}`);
    console.log(`   Publishable Key: ${process.env.STRIPE_PUBLISHABLE_KEY ? '✅ Configurado' : '❌ NO configurado'}`);
    console.log('');
    
    // 6. Estadísticas globales
    console.log('📊 ESTADÍSTICAS GLOBALES:');
    const globalStats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM affiliate_codes WHERE is_active = true) as active_codes,
        (SELECT COUNT(*) FROM user_referrals) as total_referrals,
        (SELECT COUNT(*) FROM user_referrals WHERE is_premium = true) as premium_referrals,
        (SELECT COUNT(*) FROM affiliate_commissions) as total_commissions,
        (SELECT COALESCE(SUM(commission_amount), 0) FROM affiliate_commissions) as total_amount,
        (SELECT COUNT(*) FROM affiliate_commissions WHERE is_paid = false) as pending_payments
    `);
    
    const stats = globalStats.rows[0];
    console.log(`   Códigos Activos: ${stats.active_codes}`);
    console.log(`   Total Referidos: ${stats.total_referrals}`);
    console.log(`   Conversiones Premium: ${stats.premium_referrals}`);
    console.log(`   Comisiones Generadas: ${stats.total_commissions}`);
    console.log(`   Monto Total: $${parseFloat(stats.total_amount).toFixed(2)}`);
    console.log(`   Pagos Pendientes: ${stats.pending_payments}`);
    console.log('');
    
    // 7. Estado del sistema
    console.log('✅ ESTADO DEL SISTEMA:');
    const hasAffiliateCodes = codes.rows.length > 0;
    const hasWebhooks = process.env.STRIPE_WEBHOOK_SECRET && process.env.REVENUECAT_WEBHOOK_SECRET;
    const hasStripe = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY;
    
    if (hasAffiliateCodes && hasWebhooks && hasStripe) {
      console.log('   🎉 Sistema completamente configurado y funcionando');
    } else {
      console.log('   ⚠️  Sistema parcialmente configurado:');
      if (!hasAffiliateCodes) console.log('      - Falta crear códigos de afiliado');
      if (!hasWebhooks) console.log('      - Faltan configurar webhooks');
      if (!hasStripe) console.log('      - Falta configurar Stripe');
    }
    console.log('');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 PRÓXIMOS PASOS:');
    if (!hasAffiliateCodes) {
      console.log('   1. Crear código: node scripts/create-test-affiliate.js');
    }
    if (stats.total_referrals === 0) {
      console.log('   2. Registrar usuario con código en la app');
    }
    if (stats.premium_referrals === 0) {
      console.log('   3. Usuario debe comprar premium');
      console.log('      O simular: node scripts/simulate-purchase.js');
    }
    if (stats.pending_payments > 0) {
      console.log(`   4. Procesar ${stats.pending_payments} pago(s) pendiente(s)`);
    }
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
  
  process.exit(0);
}

checkSystem();

