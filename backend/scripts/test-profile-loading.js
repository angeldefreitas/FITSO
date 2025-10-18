const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const API_BASE_URL = 'http://localhost:3000/api';

const testProfileLoading = async () => {
  console.log('🧪 Probando Carga de Perfil (Anti-Bucle Infinito)');
  console.log('================================================\n');

  let authToken = '';

  try {
    // 1. Registrar usuario
    console.log('1️⃣ Registrando usuario...');
    const uniqueEmail = `test${Date.now()}@fitso.com`;
    const registerRes = await axios.post(`${API_BASE_URL}/auth/register`, {
      name: 'Test Profile Loading',
      email: uniqueEmail,
      password: 'password123',
    });
    authToken = registerRes.data.data.token;
    console.log(`✅ Usuario registrado: ${uniqueEmail}`);

    // 2. Hacer múltiples llamadas rápidas al perfil para simular el bucle
    console.log('\n2️⃣ Simulando múltiples llamadas al perfil...');
    
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(
        axios.get(`${API_BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${authToken}` }
        }).then(res => {
          console.log(`✅ Llamada ${i + 1}: Perfil obtenido correctamente`);
          return res.data;
        }).catch(err => {
          console.log(`❌ Llamada ${i + 1}: Error - ${err.message}`);
          return null;
        })
      );
    }

    const results = await Promise.all(promises);
    const successfulCalls = results.filter(r => r !== null).length;
    
    console.log(`\n📊 Resultados:`);
    console.log(`   - Llamadas exitosas: ${successfulCalls}/10`);
    console.log(`   - Llamadas fallidas: ${10 - successfulCalls}/10`);

    if (successfulCalls === 10) {
      console.log('\n🎉 ¡Todas las llamadas fueron exitosas! No hay bucle infinito.');
    } else {
      console.log('\n⚠️  Algunas llamadas fallaron. Revisar logs del servidor.');
    }

    // 3. Probar actualización de datos biométricos
    console.log('\n3️⃣ Probando actualización de datos biométricos...');
    const biometricData = {
      age: 25,
      heightCm: 170,
      weightKg: 65,
      gender: 'female',
      activityLevel: 'moderate'
    };
    
    const updateRes = await axios.put(
      `${API_BASE_URL}/profile/biometric`,
      biometricData,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✅ Datos biométricos actualizados correctamente');

    // 4. Verificar que el perfil se actualizó
    console.log('\n4️⃣ Verificando perfil actualizado...');
    const finalProfileRes = await axios.get(`${API_BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const profile = finalProfileRes.data.data.profile;
    if (profile && profile.age === 25) {
      console.log('✅ Perfil actualizado correctamente en la base de datos');
    } else {
      console.log('❌ El perfil no se actualizó correctamente');
    }

    console.log('\n🎉 ¡Test de carga de perfil completado exitosamente!');

  } catch (error) {
    console.error('❌ Error en test de carga de perfil:', error.response ? error.response.data : error.message);
  }
};

testProfileLoading();
