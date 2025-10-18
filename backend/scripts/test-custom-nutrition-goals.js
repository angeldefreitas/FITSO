const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Datos de prueba para objetivos nutricionales personalizados
const testCustomGoals = {
  calories: 2500,
  protein: 150,
  carbs: 300,
  fat: 80,
  isCustom: true
};

async function testCustomNutritionGoals() {
  try {
    console.log('🧪 Probando objetivos nutricionales personalizados...\n');

    // 1. Registrar usuario de prueba
    console.log('1️⃣ Registrando usuario de prueba...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Test User Custom Goals',
      email: `test-custom-goals-${Date.now()}@example.com`,
      password: 'password123'
    });

    if (!registerResponse.data.success) {
      throw new Error('Error registrando usuario: ' + registerResponse.data.message);
    }

    const { data } = registerResponse.data;
    const { user, token } = data;
    console.log('✅ Usuario registrado:', user.email);

    // Configurar headers con token
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

    if (!biometricResponse.data.success) {
      throw new Error('Error configurando datos biométricos: ' + biometricResponse.data.message);
    }
    console.log('✅ Datos biométricos configurados');

    // 3. Configurar metas con objetivos nutricionales personalizados
    console.log('\n3️⃣ Configurando metas con objetivos personalizados...');
    const goalsResponse = await axios.put(`${BASE_URL}/api/profile/goals`, {
      goal: 'lose_weight',
      weightGoalAmount: 0.5,
      nutritionGoals: testCustomGoals
    }, { headers });

    if (!goalsResponse.data.success) {
      throw new Error('Error configurando metas: ' + goalsResponse.data.message);
    }
    console.log('✅ Metas configuradas con objetivos personalizados');

    // 4. Verificar que los objetivos se guardaron correctamente
    console.log('\n4️⃣ Verificando objetivos guardados...');
    const profileResponse = await axios.get(`${BASE_URL}/api/profile`, { headers });

    if (!profileResponse.data.success) {
      throw new Error('Error obteniendo perfil: ' + profileResponse.data.message);
    }

    console.log('📊 Respuesta completa del perfil:', JSON.stringify(profileResponse.data, null, 2));
    const { data: profileData } = profileResponse.data;
    const { goalsData } = profileData;
    console.log('📊 Objetivos guardados:', JSON.stringify(goalsData, null, 2));

    // Verificar que los objetivos personalizados se guardaron
    if (goalsData.nutritionGoals) {
      console.log('✅ Objetivos nutricionales personalizados guardados correctamente');
      console.log('   - Calorías:', goalsData.nutritionGoals.calories);
      console.log('   - Proteínas:', goalsData.nutritionGoals.protein);
      console.log('   - Carbohidratos:', goalsData.nutritionGoals.carbs);
      console.log('   - Grasas:', goalsData.nutritionGoals.fat);
      console.log('   - Es personalizado:', goalsData.nutritionGoals.isCustom);
    } else {
      console.log('❌ Los objetivos nutricionales personalizados no se guardaron');
    }

    // 5. Probar actualización de objetivos personalizados
    console.log('\n5️⃣ Probando actualización de objetivos personalizados...');
    const updatedCustomGoals = {
      calories: 2800,
      protein: 180,
      carbs: 350,
      fat: 90,
      isCustom: true
    };

    const updateGoalsResponse = await axios.put(`${BASE_URL}/api/profile/goals`, {
      goal: 'gain_weight',
      weightGoalAmount: 0.3,
      nutritionGoals: updatedCustomGoals
    }, { headers });

    if (!updateGoalsResponse.data.success) {
      throw new Error('Error actualizando metas: ' + updateGoalsResponse.data.message);
    }
    console.log('✅ Metas actualizadas con nuevos objetivos personalizados');

    // 6. Verificar actualización
    console.log('\n6️⃣ Verificando actualización...');
    const updatedProfileResponse = await axios.get(`${BASE_URL}/api/profile`, { headers });
    const { data: updatedData } = updatedProfileResponse.data;
    const { goalsData: updatedGoalsData } = updatedData;

    console.log('📊 Objetivos actualizados:', JSON.stringify(updatedGoalsData, null, 2));

    if (updatedGoalsData.nutritionGoals) {
      console.log('✅ Objetivos nutricionales actualizados correctamente');
      console.log('   - Calorías:', updatedGoalsData.nutritionGoals.calories);
      console.log('   - Proteínas:', updatedGoalsData.nutritionGoals.protein);
      console.log('   - Carbohidratos:', updatedGoalsData.nutritionGoals.carbs);
      console.log('   - Grasas:', updatedGoalsData.nutritionGoals.fat);
    }

    console.log('\n🎉 ¡Prueba de objetivos nutricionales personalizados completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Ejecutar prueba
testCustomNutritionGoals();
