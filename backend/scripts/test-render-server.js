#!/usr/bin/env node

/**
 * Script para probar si el servidor de Render está funcionando
 */

const axios = require('axios');

async function testRenderServer() {
  try {
    console.log('🧪 Probando servidor de Render...');

    // Probar endpoint de health
    console.log('🔍 Probando endpoint de health...');
    const healthResponse = await axios.get('https://fitso-backend.onrender.com/api/health', {
      timeout: 10000
    });
    console.log('✅ Health check exitoso:', healthResponse.data);

    // Probar endpoint de prueba
    console.log('🔍 Probando endpoint de prueba...');
    const testResponse = await axios.get('https://fitso-backend.onrender.com/api/test-auth', {
      timeout: 10000
    });
    console.log('✅ Test endpoint exitoso:', testResponse.data);

  } catch (error) {
    console.error('❌ Error probando servidor de Render:');
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

testRenderServer()
  .then(() => {
    console.log('✅ Prueba completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
