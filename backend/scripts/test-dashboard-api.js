const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testDashboardAPI() {
  console.log('🧪 Probando API del dashboard de afiliados...\n');

  try {
    // 1. Crear un usuario afiliado
    console.log('1️⃣ Creando usuario afiliado...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      email: `test-affiliate-${Date.now()}@example.com`,
      password: 'test123456',
      name: 'Test Affiliate'
    });

    console.log('✅ Usuario creado:', registerResponse.data.user.email);

    // 2. Hacer login para obtener token
    console.log('\n2️⃣ Haciendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: registerResponse.data.user.email,
      password: 'test123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Token obtenido');

    // 3. Marcar usuario como afiliado (simulando que ya es afiliado)
    console.log('\n3️⃣ Marcando usuario como afiliado...');
    // Esto requeriría una consulta directa a la base de datos
    // Por ahora vamos a probar el endpoint directamente

    // 4. Probar el endpoint del dashboard
    console.log('\n4️⃣ Probando endpoint del dashboard...');
    try {
      const dashboardResponse = await axios.get(`${BASE_URL}/api/affiliates/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Dashboard response:', dashboardResponse.data);
    } catch (error) {
      console.log('❌ Error en dashboard:', error.response?.data || error.message);
    }

    // 5. Probar endpoint de estadísticas
    console.log('\n5️⃣ Probando endpoint de estadísticas...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/api/affiliates/stats/TEST_CODE`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Stats response:', statsResponse.data);
    } catch (error) {
      console.log('❌ Error en stats:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
  }
}

// Ejecutar la prueba
testDashboardAPI();
