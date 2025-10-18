const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const API_BASE_URL = 'http://localhost:3000/api';

const testFrontendSimulation = async () => {
  console.log('🧪 Simulando Comportamiento del Frontend');
  console.log('========================================\n');

  let authToken = '';

  try {
    // 1. Registrar usuario
    console.log('1️⃣ Registrando usuario...');
    const uniqueEmail = `test${Date.now()}@fitso.com`;
    const registerRes = await axios.post(`${API_BASE_URL}/auth/register`, {
      name: 'Test Frontend Simulation',
      email: uniqueEmail,
      password: 'password123',
    });
    authToken = registerRes.data.data.token;
    console.log(`✅ Usuario registrado: ${uniqueEmail}`);

    // 2. Simular el comportamiento del frontend: múltiples llamadas rápidas
    console.log('\n2️⃣ Simulando comportamiento del frontend...');
    console.log('   (Múltiples llamadas rápidas como en el useEffect)');
    
    let callCount = 0;
    const maxCalls = 20; // Simular 20 llamadas rápidas
    
    const makeCall = async (callNumber) => {
      try {
        const startTime = Date.now();
        const response = await axios.get(`${API_BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`✅ Llamada ${callNumber}: ${duration}ms - Perfil obtenido`);
        return { success: true, duration, callNumber };
      } catch (error) {
        console.log(`❌ Llamada ${callNumber}: Error - ${error.message}`);
        return { success: false, error: error.message, callNumber };
      }
    };

    // Hacer llamadas secuenciales rápidas (como en el frontend)
    const results = [];
    for (let i = 1; i <= maxCalls; i++) {
      const result = await makeCall(i);
      results.push(result);
      
      // Pequeña pausa para simular el comportamiento del frontend
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // 3. Analizar resultados
    console.log('\n3️⃣ Analizando resultados...');
    const successfulCalls = results.filter(r => r.success).length;
    const failedCalls = results.filter(r => !r.success).length;
    const avgDuration = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.duration, 0) / successfulCalls;

    console.log(`\n📊 Estadísticas:`);
    console.log(`   - Llamadas exitosas: ${successfulCalls}/${maxCalls}`);
    console.log(`   - Llamadas fallidas: ${failedCalls}/${maxCalls}`);
    console.log(`   - Duración promedio: ${avgDuration.toFixed(2)}ms`);

    if (failedCalls > 0) {
      console.log(`\n⚠️  Se detectaron ${failedCalls} llamadas fallidas.`);
      console.log('   Esto podría indicar un problema en el backend o rate limiting.');
    } else {
      console.log('\n🎉 Todas las llamadas fueron exitosas.');
    }

    // 4. Probar actualización de datos
    console.log('\n4️⃣ Probando actualización de datos...');
    const biometricData = {
      age: 30,
      heightCm: 175,
      weightKg: 70,
      gender: 'male',
      activityLevel: 'active'
    };
    
    try {
      const updateRes = await axios.put(
        `${API_BASE_URL}/profile/biometric`,
        biometricData,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('✅ Datos biométricos actualizados correctamente');
      
      // Verificar que se actualizó
      const verifyRes = await axios.get(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (verifyRes.data.data.profile && verifyRes.data.data.profile.age === 30) {
        console.log('✅ Verificación: Los datos se guardaron correctamente');
      } else {
        console.log('❌ Verificación: Los datos no se guardaron correctamente');
      }
    } catch (error) {
      console.log(`❌ Error actualizando datos: ${error.message}`);
    }

    console.log('\n🎉 Simulación del frontend completada.');

  } catch (error) {
    console.error('❌ Error en simulación del frontend:', error.response ? error.response.data : error.message);
  }
};

testFrontendSimulation();
