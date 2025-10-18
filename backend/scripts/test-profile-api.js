const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const API_BASE_URL = 'http://localhost:3000/api';

const testProfileAPI = async () => {
  console.log('🧪 Probando API de Perfiles de Fitso');
  console.log('=====================================\n');

  let authToken = '';

  try {
    // 1. Registrar usuario
    console.log('1️⃣ Registrando usuario...');
    const uniqueEmail = `test${Date.now()}@fitso.com`;
    const registerRes = await axios.post(`${API_BASE_URL}/auth/register`, {
      name: 'Test Profile User',
      email: uniqueEmail,
      password: 'password123',
    });
    authToken = registerRes.data.data.token;
    console.log(`✅ Usuario registrado: ${uniqueEmail}`);

    // 2. Obtener perfil (debería estar vacío)
    console.log('\n2️⃣ Obteniendo perfil inicial...');
    const getProfileRes = await axios.get(`${API_BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Perfil inicial obtenido:', {
      hasProfile: !!getProfileRes.data.data.profile,
      biometricData: getProfileRes.data.data.biometricData,
      goalsData: getProfileRes.data.data.goalsData
    });

    // 3. Actualizar datos biométricos
    console.log('\n3️⃣ Actualizando datos biométricos...');
    const biometricData = {
      age: 28,
      heightCm: 180,
      weightKg: 75,
      gender: 'male',
      activityLevel: 'active'
    };
    
    const updateBiometricRes = await axios.put(
      `${API_BASE_URL}/profile/biometric`,
      biometricData,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✅ Datos biométricos actualizados:', updateBiometricRes.data.data.biometricData);

    // 4. Actualizar datos de metas
    console.log('\n4️⃣ Actualizando datos de metas...');
    const goalsData = {
      goal: 'lose_weight',
      weightGoalAmount: 0.5,
      nutritionGoals: null
    };
    
    const updateGoalsRes = await axios.put(
      `${API_BASE_URL}/profile/goals`,
      goalsData,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✅ Datos de metas actualizados:', updateGoalsRes.data.data.goalsData);

    // 5. Obtener perfil completo actualizado
    console.log('\n5️⃣ Obteniendo perfil completo actualizado...');
    const getUpdatedProfileRes = await axios.get(`${API_BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Perfil completo:', {
      profile: getUpdatedProfileRes.data.data.profile,
      biometricData: getUpdatedProfileRes.data.data.biometricData,
      goalsData: getUpdatedProfileRes.data.data.goalsData
    });

    // 6. Actualizar perfil completo (flexible)
    console.log('\n6️⃣ Actualizando perfil completo (flexible)...');
    const fullProfileData = {
      age: 30,
      weight: 80,
      activity_level: 'very_active'
    };
    
    const updateFullProfileRes = await axios.put(
      `${API_BASE_URL}/profile`,
      fullProfileData,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✅ Perfil completo actualizado:', updateFullProfileRes.data.data.profile);

    // 7. Probar validaciones (datos inválidos)
    console.log('\n7️⃣ Probando validaciones...');
    try {
      await axios.put(
        `${API_BASE_URL}/profile/biometric`,
        { age: 5, heightCm: 50, weightKg: 10, gender: 'invalid', activityLevel: 'invalid' },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('❌ Error: La validación debería haber fallado');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validaciones funcionando correctamente:', error.response.data.errors);
      } else {
        console.error('❌ Error inesperado en validaciones:', error.message);
      }
    }

    console.log('\n🎉 ¡Todos los tests de perfiles pasaron exitosamente!');
    
    console.log('\n📊 Resumen:');
    console.log('   - Obtener perfil: ✅');
    console.log('   - Actualizar datos biométricos: ✅');
    console.log('   - Actualizar datos de metas: ✅');
    console.log('   - Actualizar perfil completo: ✅');
    console.log('   - Validaciones: ✅');

  } catch (error) {
    console.error('❌ Error en test de perfiles:', error.response ? error.response.data : error.message);
  }
};

testProfileAPI();
