const { query } = require('../src/config/database');
const SubscriptionController = require('../src/monetization/controllers/subscriptionController');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

/**
 * Script para verificar el estado premium de test1@gmail.com
 * Verifica tanto desde la BD como lo que la app verificaría
 */

async function checkPremiumStatus() {
  try {
    console.log('🔍 Verificando estado premium de test1@gmail.com\n');
    
    // 1. Verificar qué columnas existen
    const checkColumnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('is_affiliate', 'is_admin')
    `;
    const columnsResult = await query(checkColumnsQuery);
    const existingColumns = columnsResult.rows.map(row => row.column_name);
    const hasIsAffiliate = existingColumns.includes('is_affiliate');
    const hasIsAdmin = existingColumns.includes('is_admin');
    
    // 2. Obtener usuario con columnas dinámicas
    let selectColumns = 'id, email, name';
    if (hasIsAffiliate) selectColumns += ', is_affiliate';
    if (hasIsAdmin) selectColumns += ', is_admin';
    
    const userQuery = `SELECT ${selectColumns} FROM users WHERE email = $1`;
    const userResult = await query(userQuery, ['test1@gmail.com']);
    
    if (userResult.rows.length === 0) {
      console.log('❌ Usuario test1@gmail.com no encontrado');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('👤 Usuario encontrado:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nombre: ${user.name}`);
    if (hasIsAffiliate) console.log(`   Es Afiliado: ${user.is_affiliate || false}`);
    if (hasIsAdmin) console.log(`   Es Admin: ${user.is_admin || false}`);
    
    // 2. Verificar estado desde el backend (lo que usaría la app)
    console.log('\n📊 Verificando estado premium desde backend:');
    console.log('─'.repeat(80));
    
    const status = await SubscriptionController.getSubscriptionStatus(user.id);
    
    console.log('✅ Estado premium (desde backend):');
    console.log(`   isPremium: ${status.isPremium ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   subscriptionType: ${status.subscriptionType || 'N/A'}`);
    console.log(`   expiresAt: ${status.expiresAt || 'N/A'}`);
    console.log(`   source: ${status.source || 'database'}`);
    if (status.reason) {
      console.log(`   reason: ${status.reason}`);
    }
    
    // 3. Verificar suscripciones activas en BD
    console.log('\n📋 Verificando suscripciones en BD:');
    console.log('─'.repeat(80));
    
    const subsQuery = `
      SELECT * FROM subscriptions 
      WHERE user_id = $1 AND is_active = true
      ORDER BY expires_date DESC
    `;
    
    const subsResult = await query(subsQuery, [user.id]);
    
    if (subsResult.rows.length === 0) {
      console.log('❌ No hay suscripciones activas en BD');
    } else {
      console.log(`✅ Encontradas ${subsResult.rows.length} suscripción(es) activa(s):`);
      for (const sub of subsResult.rows) {
        console.log(`\n   Producto: ${sub.product_id}`);
        console.log(`   Transaction ID: ${sub.transaction_id}`);
        console.log(`   Comprado: ${sub.purchase_date}`);
        console.log(`   Expira: ${sub.expires_date}`);
        console.log(`   Activa: ${sub.is_active ? '✅ Sí' : '❌ No'}`);
        
        const expiresDate = new Date(sub.expires_date);
        const now = new Date();
        const isExpired = expiresDate <= now;
        console.log(`   Expiró: ${isExpired ? '❌ SÍ (expirada)' : '✅ NO (válida)'}`);
      }
    }
    
    // 4. Conclusión
    console.log('\n📝 CONCLUSIÓN:');
    console.log('─'.repeat(80));
    
    if (status.isPremium) {
      console.log('✅ El usuario SERÁ premium al loguearse');
      if (status.reason === 'admin') {
        console.log('   Razón: Usuario es administrador');
      } else if (status.reason === 'affiliate') {
        console.log('   Razón: Usuario es afiliado');
      } else if (status.source === 'database') {
        console.log('   Razón: Tiene suscripción activa en BD');
        console.log('   ⚠️ NOTA: La app verifica principalmente desde RevenueCat SDK');
        console.log('   ⚠️ Si RevenueCat no tiene la compra, la app puede no mostrar premium');
      }
    } else {
      console.log('❌ El usuario NO será premium al loguearse');
      console.log('\n   Posibles razones:');
      console.log('   1. No tiene suscripción activa en BD');
      console.log('   2. La suscripción expiró');
      console.log('   3. RevenueCat no tiene la compra registrada (la app verifica principalmente desde RevenueCat)');
      console.log('\n   ⚠️ IMPORTANTE:');
      console.log('   - La app verifica el estado premium principalmente desde RevenueCat SDK');
      console.log('   - Aunque haya suscripción en BD, si RevenueCat no la tiene, NO será premium');
      console.log('   - La simulación guardó en BD, pero RevenueCat no tiene la compra');
    }
    
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

checkPremiumStatus();

