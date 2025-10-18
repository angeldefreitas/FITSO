const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const API_BASE_URL = 'http://localhost:3000/api';

const testGenderValidation = async () => {
  console.log('🧪 Probando Validación de Género (Solo Male/Female)');
  console.log('==================================================\n');

  let authToken = '';

  try {
    // 1. Registrar usuario
    console.log('1️⃣ Registrando usuario...');
    const uniqueEmail = `test${Date.now()}@fitso.com`;
    const registerRes = await axios.post(`${API_BASE_URL}/auth/register`, {
      name: 'Test Gender Validation',
      email: uniqueEmail,
      password: 'password123',
    });
    authToken = registerRes.data.data.token;
    console.log(`✅ Usuario registrado: ${uniqueEmail}`);

    // 2. Probar con género válido (male)
    console.log('\n2️⃣ Probando con género válido (male)...');
    try {
      const maleRes = await axios.put(
        `${API_BASE_URL}/profile/biometric`,
        {
          age: 25,
          heightCm: 175,
          weightKg: 70,
          gender: 'male',
          activityLevel: 'moderate'
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('✅ Género "male" aceptado correctamente');
    } catch (error) {
      console.log(`❌ Error con género "male": ${error.response?.data?.message || error.message}`);
    }

    // 3. Probar con género válido (female)
    console.log('\n3️⃣ Probando con género válido (female)...');
    try {
      const femaleRes = await axios.put(
        `${API_BASE_URL}/profile/biometric`,
        {
          age: 25,
          heightCm: 165,
          weightKg: 60,
          gender: 'female',
          activityLevel: 'moderate'
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('✅ Género "female" aceptado correctamente');
    } catch (error) {
      console.log(`❌ Error con género "female": ${error.response?.data?.message || error.message}`);
    }

    // 4. Probar con género inválido (other) - Debe fallar
    console.log('\n4️⃣ Probando con género inválido (other)...');
    try {
      const otherRes = await axios.put(
        `${API_BASE_URL}/profile/biometric`,
        {
          age: 25,
          heightCm: 170,
          weightKg: 65,
          gender: 'other',
          activityLevel: 'moderate'
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('❌ ERROR: Género "other" fue aceptado cuando debería ser rechazado');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Género "other" correctamente rechazado:', error.response.data.message);
      } else {
        console.log(`❌ Error inesperado: ${error.message}`);
      }
    }

    // 5. Probar con género inválido (invalid) - Debe fallar
    console.log('\n5️⃣ Probando con género inválido (invalid)...');
    try {
      const invalidRes = await axios.put(
        `${API_BASE_URL}/profile/biometric`,
        {
          age: 25,
          heightCm: 170,
          weightKg: 65,
          gender: 'invalid',
          activityLevel: 'moderate'
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('❌ ERROR: Género "invalid" fue aceptado cuando debería ser rechazado');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Género "invalid" correctamente rechazado:', error.response.data.message);
      } else {
        console.log(`❌ Error inesperado: ${error.message}`);
      }
    }

    // 6. Verificar perfil final
    console.log('\n6️⃣ Verificando perfil final...');
    try {
      const profileRes = await axios.get(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      const profile = profileRes.data.data.profile;
      if (profile && (profile.gender === 'male' || profile.gender === 'female')) {
        console.log(`✅ Perfil final correcto: género = ${profile.gender}`);
      } else {
        console.log(`❌ Perfil final incorrecto: género = ${profile?.gender}`);
      }
    } catch (error) {
      console.log(`❌ Error obteniendo perfil final: ${error.message}`);
    }

    console.log('\n🎉 Test de validación de género completado.');

  } catch (error) {
    console.error('❌ Error en test de validación de género:', error.response ? error.response.data : error.message);
  }
};

testGenderValidation();
