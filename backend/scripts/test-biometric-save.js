const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const API_BASE_URL = 'http://localhost:3000/api';

const testBiometricSave = async () => {
  console.log('🧪 Probando Guardado de Datos Biométricos');
  console.log('=========================================\n');

  let authToken = '';

  try {
    // 1. Registrar usuario
    console.log('1️⃣ Registrando usuario...');
    const uniqueEmail = `test${Date.now()}@fitso.com`;
    const registerRes = await axios.post(`${API_BASE_URL}/auth/register`, {
      name: 'Test Biometric Save',
      email: uniqueEmail,
      password: 'password123',
    });
    authToken = registerRes.data.data.token;
    console.log(`✅ Usuario registrado: ${uniqueEmail}`);

    // 2. Obtener perfil inicial (debería estar vacío)
    console.log('\n2️⃣ Obteniendo perfil inicial...');
    const initialProfileRes = await axios.get(`${API_BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Perfil inicial obtenido:', {
      hasProfile: !!initialProfileRes.data.data.profile,
      biometricData: initialProfileRes.data.data.biometricData
    });

    // 3. Intentar guardar datos biométricos (primera vez)
    console.log('\n3️⃣ Guardando datos biométricos (primera vez)...');
    const biometricData1 = {
      age: 25,
      heightCm: 175,
      weightKg: 70,
      gender: 'male',
      activityLevel: 'moderate'
    };
    
    try {
      const saveRes1 = await axios.put(
        `${API_BASE_URL}/profile/biometric`,
        biometricData1,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('✅ Datos biométricos guardados correctamente (primera vez)');
      console.log('   Perfil creado:', !!saveRes1.data.data.profile);
    } catch (error) {
      console.log('❌ Error guardando datos biométricos (primera vez):');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Errors:', error.response?.data?.errors);
      return;
    }

    // 4. Intentar guardar datos biométricos (segunda vez - actualización)
    console.log('\n4️⃣ Guardando datos biométricos (segunda vez - actualización)...');
    const biometricData2 = {
      age: 26,
      heightCm: 176,
      weightKg: 72,
      gender: 'male',
      activityLevel: 'active'
    };
    
    try {
      const saveRes2 = await axios.put(
        `${API_BASE_URL}/profile/biometric`,
        biometricData2,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('✅ Datos biométricos actualizados correctamente (segunda vez)');
      console.log('   Edad actualizada:', saveRes2.data.data.profile.age);
      console.log('   Peso actualizado:', saveRes2.data.data.profile.weight);
    } catch (error) {
      console.log('❌ Error actualizando datos biométricos (segunda vez):');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Errors:', error.response?.data?.errors);
      return;
    }

    // 5. Verificar perfil final
    console.log('\n5️⃣ Verificando perfil final...');
    const finalProfileRes = await axios.get(`${API_BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const profile = finalProfileRes.data.data.profile;
    if (profile) {
      console.log('✅ Perfil final verificado:');
      console.log(`   - Edad: ${profile.age}`);
      console.log(`   - Altura: ${profile.height} cm`);
      console.log(`   - Peso: ${profile.weight} kg`);
      console.log(`   - Género: ${profile.gender}`);
      console.log(`   - Actividad: ${profile.activity_level}`);
    } else {
      console.log('❌ No se pudo obtener el perfil final');
    }

    console.log('\n🎉 Test de guardado de datos biométricos completado exitosamente.');

  } catch (error) {
    console.error('❌ Error en test de guardado de datos biométricos:', error.response ? error.response.data : error.message);
  }
};

testBiometricSave();
