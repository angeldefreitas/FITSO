const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const BASE_URL = 'http://192.168.1.154:3000';

async function runTest() {
  console.log('🧪 Probando conexión desde frontend (IP local)...');
  
  try {
    // 1. Probar endpoint raíz
    console.log('\n1️⃣ Probando endpoint raíz...');
    const rootResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Endpoint raíz responde:', rootResponse.data.message);

    // 2. Probar endpoint de salud
    console.log('\n2️⃣ Probando endpoint de salud...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Endpoint de salud responde:', healthResponse.data.message);

    // 3. Probar registro de usuario
    console.log('\n3️⃣ Probando registro de usuario...');
    const userEmail = `test-connection-${Date.now()}@example.com`;
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Test Connection',
      email: userEmail,
      password: 'password123',
    });
    
    if (registerResponse.data.success) {
      console.log('✅ Registro exitoso:', registerResponse.data.data.user.email);
      const token = registerResponse.data.data.token;
      
      // 4. Probar endpoint de perfil
      console.log('\n4️⃣ Probando endpoint de perfil...');
      const profileResponse = await axios.get(`${BASE_URL}/api/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Endpoint de perfil responde:', profileResponse.data.success);
      
      // 5. Probar configuración de datos biométricos
      console.log('\n5️⃣ Probando configuración de datos biométricos...');
      const biometricResponse = await axios.put(`${BASE_URL}/api/profile/biometric`, {
        age: 25,
        heightCm: 175,
        weightKg: 70,
        gender: 'male',
        activityLevel: 'moderate',
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Datos biométricos configurados:', biometricResponse.data.success);
      
      // 6. Probar configuración de metas
      console.log('\n6️⃣ Probando configuración de metas...');
      const goalsResponse = await axios.put(`${BASE_URL}/api/profile/goals`, {
        goal: 'lose_weight',
        weightGoalAmount: 0.5,
        nutritionGoals: {
          calories: 2000,
          protein: 150,
          carbs: 250,
          fat: 70,
          isCustom: true,
        }
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Metas configuradas:', goalsResponse.data.success);
      
      console.log('\n🎉 ¡Todas las pruebas de conexión pasaron exitosamente!');
      console.log('📱 El frontend debería poder conectarse correctamente ahora.');
      
    } else {
      throw new Error('Error en el registro: ' + registerResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Error en la prueba de conexión:', error.message);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
    }
    process.exit(1);
  }
}

runTest();
