const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// Token de prueba (necesitarás obtener uno real)
const TEST_TOKEN = 'tu_token_de_prueba_aqui';
const TEST_USER_ID = 'test-user-id';

// Recibo de prueba (necesitarás usar uno real de sandbox)
const TEST_RECEIPT_DATA = 'base64_encoded_receipt_data_here';

async function testSubscriptionEndpoints() {
  console.log('🧪 Probando endpoints de suscripciones...\n');

  const headers = {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Verificar recibo
    console.log('1️⃣ Probando verificación de recibo...');
    const verifyResponse = await axios.post(
      `${BASE_URL}/api/subscriptions/verify-receipt`,
      {
        userId: TEST_USER_ID,
        receiptData: TEST_RECEIPT_DATA
      },
      { headers }
    );
    console.log('✅ Verificación de recibo:', verifyResponse.data);

    // 2. Obtener estado de suscripción
    console.log('\n2️⃣ Probando obtención de estado...');
    const statusResponse = await axios.get(
      `${BASE_URL}/api/subscriptions/status/${TEST_USER_ID}`,
      { headers }
    );
    console.log('✅ Estado de suscripción:', statusResponse.data);

    // 3. Obtener historial de suscripciones
    console.log('\n3️⃣ Probando historial de suscripciones...');
    const historyResponse = await axios.get(
      `${BASE_URL}/api/subscriptions/history/${TEST_USER_ID}`,
      { headers }
    );
    console.log('✅ Historial de suscripciones:', historyResponse.data);

    // 4. Cancelar suscripción (opcional)
    console.log('\n4️⃣ Probando cancelación de suscripción...');
    const cancelResponse = await axios.post(
      `${BASE_URL}/api/subscriptions/cancel`,
      {
        userId: TEST_USER_ID
      },
      { headers }
    );
    console.log('✅ Cancelación de suscripción:', cancelResponse.data);

    console.log('\n🎉 Todas las pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
  }
}

async function testHealthEndpoint() {
  console.log('🏥 Probando endpoint de salud...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check:', response.data);
  } catch (error) {
    console.error('❌ Error en health check:', error.message);
  }
}

async function main() {
  console.log('🚀 Iniciando pruebas de suscripciones...\n');
  
  // Primero verificar que el servidor esté funcionando
  await testHealthEndpoint();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Luego probar los endpoints de suscripciones
  await testSubscriptionEndpoints();
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testSubscriptionEndpoints,
  testHealthEndpoint
};
