/**
 * Script para probar el webhook de RevenueCat de forma REALISTA
 * Simula exactamente lo que RevenueCat enviaría después de una compra real
 */

const axios = require('axios');

// Configuración
const BACKEND_URL = process.env.BACKEND_URL || 'https://fitso.onrender.com';
const USER_ID = process.env.TEST_USER_ID || '36913c9a-fad3-4692-a6d9-598b4fc9763c'; // test9@gmail.com
const WEBHOOK_SECRET = process.env.REVENUECAT_WEBHOOK_SECRET || ''; // Configurar si está disponible

// Colores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[33m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Simula un webhook REAL de RevenueCat para INITIAL_PURCHASE
 * Basado en la documentación oficial de RevenueCat
 */
function createRealisticRevenueCatWebhook(subscriptionType = 'monthly') {
  const now = Date.now();
  const productId = subscriptionType === 'monthly' 
    ? 'Fitso_Premium_Monthly' 
    : 'Fitso_Premium_Yearly';
  
  const price = subscriptionType === 'monthly' ? 2.99 : 19.99;
  
  // Estructura real de un webhook de RevenueCat
  return {
    event: {
      id: `rc_${now}`,
      type: 'INITIAL_PURCHASE',
      app_user_id: USER_ID,
      product_id: productId,
      period_type: subscriptionType === 'monthly' ? 'NORMAL' : 'TRIAL',
      purchased_at_ms: now,
      expiration_at_ms: now + (subscriptionType === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000,
      environment: 'SANDBOX', // o 'PRODUCTION'
      entitlement_ids: ['entl0b12b2e363'], // Premium entitlement ID
      transaction_id: `transaction_${now}`,
      original_transaction_id: `original_${now}`,
      is_family_share: false,
      currency: 'USD',
      price: price,
      price_in_purchased_currency: price,
      store: 'APP_STORE', // o 'PLAY_STORE'
      take_percentage: 0.30, // 30% para Apple/Google
      subscriber_attributes: {},
      presented_offering_id: null,
      presentation: null
    },
    api_version: '1.0'
  };
}

/**
 * Enviar webhook a Render
 */
async function sendWebhookToRender() {
  try {
    log('\n🚀 === TEST WEBHOOK REVENUECAT REALISTA ===', 'cyan');
    log(`🌐 Backend URL: ${BACKEND_URL}`, 'blue');
    log(`👤 User ID: ${USER_ID}`, 'blue');
    
    // Crear payload realista
    const webhookPayload = createRealisticRevenueCatWebhook('monthly');
    
    log('\n📨 [WEBHOOK] Enviando webhook de RevenueCat...', 'cyan');
    log(`📦 Tipo de evento: ${webhookPayload.event.type}`, 'blue');
    log(`📦 Producto: ${webhookPayload.event.product_id}`, 'blue');
    log(`💰 Precio: $${webhookPayload.event.price}`, 'blue');
    log(`🏪 Store: ${webhookPayload.event.store}`, 'blue');
    log(`🌍 Environment: ${webhookPayload.event.environment}`, 'blue');
    
    // Headers como RevenueCat los enviaría
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'RevenueCat-Webhook/1.0'
    };
    
    // Agregar Authorization si está configurado
    if (WEBHOOK_SECRET) {
      headers['Authorization'] = `Bearer ${WEBHOOK_SECRET}`;
      log(`🔑 Authorization header: Configurado`, 'green');
    } else {
      log(`⚠️ Authorization header: No configurado (se usará modo permisivo)`, 'yellow');
    }
    
    // Enviar webhook
    const startTime = Date.now();
    const response = await axios.post(
      `${BACKEND_URL}/api/webhooks/revenuecat`,
      webhookPayload,
      { 
        headers,
        timeout: 30000 // 30 segundos timeout
      }
    );
    
    const duration = Date.now() - startTime;
    
    log(`\n✅ [WEBHOOK] Respuesta recibida (${duration}ms)`, 'green');
    log(`📊 Status: ${response.status}`, 'blue');
    log(`📋 Response:`, 'blue');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      log(`\n✅ Webhook procesado exitosamente`, 'green');
    } else {
      log(`\n⚠️ Webhook procesado con advertencias: ${response.data.message}`, 'yellow');
    }
    
    return true;
    
  } catch (error) {
    log(`\n❌ Error enviando webhook:`, 'red');
    
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Message: ${error.response.data?.message || 'Sin mensaje'}`, 'red');
      log(`   Response:`, 'red');
      console.log(JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      log(`   No se recibió respuesta del servidor`, 'red');
      log(`   Verifica que ${BACKEND_URL} esté disponible`, 'yellow');
    } else {
      log(`   Error: ${error.message}`, 'red');
    }
    
    return false;
  }
}

/**
 * Verificar estado del servidor
 */
async function checkServerHealth() {
  try {
    log('\n🔍 Verificando servidor...', 'cyan');
    const response = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 10000 });
    
    log(`✅ Servidor funcionando`, 'green');
    log(`   Database: ${response.data.database}`, 'blue');
    log(`   Environment: ${response.data.environment}`, 'blue');
    log(`   Timestamp: ${response.data.timestamp}`, 'blue');
    
    return true;
  } catch (error) {
    log(`❌ Servidor no disponible: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Verificar que el usuario existe
 */
async function verifyUser() {
  try {
    log('\n🔍 Verificando usuario...', 'cyan');
    
    // Hacer login para verificar que el usuario existe
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'test9@gmail.com',
      password: '211299'
    });
    
    if (loginResponse.data.success) {
      const userId = loginResponse.data.data.user.id;
      log(`✅ Usuario verificado: ${userId}`, 'green');
      log(`   Email: test9@gmail.com`, 'blue');
      
      // Actualizar USER_ID si es diferente
      if (userId !== USER_ID) {
        log(`⚠️ User ID diferente al esperado. Usando: ${userId}`, 'yellow');
      }
      
      return userId;
    }
    
    return null;
  } catch (error) {
    log(`⚠️ No se pudo verificar usuario (puede ser normal si no está en producción)`, 'yellow');
    return USER_ID; // Usar el ID por defecto
  }
}

/**
 * Main
 */
async function main() {
  log('\n🎯 === TEST WEBHOOK REVENUECAT EN PRODUCCIÓN ===', 'magenta');
  
  // 1. Verificar servidor
  const serverOk = await checkServerHealth();
  if (!serverOk) {
    log('\n❌ El servidor no está disponible. Abortando...', 'red');
    process.exit(1);
  }
  
  // 2. Verificar usuario
  const actualUserId = await verifyUser();
  if (actualUserId && actualUserId !== USER_ID) {
    log(`\n💡 Actualizando USER_ID a: ${actualUserId}`, 'cyan');
    // Podríamos actualizar, pero para este test usamos el original
  }
  
  // 3. Enviar webhook
  const success = await sendWebhookToRender();
  
  if (success) {
    log('\n✅ === TEST COMPLETADO ===', 'green');
    log('\n📝 Próximos pasos:', 'cyan');
    log('   1. Revisar logs en Render dashboard', 'blue');
    log('   2. Verificar eventos en RevenueCat dashboard', 'blue');
    log('   3. Revisar tabla affiliate_commissions en BD', 'blue');
    log('   4. Probar compra real desde la app móvil', 'blue');
  } else {
    log('\n❌ === TEST FALLIDO ===', 'red');
    log('   Revisa los errores arriba', 'yellow');
    process.exit(1);
  }
}

// Ejecutar
if (require.main === module) {
  main().catch(error => {
    log(`\n❌ Error fatal: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { createRealisticRevenueCatWebhook, sendWebhookToRender };

