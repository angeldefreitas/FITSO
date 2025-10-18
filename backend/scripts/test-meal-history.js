const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testMealHistory() {
  try {
    console.log('🧪 Probando historial de comidas...\n');

    // 1. Login
    console.log('1️⃣ Haciendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Error en login:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso');

    // 2. Crear un alimento de prueba
    console.log('\n2️⃣ Creando alimento de prueba...');
    const foodResponse = await axios.post(`${BASE_URL}/foods`, {
      name: 'Manzana',
      brand: 'Test Brand',
      barcode: '123456789',
      calories_per_100g: 52,
      protein_per_100g: 0.3,
      carbs_per_100g: 13.8,
      fat_per_100g: 0.2,
      fiber_per_100g: 2.4,
      sugar_per_100g: 10.4,
      sodium_per_100g: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!foodResponse.data.success) {
      console.log('❌ Error creando alimento:', foodResponse.data.message);
      return;
    }

    const foodId = foodResponse.data.data.id;
    console.log('✅ Alimento creado:', foodId);

    // 3. Agregar comidas para diferentes fechas
    console.log('\n3️⃣ Agregando comidas para diferentes fechas...');
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const meals = [
      {
        food_id: foodId,
        quantity: 150,
        meal_type: 'breakfast',
        entry_date: today
      },
      {
        food_id: foodId,
        quantity: 200,
        meal_type: 'lunch',
        entry_date: today
      },
      {
        food_id: foodId,
        quantity: 100,
        meal_type: 'dinner',
        entry_date: yesterday
      },
      {
        food_id: foodId,
        quantity: 120,
        meal_type: 'snack',
        entry_date: twoDaysAgo
      }
    ];

    for (const meal of meals) {
      const mealResponse = await axios.post(`${BASE_URL}/meals`, meal, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (mealResponse.data.success) {
        console.log(`✅ Comida agregada para ${meal.entry_date} (${meal.meal_type})`);
      } else {
        console.log(`❌ Error agregando comida para ${meal.entry_date}:`, mealResponse.data.message);
      }
    }

    // 4. Verificar historial de comidas
    console.log('\n4️⃣ Verificando historial de comidas...');
    const historyResponse = await axios.get(`${BASE_URL}/meals/history?limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (historyResponse.data.success) {
      console.log('✅ Historial obtenido:');
      console.log('📊 Total de días con comidas:', historyResponse.data.data.count);
      console.log('📅 Días con comidas:');
      historyResponse.data.data.history.forEach(day => {
        console.log(`   - ${day.date}: ${day.meal_count} comidas`);
      });
    } else {
      console.log('❌ Error obteniendo historial:', historyResponse.data.message);
    }

    // 5. Verificar comidas por fecha específica
    console.log('\n5️⃣ Verificando comidas por fecha específica...');
    const todayMealsResponse = await axios.get(`${BASE_URL}/meals/date/${today}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (todayMealsResponse.data.success) {
      console.log(`✅ Comidas de hoy (${today}):`);
      console.log('📊 Total de comidas:', todayMealsResponse.data.data.meals.length);
      console.log('🍽️ Comidas por tipo:');
      Object.entries(todayMealsResponse.data.data.grouped_meals).forEach(([type, meals]) => {
        if (meals.length > 0) {
          console.log(`   - ${type}: ${meals.length} comidas`);
        }
      });
      console.log('📈 Totales nutricionales:');
      console.log(`   - Calorías: ${todayMealsResponse.data.data.nutrition_totals.calories}`);
      console.log(`   - Proteína: ${todayMealsResponse.data.data.nutrition_totals.protein}g`);
      console.log(`   - Carbohidratos: ${todayMealsResponse.data.data.nutrition_totals.carbs}g`);
      console.log(`   - Grasa: ${todayMealsResponse.data.data.nutrition_totals.fat}g`);
    } else {
      console.log('❌ Error obteniendo comidas de hoy:', todayMealsResponse.data.message);
    }

    // 6. Verificar comidas por rango de fechas
    console.log('\n6️⃣ Verificando comidas por rango de fechas...');
    const rangeResponse = await axios.get(`${BASE_URL}/meals/range?startDate=${twoDaysAgo}&endDate=${today}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (rangeResponse.data.success) {
      console.log(`✅ Comidas del rango ${twoDaysAgo} a ${today}:`);
      console.log('📊 Total de comidas:', rangeResponse.data.data.meals.length);
      console.log('📅 Comidas por fecha:');
      const mealsByDate = {};
      rangeResponse.data.data.meals.forEach(meal => {
        if (!mealsByDate[meal.entry_date]) {
          mealsByDate[meal.entry_date] = 0;
        }
        mealsByDate[meal.entry_date]++;
      });
      Object.entries(mealsByDate).forEach(([date, count]) => {
        console.log(`   - ${date}: ${count} comidas`);
      });
    } else {
      console.log('❌ Error obteniendo comidas por rango:', rangeResponse.data.message);
    }

    // 7. Verificar estadísticas de comidas
    console.log('\n7️⃣ Verificando estadísticas de comidas...');
    const statsResponse = await axios.get(`${BASE_URL}/meals/stats?startDate=${twoDaysAgo}&endDate=${today}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (statsResponse.data.success) {
      console.log('✅ Estadísticas obtenidas:');
      console.log('📊 Estadísticas por tipo de comida:');
      statsResponse.data.data.stats.forEach(stat => {
        console.log(`   - ${stat.meal_type}: ${stat.count} comidas, cantidad total: ${stat.total_quantity}g, promedio: ${stat.avg_quantity}g`);
      });
    } else {
      console.log('❌ Error obteniendo estadísticas:', statsResponse.data.message);
    }

    console.log('\n🎉 Prueba de historial de comidas completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
  }
}

testMealHistory();
