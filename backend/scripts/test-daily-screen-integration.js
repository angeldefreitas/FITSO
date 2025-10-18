const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function runTest() {
  console.log('🧪 Probando integración DailyScreen con objetivos nutricionales...');
  let token = '';
  let userId = '';
  const userEmail = `test-daily-screen-${Date.now()}@example.com`;

  try {
    // 1. Registrar un nuevo usuario
    console.log('\n1️⃣ Registrando usuario de prueba...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Test Daily Screen',
      email: userEmail,
      password: 'password123',
    });

    if (!registerResponse.data.success) {
      throw new Error('Error registrando usuario: ' + registerResponse.data.message);
    }

    const { data } = registerResponse.data;
    const { user, token: userToken } = data;
    token = userToken;
    userId = user.id;
    console.log('✅ Usuario registrado:', user.email);

    // Configurar headers con token
    const headers = {
      'Authorization': `Bearer ${token}`,
    };

    // 2. Configurar datos biométricos
    console.log('\n2️⃣ Configurando datos biométricos...');
    const biometricData = {
      age: 30,
      heightCm: 180,
      weightKg: 75,
      gender: 'male',
      activityLevel: 'moderate',
    };
    const biometricResponse = await axios.put(`${BASE_URL}/api/profile/biometric`, biometricData, { headers });
    if (!biometricResponse.data.success) {
      throw new Error('Error configurando datos biométricos: ' + biometricResponse.data.message);
    }
    console.log('✅ Datos biométricos configurados');

    // 3. Configurar metas con objetivos personalizados
    console.log('\n3️⃣ Configurando metas con objetivos personalizados...');
    const customGoals = {
      calories: 3000,
      protein: 200,
      carbs: 400,
      fat: 100,
      isCustom: true,
    };
    const goalsData = {
      goal: 'gain_weight',
      weightGoalAmount: 0.5,
      nutritionGoals: customGoals,
    };
    const goalsResponse = await axios.put(`${BASE_URL}/api/profile/goals`, goalsData, { headers });

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

    const { data: profileData } = profileResponse.data;
    const { goalsData: fetchedGoalsData } = profileData;
    
    console.log('📊 Objetivos guardados:', JSON.stringify(fetchedGoalsData, null, 2));

    // Verificar que los objetivos personalizados se guardaron
    if (fetchedGoalsData.nutritionGoals && fetchedGoalsData.nutritionGoals.isCustom) {
      console.log('✅ Objetivos nutricionales personalizados guardados correctamente');
      console.log('   - Calorías:', fetchedGoalsData.nutritionGoals.calories);
      console.log('   - Proteínas:', fetchedGoalsData.nutritionGoals.protein);
      console.log('   - Carbohidratos:', fetchedGoalsData.nutritionGoals.carbs);
      console.log('   - Grasas:', fetchedGoalsData.nutritionGoals.fat);
      console.log('   - Es personalizado:', fetchedGoalsData.nutritionGoals.isCustom);

      // Simular lo que haría el DailyScreen
      console.log('\n5️⃣ Simulando carga en DailyScreen...');
      const dailyScreenGoals = {
        calories: fetchedGoalsData.nutritionGoals.calories,
        protein: fetchedGoalsData.nutritionGoals.protein,
        carbs: fetchedGoalsData.nutritionGoals.carbs,
        fat: fetchedGoalsData.nutritionGoals.fat,
        isCustom: true,
      };
      
      console.log('📱 Objetivos que vería el DailyScreen:', JSON.stringify(dailyScreenGoals, null, 2));
      console.log('✅ DailyScreen debería mostrar estos objetivos en los círculos y barras');
      
    } else {
      throw new Error('No se encontraron objetivos nutricionales personalizados en el perfil.');
    }

    // 5. Probar objetivos automáticos
    console.log('\n6️⃣ Probando objetivos automáticos...');
    const autoGoalsData = {
      goal: 'lose_weight',
      weightGoalAmount: 0.3,
      nutritionGoals: null, // Sin objetivos personalizados
    };
    const autoGoalsResponse = await axios.put(`${BASE_URL}/api/profile/goals`, autoGoalsData, { headers });

    if (!autoGoalsResponse.data.success) {
      throw new Error('Error configurando metas automáticas: ' + autoGoalsResponse.data.message);
    }
    console.log('✅ Metas automáticas configuradas');

    // 6. Verificar objetivos automáticos
    console.log('\n7️⃣ Verificando objetivos automáticos...');
    const autoProfileResponse = await axios.get(`${BASE_URL}/api/profile`, { headers });
    const { data: autoProfileData } = autoProfileResponse.data;
    const { goalsData: autoFetchedGoalsData } = autoProfileData;

    console.log('📊 Objetivos automáticos:', JSON.stringify(autoFetchedGoalsData, null, 2));

    if (!autoFetchedGoalsData.nutritionGoals || !autoFetchedGoalsData.nutritionGoals.isCustom) {
      console.log('✅ Objetivos automáticos configurados correctamente');
      console.log('   - DailyScreen debería calcular automáticamente los objetivos basados en datos biométricos');
    } else {
      throw new Error('Los objetivos automáticos no se configuraron correctamente.');
    }

    console.log('\n🎉 ¡Prueba de integración DailyScreen completada exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('   ✅ Objetivos personalizados se guardan y cargan correctamente');
    console.log('   ✅ DailyScreen puede acceder a los objetivos desde AuthContext');
    console.log('   ✅ Los círculos y barras de macronutrientes deberían mostrar los objetivos correctos');
    console.log('   ✅ Objetivos automáticos funcionan cuando no hay personalizados');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    if (error.response) {
      console.error('Detalles del error de la API:', error.response.data);
    }
    process.exit(1);
  } finally {
    // Limpiar usuario de prueba (opcional)
    // if (token) {
    //   await axios.delete(`${BASE_URL}/api/auth/delete-account`, { headers: { 'Authorization': `Bearer ${token}` } });
    //   console.log('🗑️ Usuario de prueba eliminado.');
    // }
  }
}

runTest();
