const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const API_BASE_URL = 'http://localhost:3000/api';

const testFrontendBiometric = async () => {
  console.log('🧪 Simulando Flujo Completo del Frontend');
  console.log('========================================\n');

  let authToken = '';

  try {
    // 1. Registrar usuario (como en el frontend)
    console.log('1️⃣ Registrando usuario...');
    const uniqueEmail = `test${Date.now()}@fitso.com`;
    const registerRes = await axios.post(`${API_BASE_URL}/auth/register`, {
      name: 'Test Frontend Flow',
      email: uniqueEmail,
      password: 'password123',
    });
    authToken = registerRes.data.data.token;
    console.log(`✅ Usuario registrado: ${uniqueEmail}`);

    // 2. Login (como en el frontend)
    console.log('\n2️⃣ Haciendo login...');
    const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: uniqueEmail,
      password: 'password123',
    });
    authToken = loginRes.data.data.token;
    console.log('✅ Login exitoso');

    // 3. Obtener perfil inicial (como ProfileScreen)
    console.log('\n3️⃣ Obteniendo perfil inicial (ProfileScreen)...');
    const profileRes = await axios.get(`${API_BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Perfil inicial obtenido:', {
      hasProfile: !!profileRes.data.data.profile,
      biometricData: profileRes.data.data.biometricData
    });

    // 4. Simular apertura del modal de datos biométricos
    console.log('\n4️⃣ Simulando apertura del modal de datos biométricos...');
    console.log('   (Usuario hace clic en "Ver/Actualizar Datos")');

    // 5. Simular guardado de datos biométricos (como handleBiometricSave)
    console.log('\n5️⃣ Simulando guardado de datos biométricos...');
    const biometricData = {
      age: 28,
      heightCm: 180,
      weightKg: 75,
      gender: 'male',
      activityLevel: 'active'
    };
    
    console.log('   Datos a enviar:', biometricData);
    
    try {
      const saveRes = await axios.put(
        `${API_BASE_URL}/profile/biometric`,
        biometricData,
        { 
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('✅ Datos biométricos guardados exitosamente');
      console.log('   Respuesta del servidor:', {
        success: saveRes.data.success,
        message: saveRes.data.message,
        hasProfile: !!saveRes.data.data.profile,
        biometricData: saveRes.data.data.biometricData
      });
      
    } catch (error) {
      console.log('❌ Error guardando datos biométricos:');
      console.log('   Status:', error.response?.status);
      console.log('   Status Text:', error.response?.statusText);
      console.log('   Headers:', error.response?.headers);
      console.log('   Data:', error.response?.data);
      console.log('   Request URL:', error.config?.url);
      console.log('   Request Method:', error.config?.method);
      console.log('   Request Data:', error.config?.data);
      console.log('   Request Headers:', error.config?.headers);
      return;
    }

    // 6. Verificar que los datos se guardaron correctamente
    console.log('\n6️⃣ Verificando que los datos se guardaron...');
    const verifyRes = await axios.get(`${API_BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const profile = verifyRes.data.data.profile;
    if (profile) {
      console.log('✅ Datos verificados correctamente:');
      console.log(`   - Edad: ${profile.age} (esperado: 28)`);
      console.log(`   - Altura: ${profile.height} cm (esperado: 180)`);
      console.log(`   - Peso: ${profile.weight} kg (esperado: 75)`);
      console.log(`   - Género: ${profile.gender} (esperado: male)`);
      console.log(`   - Actividad: ${profile.activity_level} (esperado: active)`);
      
      // Verificar que los datos coinciden
      const isCorrect = 
        profile.age === 28 &&
        profile.height === 180 &&
        profile.weight === 75 &&
        profile.gender === 'male' &&
        profile.activity_level === 'active';
        
      if (isCorrect) {
        console.log('✅ Todos los datos coinciden correctamente');
      } else {
        console.log('❌ Algunos datos no coinciden');
      }
    } else {
      console.log('❌ No se pudo obtener el perfil para verificación');
    }

    console.log('\n🎉 Simulación del flujo del frontend completada exitosamente.');

  } catch (error) {
    console.error('❌ Error en simulación del frontend:', error.response ? error.response.data : error.message);
  }
};

testFrontendBiometric();
