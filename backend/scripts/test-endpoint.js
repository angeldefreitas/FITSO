#!/usr/bin/env node

/**
 * Script para probar el endpoint de prueba
 */

const axios = require('axios');

async function testEndpoint() {
  try {
    console.log('🧪 Probando endpoint de prueba...');

    const testData = {
      message: 'Test desde script',
      timestamp: new Date().toISOString()
    };

    const response = await axios.post(
      'https://fitso-backend.onrender.com/api/test',
      testData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log('✅ Respuesta del endpoint de prueba:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Error probando endpoint:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No se recibió respuesta:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testEndpoint()
  .then(() => {
    console.log('✅ Prueba completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
