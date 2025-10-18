const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testChangePassword() {
  console.log('🧪 Probando cambio de contraseña...\n');

  try {
    // 1. Registrar un usuario
    console.log('1️⃣ Registrando usuario...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test User',
      email: `test${Date.now()}@fitso.com`,
      password: 'password123'
    });

    if (!registerResponse.data.success) {
      throw new Error('Error en registro');
    }

    const { user, token } = registerResponse.data.data;
    console.log('✅ Usuario registrado:', user.email);

    // 2. Hacer login para obtener token
    console.log('\n2️⃣ Haciendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: user.email,
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Error en login');
    }

    const authToken = loginResponse.data.data.token;
    console.log('✅ Login exitoso');

    // 3. Cambiar contraseña
    console.log('\n3️⃣ Cambiando contraseña...');
    const changePasswordResponse = await axios.put(
      `${BASE_URL}/auth/change-password`,
      {
        currentPassword: 'password123',
        newPassword: 'newpassword456'
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    if (!changePasswordResponse.data.success) {
      throw new Error('Error cambiando contraseña');
    }

    console.log('✅ Contraseña cambiada exitosamente');

    // 4. Verificar que el login con la nueva contraseña funciona
    console.log('\n4️⃣ Verificando login con nueva contraseña...');
    const newLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: user.email,
      password: 'newpassword456'
    });

    if (!newLoginResponse.data.success) {
      throw new Error('Error en login con nueva contraseña');
    }

    console.log('✅ Login con nueva contraseña exitoso');

    // 5. Verificar que el login con la contraseña antigua falla
    console.log('\n5️⃣ Verificando que la contraseña antigua ya no funciona...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: user.email,
        password: 'password123'
      });
      console.log('❌ ERROR: La contraseña antigua aún funciona');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Contraseña antigua correctamente invalidada');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 ¡Test de cambio de contraseña completado exitosamente!');

  } catch (error) {
    console.error('❌ Error en test:', error.response?.data || error.message);
    process.exit(1);
  }
}

testChangePassword();
