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

// Función para crear un alimento de prueba
async function createTestFood(token) {
  try {
    const foodData = {
      name: 'Manzana Roja',
      brand: 'Frutas Frescas',
      barcode: '1234567890123',
      calories_per_100g: 52,
      protein_per_100g: 0.3,
      carbs_per_100g: 13.8,
      fat_per_100g: 0.2,
      fiber_per_100g: 2.4,
      sugar_per_100g: 10.4,
      sodium_per_100g: 1
    };

    const response = await axios.post(`${BASE_URL}/foods`, foodData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Alimento creado:', response.data.data.name);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error creando alimento:', error.response?.data || error.message);
    throw error;
  }
}

// Función para buscar alimentos
async function searchFoods(token, searchTerm) {
  try {
    const response = await axios.get(`${BASE_URL}/foods/search?q=${searchTerm}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ Búsqueda de "${searchTerm}":`, response.data.data.foods.length, 'resultados');
    return response.data.data.foods;
  } catch (error) {
    console.error('❌ Error buscando alimentos:', error.response?.data || error.message);
    throw error;
  }
}

// Función para agregar una comida
async function addMeal(token, foodId) {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const mealData = {
      food_id: foodId,
      quantity: 150, // 150 gramos
      meal_type: 'breakfast',
      entry_date: today
    };

    const response = await axios.post(`${BASE_URL}/meals`, mealData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Comida agregada:', response.data.data.food.name, '(', response.data.data.quantity, 'g)');
    return response.data.data;
  } catch (error) {
    console.error('❌ Error agregando comida:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener comidas del día
async function getMealsByDate(token, date) {
  try {
    const response = await axios.get(`${BASE_URL}/meals/date/${date}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ Comidas del ${date}:`, response.data.data.meals.length, 'entradas');
    console.log('📊 Totales nutricionales:', response.data.data.nutrition_totals);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error obteniendo comidas:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener historial de comidas
async function getMealHistory(token) {
  try {
    const response = await axios.get(`${BASE_URL}/meals/history?limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Historial de comidas:', response.data.data.history.length, 'fechas');
    response.data.data.history.forEach(entry => {
      console.log(`  📅 ${entry.date}: ${entry.meal_count} comidas`);
    });
    return response.data.data;
  } catch (error) {
    console.error('❌ Error obteniendo historial:', error.response?.data || error.message);
    throw error;
  }
}

// Función para buscar por código de barras
async function searchByBarcode(barcode) {
  try {
    const response = await axios.get(`${BASE_URL}/barcode/search/${barcode}`);
    
    if (response.data.success) {
      console.log('✅ Código de barras encontrado:', response.data.data.food.name);
      return response.data.data.food;
    } else {
      console.log('❌ Código de barras no encontrado');
      return null;
    }
  } catch (error) {
    console.error('❌ Error buscando por código de barras:', error.response?.data || error.message);
    return null;
  }
}

// Función principal de prueba
async function runTests() {
  console.log('🚀 Iniciando pruebas de alimentos y comidas...\n');

  try {
    // 1. Login
    const token = await login();
    console.log('');

    // 2. Crear alimento de prueba
    const food = await createTestFood(token);
    console.log('');

    // 3. Buscar alimentos
    await searchFoods(token, 'manzana');
    console.log('');

    // 4. Buscar por código de barras
    await searchByBarcode('1234567890123');
    console.log('');

    // 5. Agregar comida
    const meal = await addMeal(token, food.id);
    console.log('');

    // 6. Obtener comidas del día
    const today = new Date().toISOString().split('T')[0];
    await getMealsByDate(token, today);
    console.log('');

    // 7. Obtener historial
    await getMealHistory(token);
    console.log('');

    console.log('🎉 ¡Todas las pruebas completadas exitosamente!');

  } catch (error) {
    console.error('💥 Error en las pruebas:', error.message);
    process.exit(1);
  }
}

// Ejecutar pruebas
runTests();
