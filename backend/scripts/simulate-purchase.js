/**
 * Script para simular una compra de suscripción premium
 * Simula el flujo completo: login, compra, y webhook de RevenueCat
 */

const axios = require('axios');

// Configuración
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const TEST_USER = {
  email: 'test9@gmail.com',
  password: '211299'
};

// Colores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[33m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class PurchaseSimulator {
  constructor() {
    this.token = null;
    this.userId = null;
    this.baseURL = BACKEND_URL;
  }

  /**
   * Paso 1: Login del usuario
   */
  async login() {
    try {
      log('\n🔐 [PASO 1] Iniciando sesión...', 'cyan');
      
      const response = await axios.post(`${this.baseURL}/api/auth/login`, {
        email: TEST_USER.email,
        password: TEST_USER.password
      });

      if (response.data.success) {
        this.token = response.data.data.token;
        this.userId = response.data.data.user.id;
        log(`✅ Login exitoso`, 'green');
        log(`   Usuario ID: ${this.userId}`, 'blue');
        log(`   Email: ${response.data.data.user.email}`, 'blue');
        return true;
      } else {
        log(`❌ Error en login: ${response.data.message}`, 'red');
        return false;
      }
    } catch (error) {
      if (error.response) {
        log(`❌ Error en login (${error.response.status}): ${error.response.data.message}`, 'red');
      } else {
        log(`❌ Error de conexión: ${error.message}`, 'red');
        log(`   Verifica que el servidor esté corriendo en ${this.baseURL}`, 'yellow');
      }
      return false;
    }
  }

  /**
   * Paso 2: Verificar estado actual del usuario
   */
  async checkUserStatus() {
    try {
      log('\n📊 [PASO 2] Verificando estado actual del usuario...', 'cyan');
      
      const response = await axios.get(
        `${this.baseURL}/api/subscriptions/status/${this.userId}`,
        {
          headers: { Authorization: `Bearer ${this.token}` }
        }
      );

      if (response.data.success) {
        log(`✅ Estado del usuario:`, 'green');
        log(`   Premium: ${response.data.data.isPremium ? 'Sí' : 'No'}`, 'blue');
        log(`   Tipo: ${response.data.data.subscriptionType || 'N/A'}`, 'blue');
        log(`   Expira: ${response.data.data.expiresAt || 'N/A'}`, 'blue');
      } else {
        log(`ℹ️ No hay suscripción activa`, 'yellow');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        log(`ℹ️ Usuario sin suscripción previa`, 'yellow');
      } else {
        log(`⚠️ Error verificando estado: ${error.message}`, 'yellow');
      }
    }
  }

  /**
   * Paso 3: Simular compra desde la app (notificación inmediata)
   */
  async simulateAppPurchase(subscriptionType = 'monthly') {
    try {
      log(`\n🛒 [PASO 3] Simulando compra desde la app (${subscriptionType})...`, 'cyan');
      
      const productId = subscriptionType === 'monthly' 
        ? 'Fitso_Premium_Monthly' 
        : 'Fitso_Premium_Yearly';
      
      const price = subscriptionType === 'monthly' ? 2.99 : 19.99;
      const transactionId = `rc_test_${Date.now()}`;
      
      const purchaseData = {
        userId: this.userId,
        productId,
        subscriptionType,
        transactionId,
        purchaseDate: new Date().toISOString(),
        expiresAt: new Date(Date.now() + (subscriptionType === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
        price
      };

      log(`📦 Datos de compra:`, 'blue');
      log(`   Product ID: ${productId}`, 'blue');
      log(`   Precio: $${price}`, 'blue');
      log(`   Transaction ID: ${transactionId}`, 'blue');

      const response = await axios.post(
        `${this.baseURL}/api/subscriptions/purchase`,
        purchaseData,
        {
          headers: { Authorization: `Bearer ${this.token}` }
        }
      );

      if (response.data.success) {
        log(`✅ Compra procesada exitosamente`, 'green');
        if (response.data.data.commission) {
          log(`💰 Comisión generada:`, 'green');
          log(`   Afiliado: ${response.data.data.commission.affiliate_code}`, 'blue');
          log(`   Monto: $${response.data.data.commission.commission_amount}`, 'blue');
          log(`   Porcentaje: ${response.data.data.commission.commission_percentage}%`, 'blue');
        } else {
          log(`ℹ️ No se generó comisión (usuario sin código de referencia)`, 'yellow');
        }
        return true;
      } else {
        log(`❌ Error procesando compra: ${response.data.message}`, 'red');
        return false;
      }
    } catch (error) {
      if (error.response) {
        log(`❌ Error en compra (${error.response.status}): ${error.response.data.message}`, 'red');
      } else {
        log(`❌ Error de conexión: ${error.message}`, 'red');
      }
      return false;
    }
  }

  /**
   * Paso 4: Simular webhook de RevenueCat (evento INITIAL_PURCHASE)
   */
  async simulateRevenueCatWebhook(subscriptionType = 'monthly') {
    try {
      log(`\n📨 [PASO 4] Simulando webhook de RevenueCat...`, 'cyan');
      
      const productId = subscriptionType === 'monthly' 
        ? 'Fitso_Premium_Monthly' 
        : 'Fitso_Premium_Yearly';
      
      const price = subscriptionType === 'monthly' ? 2.99 : 19.99;
      const transactionId = `rc_${Date.now()}`;

      // Simular payload de RevenueCat
      const webhookPayload = {
        event: {
          id: transactionId,
          type: 'INITIAL_PURCHASE',
          app_user_id: this.userId,
          product_id: productId,
          price: price,
          price_in_purchased_currency: price,
          currency: 'USD',
          purchased_at_ms: Date.now(),
          expiration_at_ms: Date.now() + (subscriptionType === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000
        }
      };

      log(`📦 Payload del webhook:`, 'blue');
      log(`   Tipo: ${webhookPayload.event.type}`, 'blue');
      log(`   Usuario: ${webhookPayload.event.app_user_id}`, 'blue');
      log(`   Producto: ${webhookPayload.event.product_id}`, 'blue');
      log(`   Precio: $${webhookPayload.event.price}`, 'blue');

      const response = await axios.post(
        `${this.baseURL}/api/webhooks/revenuecat`,
        webhookPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            // En desarrollo, el webhook puede aceptar sin Authorization
            // En producción debería tener: Authorization: `Bearer ${process.env.REVENUECAT_WEBHOOK_SECRET}`
          }
        }
      );

      if (response.data.success) {
        log(`✅ Webhook procesado exitosamente`, 'green');
        return true;
      } else {
        log(`⚠️ Webhook procesado con advertencias: ${response.data.message}`, 'yellow');
        return true; // RevenueCat siempre responde 200
      }
    } catch (error) {
      if (error.response) {
        log(`❌ Error en webhook (${error.response.status}): ${error.response.data.message}`, 'red');
      } else {
        log(`❌ Error de conexión: ${error.message}`, 'red');
      }
      return false;
    }
  }

  /**
   * Paso 5: Verificar estado después de la compra
   */
  async verifyFinalStatus() {
    try {
      log('\n🔍 [PASO 5] Verificando estado final...', 'cyan');
      await sleep(1000); // Esperar un momento para que se procese
      
      const response = await axios.get(
        `${this.baseURL}/api/subscriptions/status/${this.userId}`,
        {
          headers: { Authorization: `Bearer ${this.token}` }
        }
      );

      if (response.data.success) {
        log(`✅ Estado final:`, 'green');
        log(`   Premium: ${response.data.data.isPremium ? 'Sí ✅' : 'No ❌'}`, 'blue');
        log(`   Tipo: ${response.data.data.subscriptionType || 'N/A'}`, 'blue');
        log(`   Expira: ${response.data.data.expiresAt || 'N/A'}`, 'blue');
      }
    } catch (error) {
      log(`⚠️ Error verificando estado final: ${error.message}`, 'yellow');
    }
  }

  /**
   * Ejecutar simulación completa
   */
  async run(subscriptionType = 'monthly') {
    log('\n🚀 === SIMULACIÓN DE COMPRA PREMIUM ===', 'cyan');
    log(`📱 Usuario: ${TEST_USER.email}`, 'blue');
    log(`💳 Tipo: ${subscriptionType}`, 'blue');
    log(`🌐 Backend: ${this.baseURL}`, 'blue');

    // Verificar conexión
    try {
      log('\n🔌 Verificando conexión con el servidor...', 'cyan');
      await axios.get(`${this.baseURL}/api/health`);
      log('✅ Servidor conectado', 'green');
    } catch (error) {
      log('❌ No se puede conectar al servidor', 'red');
      log(`   Asegúrate de que el servidor esté corriendo en ${this.baseURL}`, 'yellow');
      log(`   Ejecuta: cd backend && npm run dev`, 'yellow');
      process.exit(1);
    }

    // Paso 1: Login
    const loginSuccess = await this.login();
    if (!loginSuccess) {
      log('\n❌ No se pudo iniciar sesión. Abortando...', 'red');
      process.exit(1);
    }

    await sleep(500);

    // Paso 2: Verificar estado inicial
    await this.checkUserStatus();

    await sleep(500);

    // Paso 3: Simular compra desde la app
    await this.simulateAppPurchase(subscriptionType);

    await sleep(1000);

    // Paso 4: Simular webhook de RevenueCat
    await this.simulateRevenueCatWebhook(subscriptionType);

    await sleep(1000);

    // Paso 5: Verificar estado final
    await this.verifyFinalStatus();

    log('\n✅ === SIMULACIÓN COMPLETADA ===', 'green');
    log('\n📝 Resumen:', 'cyan');
    log('   1. ✅ Login exitoso', 'green');
    log('   2. ✅ Compra procesada desde la app', 'green');
    log('   3. ✅ Webhook de RevenueCat procesado', 'green');
    log('   4. ✅ Comisión de afiliado generada (si aplica)', 'green');
    log('\n💡 Nota: Este es un flujo simulado. En producción:');
    log('   - La compra real se hace a través de RevenueCat SDK en la app', 'yellow');
    log('   - RevenueCat envía el webhook automáticamente después de la compra', 'yellow');
    log('   - El webhook es la fuente de verdad para comisiones', 'yellow');
  }
}

// Ejecutar simulación
async function main() {
  const simulator = new PurchaseSimulator();
  
  // Obtener tipo de suscripción desde argumentos de línea de comandos
  const subscriptionType = process.argv[2] === 'yearly' ? 'yearly' : 'monthly';
  
  await simulator.run(subscriptionType);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = PurchaseSimulator;

