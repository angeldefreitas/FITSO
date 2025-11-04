const { query } = require('../src/config/database');
const AffiliateService = require('../src/monetization/services/affiliateService');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

/**
 * Script para simular compras de suscripciones para test1 y test2
 * Simula tanto el POST desde la app como el webhook de RevenueCat
 */

const TEST_USERS = [
  {
    email: 'test1@gmail.com',
    password: '211299',
    expectedUserId: null // Se obtendrá de BD
  },
  {
    email: 'test2@gmail.com',
    password: '211299',
    expectedUserId: null // Se obtendrá de BD
  }
];

async function getUserFromEmail(email) {
  try {
    const userQuery = 'SELECT id, email, name FROM users WHERE email = $1';
    const result = await query(userQuery, [email]);
    return result.rows[0] || null;
  } catch (error) {
    console.error(`❌ Error buscando usuario ${email}:`, error);
    return null;
  }
}

async function simulateAppPurchase(userId, productId, subscriptionType) {
  try {
    console.log(`\n📱 [APP] Simulando compra desde app para usuario: ${userId}`);
    
    const transactionId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const price = subscriptionType === 'monthly' ? 2.99 : 19.99;
    
    const purchaseData = {
      userId,
      productId,
      subscriptionType,
      transactionId,
      purchaseDate: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (subscriptionType === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
      price
    };
    
    console.log('📊 [APP] Datos de compra:', purchaseData);
    
    // Simular el procesamiento que hace subscriptionController.processPurchase
    const SubscriptionController = require('../src/monetization/controllers/subscriptionController');
    const req = {
      body: purchaseData
    };
    const res = {
      status: (code) => ({
        json: (data) => {
          console.log(`📤 [APP] Respuesta (${code}):`, JSON.stringify(data, null, 2));
          return { status: code, json: () => ({ status: code, json: (d) => d }) };
        }
      })
    };
    
    await SubscriptionController.processPurchase(req, res);
    
    console.log('✅ [APP] Compra simulada completada');
    return { success: true, transactionId };
    
  } catch (error) {
    console.error('❌ [APP] Error simulando compra desde app:', error);
    return { success: false, error: error.message };
  }
}

async function simulateRevenueCatWebhook(appUserId, transactionId, price, productId, eventType = 'INITIAL_PURCHASE') {
  try {
    console.log(`\n📨 [REVENUECAT] Simulando webhook ${eventType} para usuario: ${appUserId}`);
    
    const purchaseDate = new Date();
    const expiresDate = new Date();
    const subscriptionType = productId.toLowerCase().includes('monthly') ? 'monthly' : 'yearly';
    
    if (subscriptionType === 'monthly') {
      expiresDate.setMonth(expiresDate.getMonth() + 1);
    } else {
      expiresDate.setFullYear(expiresDate.getFullYear() + 1);
    }
    
    const webhookPayload = {
      event: {
        type: eventType,
        app_user_id: appUserId,
        product_id: productId,
        id: transactionId,
        price: price,
        price_in_purchased_currency: price,
        currency: 'USD',
        purchased_at_ms: purchaseDate.getTime(),
        expiration_at_ms: expiresDate.getTime(),
        environment: 'SANDBOX'
      }
    };
    
    console.log('📋 [REVENUECAT] Payload del webhook:', JSON.stringify(webhookPayload, null, 2));
    
    const RevenueCatWebhookController = require('../src/monetization/controllers/revenuecatWebhookController');
    const req = {
      body: webhookPayload,
      headers: {
        'authorization': `Bearer ${process.env.REVENUECAT_WEBHOOK_SECRET || 'test-secret'}`
      }
    };
    const res = {
      status: (code) => ({
        json: (data) => {
          console.log(`📤 [REVENUECAT] Respuesta (${code}):`, JSON.stringify(data, null, 2));
          return { status: code, json: () => ({ status: code, json: (d) => d }) };
        }
      })
    };
    
    await RevenueCatWebhookController.handleWebhook(req, res);
    
    console.log('✅ [REVENUECAT] Webhook simulado completado');
    return { success: true };
    
  } catch (error) {
    console.error('❌ [REVENUECAT] Error simulando webhook:', error);
    return { success: false, error: error.message };
  }
}

async function simulateCompletePurchase(userEmail, productId) {
  try {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🛒 SIMULANDO COMPRA PARA: ${userEmail}`);
    console.log('='.repeat(80));
    
    // 1. Obtener usuario de BD
    const user = await getUserFromEmail(userEmail);
    if (!user) {
      console.error(`❌ Usuario ${userEmail} no encontrado en BD`);
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    console.log(`✅ Usuario encontrado:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nombre: ${user.name}`);
    
    // 2. Determinar tipo de suscripción
    const subscriptionType = productId.toLowerCase().includes('monthly') ? 'monthly' : 'yearly';
    
    // 3. Simular compra desde app
    console.log(`\n${'─'.repeat(80)}`);
    console.log('📱 PASO 1: Simulando POST desde app a /api/subscriptions/purchase');
    console.log('─'.repeat(80));
    
    const appPurchaseResult = await simulateAppPurchase(user.id, productId, subscriptionType);
    
    if (!appPurchaseResult.success) {
      console.error('❌ La simulación desde app falló, continuando con webhook...');
    }
    
    // Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Simular webhook de RevenueCat
    console.log(`\n${'─'.repeat(80)}`);
    console.log('📨 PASO 2: Simulando webhook de RevenueCat');
    console.log('─'.repeat(80));
    
    const transactionId = appPurchaseResult.transactionId || `rc_sim_${Date.now()}_${user.id.substring(0, 8)}`;
    const price = subscriptionType === 'monthly' ? 2.99 : 19.99;
    
    const webhookResult = await simulateRevenueCatWebhook(
      user.id,  // app_user_id (debe coincidir con user.id)
      transactionId,
      price,
      productId,
      'INITIAL_PURCHASE'
    );
    
    // 5. Verificar resultado en BD
    console.log(`\n${'─'.repeat(80)}`);
    console.log('🔍 PASO 3: Verificando resultado en BD');
    console.log('─'.repeat(80));
    
    const checkQuery = `
      SELECT s.*, u.email 
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = $1 AND s.is_active = true
      ORDER BY s.created_at DESC
      LIMIT 1
    `;
    
    const checkResult = await query(checkQuery, [user.id]);
    
    if (checkResult.rows.length > 0) {
      const sub = checkResult.rows[0];
      console.log(`✅ Suscripción encontrada en BD:`);
      console.log(`   Email: ${sub.email}`);
      console.log(`   Product ID: ${sub.product_id}`);
      console.log(`   Transaction ID: ${sub.transaction_id}`);
      console.log(`   Activa: ${sub.is_active}`);
      console.log(`   Comprado: ${sub.purchase_date}`);
      console.log(`   Expira: ${sub.expires_date}`);
    } else {
      console.log(`⚠️ No se encontró suscripción activa en BD para ${userEmail}`);
    }
    
    return { success: true, userId: user.id };
    
  } catch (error) {
    console.error(`❌ Error en simulación completa para ${userEmail}:`, error);
    console.error('Stack:', error.stack);
    return { success: false, error: error.message };
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando simulación de compras para usuarios de prueba...\n');
    
    // Verificar que los usuarios existen
    console.log('🔍 Verificando usuarios en BD...\n');
    for (const testUser of TEST_USERS) {
      const user = await getUserFromEmail(testUser.email);
      if (user) {
        testUser.expectedUserId = user.id;
        console.log(`✅ ${testUser.email}: ID = ${user.id}`);
      } else {
        console.error(`❌ ${testUser.email}: NO encontrado en BD`);
      }
    }
    
    console.log(`\n${'='.repeat(80)}`);
    console.log('🛒 SIMULACIÓN 1: test1@gmail.com - Compra Monthly');
    console.log('='.repeat(80));
    
    const result1 = await simulateCompletePurchase('test1@gmail.com', 'Fitso_Premium_Monthly');
    
    // Esperar un momento entre compras
    console.log('\n⏳ Esperando 3 segundos antes de la siguiente compra...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log(`\n${'='.repeat(80)}`);
    console.log('🛒 SIMULACIÓN 2: test2@gmail.com - Compra Monthly');
    console.log('='.repeat(80));
    
    const result2 = await simulateCompletePurchase('test2@gmail.com', 'Fitso_Premium_Monthly');
    
    // Resumen final
    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 RESUMEN FINAL');
    console.log('='.repeat(80));
    
    console.log('\n🔍 Verificando todas las suscripciones activas:');
    const allSubsQuery = `
      SELECT u.email, s.product_id, s.transaction_id, s.is_active, s.created_at
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE u.email IN ('test1@gmail.com', 'test2@gmail.com')
      ORDER BY s.created_at DESC
    `;
    
    const allSubsResult = await query(allSubsQuery);
    
    if (allSubsResult.rows.length === 0) {
      console.log('⚠️ No se encontraron suscripciones en BD');
    } else {
      console.log(`\n📊 Total suscripciones: ${allSubsResult.rows.length}`);
      for (const sub of allSubsResult.rows) {
        console.log(`\n👤 ${sub.email}:`);
        console.log(`   Producto: ${sub.product_id}`);
        console.log(`   Transaction ID: ${sub.transaction_id}`);
        console.log(`   Activa: ${sub.is_active ? '✅ Sí' : '❌ No'}`);
        console.log(`   Creada: ${sub.created_at}`);
      }
    }
    
    // Verificar duplicados
    const dupQuery = `
      SELECT transaction_id, COUNT(*) as count, STRING_AGG(DISTINCT u.email, ', ') as usuarios
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE u.email IN ('test1@gmail.com', 'test2@gmail.com')
      GROUP BY transaction_id
      HAVING COUNT(*) > 1
    `;
    
    const dupResult = await query(dupQuery);
    if (dupResult.rows.length > 0) {
      console.log('\n❌ PROBLEMA: Transaction IDs duplicados encontrados:');
      for (const dup of dupResult.rows) {
        console.log(`   ${dup.transaction_id}: usado por ${dup.usuarios}`);
      }
    } else {
      console.log('\n✅ No hay transaction IDs duplicados');
    }
    
    console.log('\n✅ Simulación completada\n');
    
  } catch (error) {
    console.error('❌ Error en simulación:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();


