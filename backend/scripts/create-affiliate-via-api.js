#!/usr/bin/env node

/**
 * Script para crear un afiliado usando la API de Render
 */

const axios = require('axios');

async function createAffiliateViaAPI() {
  try {
    console.log('🚀 Creando afiliado usando la API de Render...');

    // Primero necesitamos obtener un token de autenticación
    // Vamos a usar el endpoint de login para obtener un token
    const loginResponse = await axios.post('https://fitso-backend.onrender.com/api/auth/login', {
      email: 'angelfritas@gmail.com',
      password: 'tu_contraseña_aqui' // Necesitas poner la contraseña real
    });

    if (!loginResponse.data.success) {
      console.error('❌ Error en login:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Token obtenido:', token.substring(0, 20) + '...');

    // Ahora crear el afiliado usando el token
    const affiliateData = {
      email: 'afiliado@gmail.com',
      name: 'Afiliado',
      password: '211299',
      referralCode: 'AFILIADO',
      commissionPercentage: 35
    };

    console.log('👤 Creando afiliado...');
    const createResponse = await axios.post(
      'https://fitso-backend.onrender.com/api/affiliates/create-account',
      affiliateData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (createResponse.data.success) {
      console.log('✅ Afiliado creado exitosamente!');
      console.log('📧 Email:', affiliateData.email);
      console.log('🔑 Contraseña:', affiliateData.password);
      console.log('🎫 Código:', affiliateData.referralCode);
    } else {
      console.error('❌ Error creando afiliado:', createResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createAffiliateViaAPI()
  .then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
