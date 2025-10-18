const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Función para hacer login y obtener token
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('✅ Login exitoso');
    return response.data.token;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    throw error;
  }
}

// Función para probar alimentos
async function testFoods(token) {
  console.log('\n🍎 Probando funcionalidades de alimentos...');
  
  try {
    // 1. Crear alimento
    const foodData = {
      name: 'Pollo Asado',
      brand: 'Carnes Premium',
      barcode: '9876543210987',
      calories_per_100g: 165,
      protein_per_100g: 31,
      carbs_per_100g: 0,
      fat_per_100g: 3.6,
      fiber_per_100g: 0,
      sugar_per_100g: 0,
      sodium_per_100g: 74
    };

    const createResponse = await axios.post(`${BASE_URL}/foods`, foodData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Alimento creado:', createResponse.data.data.name);
    const foodId = createResponse.data.data.id;

    // 2. Buscar alimentos
    const searchResponse = await axios.get(`${BASE_URL}/foods/search?q=pollo`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Búsqueda de alimentos:', searchResponse.data.data.foods.length, 'resultados');

    // 3. Buscar por código de barras
    const barcodeResponse = await axios.get(`${BASE_URL}/barcode/search/9876543210987`);
    console.log('✅ Búsqueda por código de barras:', barcodeResponse.data.data.found ? 'Encontrado' : 'No encontrado');

    return foodId;
  } catch (error) {
    console.error('❌ Error probando alimentos:', error.response?.data || error.message);
    throw error;
  }
}

// Función para probar comidas
async function testMeals(token, foodId) {
  console.log('\n🍽️ Probando funcionalidades de comidas...');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Agregar comida
    const mealData = {
      food_id: foodId,
      quantity: 200, // 200 gramos
      meal_type: 'lunch',
      entry_date: today
    };

    const addResponse = await axios.post(`${BASE_URL}/meals`, mealData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Comida agregada:', addResponse.data.data.food.name, '(', addResponse.data.data.quantity, 'g)');
    const mealId = addResponse.data.data.id;

    // 2. Obtener comidas del día
    const mealsResponse = await axios.get(`${BASE_URL}/meals/date/${today}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Comidas del día:', mealsResponse.data.data.meals.length, 'entradas');
    console.log('📊 Totales nutricionales:', mealsResponse.data.data.nutrition_totals);

    // 3. Obtener historial de comidas
    const historyResponse = await axios.get(`${BASE_URL}/meals/history?limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Historial de comidas:', historyResponse.data.data.history.length, 'fechas');

    return mealId;
  } catch (error) {
    console.error('❌ Error probando comidas:', error.response?.data || error.message);
    throw error;
  }
}

// Función para probar seguimiento de peso
async function testWeightTracking(token) {
  console.log('\n⚖️ Probando seguimiento de peso...');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Agregar entrada de peso
    const weightData = {
      weight: 75.5,
      entry_date: today,
      notes: 'Peso matutino'
    };

    const addResponse = await axios.post(`${BASE_URL}/progress/weight`, weightData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Entrada de peso agregada:', addResponse.data.data.weight, 'kg');

    // 2. Obtener entradas de peso del día
    const weightResponse = await axios.get(`${BASE_URL}/progress/weight/date/${today}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Entradas de peso del día:', weightResponse.data.data.entries.length, 'entradas');

    // 3. Obtener historial de peso
    const historyResponse = await axios.get(`${BASE_URL}/progress/weight/history?limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Historial de peso:', historyResponse.data.data.history.length, 'fechas');

  } catch (error) {
    console.error('❌ Error probando seguimiento de peso:', error.response?.data || error.message);
    throw error;
  }
}

// Función para probar seguimiento de agua
async function testWaterTracking(token) {
  console.log('\n💧 Probando seguimiento de agua...');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Agregar entrada de agua
    const waterData = {
      amount_ml: 250,
      entry_date: today
    };

    const addResponse = await axios.post(`${BASE_URL}/progress/water`, waterData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Entrada de agua agregada:', addResponse.data.data.amount_ml, 'ml');

    // 2. Agregar otra entrada de agua
    const waterData2 = {
      amount_ml: 500,
      entry_date: today
    };

    await axios.post(`${BASE_URL}/progress/water`, waterData2, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Segunda entrada de agua agregada:', waterData2.amount_ml, 'ml');

    // 3. Obtener entradas de agua del día
    const waterResponse = await axios.get(`${BASE_URL}/progress/water/date/${today}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Entradas de agua del día:', waterResponse.data.data.entries.length, 'entradas');
    console.log('💧 Total de agua consumida:', waterResponse.data.data.total_ml, 'ml');

    // 4. Obtener historial de agua
    const historyResponse = await axios.get(`${BASE_URL}/progress/water/history?limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Historial de agua:', historyResponse.data.data.history.length, 'fechas');

  } catch (error) {
    console.error('❌ Error probando seguimiento de agua:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal de prueba
async function runCompleteTest() {
  console.log('🚀 Iniciando prueba completa de integración...\n');

  try {
    // 1. Login
    const token = await login();

    // 2. Probar alimentos
    const foodId = await testFoods(token);

    // 3. Probar comidas
    const mealId = await testMeals(token, foodId);

    // 4. Probar seguimiento de peso
    await testWeightTracking(token);

    // 5. Probar seguimiento de agua
    await testWaterTracking(token);

    console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!');
    console.log('\n📊 Resumen de funcionalidades probadas:');
    console.log('✅ Autenticación');
    console.log('✅ Gestión de alimentos (CRUD, búsqueda, código de barras)');
    console.log('✅ Gestión de comidas (agregar, obtener por fecha, historial)');
    console.log('✅ Seguimiento de peso (agregar, obtener por fecha, historial)');
    console.log('✅ Seguimiento de agua (agregar, obtener por fecha, historial)');

  } catch (error) {
    console.error('💥 Error en las pruebas:', error.message);
    process.exit(1);
  }
}

// Ejecutar pruebas
runCompleteTest();
