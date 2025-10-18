const axios = require('axios');

// Configuración
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

let authToken = '';

// Función para hacer login y obtener token
async function login() {
  try {
    console.log('🔐 Iniciando sesión...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ Login exitoso');
      return true;
    } else {
      console.log('❌ Error en login:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data?.message || error.message);
    return false;
  }
}

// Headers con autenticación
const getHeaders = () => ({
  'Authorization': `Bearer ${authToken}`,
  'Content-Type': 'application/json'
});

// Función para probar obtener calorías quemadas por fecha
async function testGetCaloriesBurnedByDate(date = '2024-01-15') {
  try {
    console.log(`📊 Obteniendo calorías quemadas para ${date}...`);
    const response = await axios.get(`${API_BASE_URL}/progress/calories-burned/date/${date}`, {
      headers: getHeaders()
    });

    if (response.data.success) {
      console.log('✅ Calorías quemadas obtenidas:', response.data.data);
      return response.data.data;
    } else {
      console.log('❌ Error obteniendo calorías quemadas:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error obteniendo calorías quemadas:', error.response?.data?.message || error.message);
    return null;
  }
}

// Función para probar agregar calorías quemadas
async function testAddCaloriesBurned(date = '2024-01-15', caloriesBurned = 500, caloriesGoal = 750) {
  try {
    console.log(`🔥 Agregando ${caloriesBurned} calorías quemadas para ${date}...`);
    const response = await axios.post(`${API_BASE_URL}/progress/calories-burned`, {
      calories_burned: caloriesBurned,
      calories_goal: caloriesGoal,
      entry_date: date
    }, {
      headers: getHeaders()
    });

    if (response.data.success) {
      console.log('✅ Calorías quemadas agregadas:', response.data.data);
      return response.data.data;
    } else {
      console.log('❌ Error agregando calorías quemadas:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error agregando calorías quemadas:', error.response?.data?.message || error.message);
    return null;
  }
}

// Función para probar actualizar calorías quemadas
async function testUpdateCaloriesBurned(entryId, caloriesBurned = 750) {
  try {
    console.log(`🔄 Actualizando calorías quemadas ID ${entryId} a ${caloriesBurned}...`);
    const response = await axios.put(`${API_BASE_URL}/progress/calories-burned/${entryId}`, {
      calories_burned: caloriesBurned
    }, {
      headers: getHeaders()
    });

    if (response.data.success) {
      console.log('✅ Calorías quemadas actualizadas:', response.data.data);
      return response.data.data;
    } else {
      console.log('❌ Error actualizando calorías quemadas:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error actualizando calorías quemadas:', error.response?.data?.message || error.message);
    return null;
  }
}

// Función para probar obtener historial de calorías quemadas
async function testGetCaloriesBurnedHistory(limit = 10) {
  try {
    console.log(`📈 Obteniendo historial de calorías quemadas (últimos ${limit} días)...`);
    const response = await axios.get(`${API_BASE_URL}/progress/calories-burned/history?limit=${limit}`, {
      headers: getHeaders()
    });

    if (response.data.success) {
      console.log('✅ Historial obtenido:', response.data.data);
      return response.data.data;
    } else {
      console.log('❌ Error obteniendo historial:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error obteniendo historial:', error.response?.data?.message || error.message);
    return null;
  }
}

// Función para probar obtener calorías quemadas por rango de fechas
async function testGetCaloriesBurnedByRange(startDate = '2024-01-01', endDate = '2024-01-31') {
  try {
    console.log(`📊 Obteniendo calorías quemadas del ${startDate} al ${endDate}...`);
    const response = await axios.get(`${API_BASE_URL}/progress/calories-burned/range?startDate=${startDate}&endDate=${endDate}`, {
      headers: getHeaders()
    });

    if (response.data.success) {
      console.log('✅ Calorías quemadas por rango obtenidas:', response.data.data);
      return response.data.data;
    } else {
      console.log('❌ Error obteniendo calorías quemadas por rango:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error obteniendo calorías quemadas por rango:', error.response?.data?.message || error.message);
    return null;
  }
}

// Función principal de prueba
async function runTests() {
  console.log('🚀 Iniciando pruebas de calorías quemadas...\n');

  // 1. Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ No se pudo hacer login, abortando pruebas');
    return;
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 2. Obtener calorías quemadas para una fecha (debería crear entrada por defecto)
  const initialData = await testGetCaloriesBurnedByDate();
  
  console.log('\n' + '='.repeat(50) + '\n');

  // 3. Agregar calorías quemadas
  const addedEntry = await testAddCaloriesBurned('2024-01-15', 300, 750);
  
  console.log('\n' + '='.repeat(50) + '\n');

  // 4. Obtener calorías quemadas actualizadas
  const updatedData = await testGetCaloriesBurnedByDate();
  
  console.log('\n' + '='.repeat(50) + '\n');

  // 5. Actualizar calorías quemadas si tenemos un ID
  if (updatedData && updatedData.entry && updatedData.entry.id) {
    await testUpdateCaloriesBurned(updatedData.entry.id, 450);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');

  // 6. Agregar más entradas para probar el historial
  await testAddCaloriesBurned('2024-01-16', 400, 750);
  await testAddCaloriesBurned('2024-01-17', 350, 800);
  await testAddCaloriesBurned('2024-01-18', 600, 750);
  
  console.log('\n' + '='.repeat(50) + '\n');

  // 7. Obtener historial
  await testGetCaloriesBurnedHistory();
  
  console.log('\n' + '='.repeat(50) + '\n');

  // 8. Obtener por rango de fechas
  await testGetCaloriesBurnedByRange('2024-01-15', '2024-01-18');
  
  console.log('\n' + '='.repeat(50) + '\n');

  // 9. Probar validaciones con datos inválidos
  console.log('🧪 Probando validaciones con datos inválidos...');
  
  try {
    await axios.post(`${API_BASE_URL}/progress/calories-burned`, {
      calories_burned: -100, // Inválido: negativo
      entry_date: '2024-01-15'
    }, {
      headers: getHeaders()
    });
    console.log('❌ La validación no funcionó - se aceptó un valor negativo');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validación funcionó correctamente - rechazó valor negativo');
    } else {
      console.log('❌ Error inesperado en validación:', error.response?.data?.message);
    }
  }

  try {
    await axios.post(`${API_BASE_URL}/progress/calories-burned`, {
      calories_burned: 15000, // Inválido: muy alto
      entry_date: '2024-01-15'
    }, {
      headers: getHeaders()
    });
    console.log('❌ La validación no funcionó - se aceptó un valor muy alto');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validación funcionó correctamente - rechazó valor muy alto');
    } else {
      console.log('❌ Error inesperado en validación:', error.response?.data?.message);
    }
  }

  try {
    await axios.post(`${API_BASE_URL}/progress/calories-burned`, {
      calories_burned: 500,
      entry_date: '2024-13-45' // Inválido: fecha incorrecta
    }, {
      headers: getHeaders()
    });
    console.log('❌ La validación no funcionó - se aceptó una fecha inválida');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validación funcionó correctamente - rechazó fecha inválida');
    } else {
      console.log('❌ Error inesperado en validación:', error.response?.data?.message);
    }
  }

  console.log('\n🎉 Pruebas de calorías quemadas completadas!');
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testGetCaloriesBurnedByDate,
  testAddCaloriesBurned,
  testUpdateCaloriesBurned,
  testGetCaloriesBurnedHistory,
  testGetCaloriesBurnedByRange
};
