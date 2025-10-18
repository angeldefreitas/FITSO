const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Probando API de Fitso Backend');
  console.log('================================');

  try {
    // Test 1: Health check
    console.log('\n1️⃣ Probando health check...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check:', healthResponse.data);

    // Test 2: Registro de usuario
    console.log('\n2️⃣ Probando registro de usuario...');
    const timestamp = Date.now();
    const registerData = {
      name: 'Usuario Test',
      email: `test${timestamp}@fitso.com`,
      password: 'password123'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, registerData);
      console.log('✅ Registro exitoso:', registerResponse.data);
      const token = registerResponse.data.data.token;
      const userId = registerResponse.data.data.user.id;

      // Test 3: Login
      console.log('\n3️⃣ Probando login...');
      const loginData = {
        email: registerData.email,
        password: 'password123'
      };

      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
      console.log('✅ Login exitoso:', loginResponse.data);

      // Test 4: Obtener perfil
      console.log('\n4️⃣ Probando obtener perfil...');
      const profileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Perfil obtenido:', profileResponse.data);

      // Test 5: Actualizar perfil
      console.log('\n5️⃣ Probando actualizar perfil...');
      const updateData = {
        name: 'Usuario Test Actualizado'
      };

      const updateResponse = await axios.put(`${BASE_URL}/api/auth/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Perfil actualizado:', updateResponse.data);

      // Test 6: Forgot password
      console.log('\n6️⃣ Probando forgot password...');
      const forgotResponse = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
        email: registerData.email
      });
      console.log('✅ Forgot password:', forgotResponse.data);

      console.log('\n🎉 ¡Todos los tests pasaron exitosamente!');
      console.log('\n📊 Resumen:');
      console.log('   - Health check: ✅');
      console.log('   - Registro: ✅');
      console.log('   - Login: ✅');
      console.log('   - Perfil: ✅');
      console.log('   - Actualizar perfil: ✅');
      console.log('   - Forgot password: ✅');

    } catch (error) {
      if (error.response) {
        console.log('❌ Error en test:', error.response.data);
      } else {
        console.log('❌ Error:', error.message);
      }
    }

  } catch (error) {
    console.log('❌ Error conectando al servidor:', error.message);
    console.log('💡 Asegúrate de que el servidor esté ejecutándose en http://localhost:3000');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;
