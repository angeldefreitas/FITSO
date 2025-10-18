const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function debugGoalsResponse() {
  try {
    console.log('🔍 Debuggeando respuesta de goals...\n');

    // 1. Registrar usuario
    console.log('1️⃣ Registrando usuario...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Debug User',
      email: `debug-${Date.now()}@example.com`,
      password: 'password123'
    });

    const { data } = registerResponse.data;
    const { user, token } = data;
    console.log('✅ Usuario registrado:', user.email);

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Configurar datos biométricos
    console.log('\n2️⃣ Configurando datos biométricos...');
    const biometricResponse = await axios.put(`${BASE_URL}/api/profile/biometric`, {
      age: 25,
      heightCm: 175,
      weightKg: 70,
      gender: 'male',
      activityLevel: 'moderate'
    }, { headers });

    console.log('📊 Respuesta biometric:', JSON.stringify(biometricResponse.data, null, 2));

    // 3. Configurar metas
    console.log('\n3️⃣ Configurando metas...');
    const goalsResponse = await axios.put(`${BASE_URL}/api/profile/goals`, {
      goal: 'lose_weight',
      weightGoalAmount: 0.5,
      nutritionGoals: {
        calories: 2500,
        protein: 150,
        carbs: 300,
        fat: 80,
        isCustom: true
      }
    }, { headers });

    console.log('📊 Respuesta goals:', JSON.stringify(goalsResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugGoalsResponse();
