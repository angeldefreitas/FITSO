#!/usr/bin/env node

/**
 * Script para sincronizar el afiliado creado localmente a producción
 * usando la API de Render
 */

const axios = require('axios');

async function syncAffiliateToProduction() {
  try {
    console.log('🚀 Sincronizando afiliado a producción...');

    // Datos del afiliado que ya creamos localmente
    const affiliateData = {
      email: 'afiliado@gmail.com',
      name: 'Afiliado',
      password: '211299',
      referralCode: 'AFILIADO',
      commissionPercentage: 35
    };

    console.log('📝 Datos del afiliado:', affiliateData);

    // Intentar crear el afiliado usando la API
    console.log('🌐 Enviando request a la API...');
    const response = await axios.post(
      'https://fitso-backend.onrender.com/api/affiliates/create-account',
      affiliateData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 segundos de timeout
      }
    );

    console.log('✅ Respuesta de la API:', response.data);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔐 Error de autenticación - el endpoint requiere token');
    } else if (error.response?.status === 500) {
      console.log('🔧 Error del servidor - revisar logs de Render');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🌐 Error de conexión - el servidor no está disponible');
    }
  }
}

syncAffiliateToProduction()
  .then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
