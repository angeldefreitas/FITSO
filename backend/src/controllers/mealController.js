const FoodEntry = require('../models/FoodEntry');
const Food = require('../models/Food');
const MealHistory = require('../models/MealHistory');

// Obtener comidas por fecha
const getMealsByDate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.params;

    const meals = await FoodEntry.getByDate(userId, date);

    // Agrupar por tipo de comida
    const mealsByType = {
      breakfast: meals.filter(meal => meal.meal_type === 'breakfast'),
      lunch: meals.filter(meal => meal.meal_type === 'lunch'),
      dinner: meals.filter(meal => meal.meal_type === 'dinner'),
      snack: meals.filter(meal => meal.meal_type === 'snack')
    };

    res.json({
      success: true,
      data: {
        meals: meals.map(meal => ({
          id: meal.id,
          food: {
            id: meal.food_id,
            name: meal.food_name,
            brand: meal.food_brand,
            category: meal.food_category,
            subcategory: meal.food_subcategory,
            tags: meal.food_tags,
            is_custom: false
          },
          quantity: meal.quantity,
          meal_type: meal.meal_type,
          entry_date: meal.entry_date,
          notes: null,
          nutrition: {
            calories: meal.nutrition_calories,
            protein: meal.nutrition_protein,
            carbs: meal.nutrition_carbs,
            fat: meal.nutrition_fat,
            fiber: meal.nutrition_fiber,
            sugar: meal.nutrition_sugar,
            sodium: meal.nutrition_sodium
          },
          created_at: meal.created_at
        })),
        mealsByType,
        stats: await FoodEntry.getNutritionStats(userId, date)
      }
    });
  } catch (error) {
    console.error('Error getting meals by date:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo comidas'
    });
  }
};

// Agregar comida
const addMeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      food_id,
      quantity,
      meal_type,
      entry_date,
      notes
    } = req.body;

    // Validar datos requeridos
    if (!food_id || !quantity || !meal_type || !entry_date) {
      return res.status(400).json({
        success: false,
        message: 'food_id, quantity, meal_type y entry_date son requeridos'
      });
    }

    // Verificar que el alimento existe
    const food = await Food.findById(food_id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Alimento no encontrado'
      });
    }

    const mealData = {
      user_id: userId,
      food_id,
      quantity: parseFloat(quantity),
      meal_type,
      entry_date,
      notes
    };

    const meal = await FoodEntry.create(mealData);

    // Agregar al historial de comidas
    await MealHistory.addToHistory({
      user_id: userId,
      name: `${food.name} (${quantity}g)`,
      calories: (food.calories_per_100g * quantity / 100),
      protein: (food.protein_per_100g * quantity / 100),
      carbs: (food.carbs_per_100g * quantity / 100),
      fat: (food.fat_per_100g * quantity / 100),
      fiber: (food.fiber_per_100g * quantity / 100),
      sugar: (food.sugar_per_100g * quantity / 100),
      sodium: (food.sodium_per_100g * quantity / 100),
      source: 'database',
      source_data: {
        food_id: food.id,
        food_name: food.name,
        quantity: quantity
      }
    });

    res.status(201).json({
      success: true,
      data: { meal },
      message: 'Comida agregada exitosamente'
    });
  } catch (error) {
    console.error('Error adding meal:', error);
    res.status(500).json({
      success: false,
      message: 'Error agregando comida'
    });
  }
};

// Actualizar comida
const updateMeal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Verificar que la comida existe y pertenece al usuario
    const existingMeal = await FoodEntry.findById(id);
    if (!existingMeal) {
      return res.status(404).json({
        success: false,
        message: 'Comida no encontrada'
      });
    }

    if (existingMeal.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar esta comida'
      });
    }

    const meal = await FoodEntry.update(id, updateData);

    res.json({
      success: true,
      data: { meal },
      message: 'Comida actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error updating meal:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando comida'
    });
  }
};

// Eliminar comida
const deleteMeal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que la comida existe y pertenece al usuario
    const existingMeal = await FoodEntry.findById(id);
    if (!existingMeal) {
      return res.status(404).json({
        success: false,
        message: 'Comida no encontrada'
      });
    }

    if (existingMeal.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta comida'
      });
    }

    await FoodEntry.delete(id);

    res.json({
      success: true,
      message: 'Comida eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando comida'
    });
  }
};

// Obtener historial de comidas
const getMealHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 30 } = req.query;

    const history = await MealHistory.getByUserId(userId, parseInt(limit));

    res.json({
      success: true,
      data: { history }
    });
  } catch (error) {
    console.error('Error getting meal history:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo historial de comidas'
    });
  }
};

// Agregar comida al historial (para reutilización)
const addToHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      calories,
      protein,
      carbs,
      fat,
      fiber = 0,
      sugar = 0,
      sodium = 0,
      source = 'manual',
      source_data
    } = req.body;

    // Validar datos requeridos
    if (!name || !calories) {
      return res.status(400).json({
        success: false,
        message: 'name y calories son requeridos'
      });
    }

    const historyData = {
      user_id: userId,
      name,
      calories: parseFloat(calories),
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      fiber: parseFloat(fiber) || 0,
      sugar: parseFloat(sugar) || 0,
      sodium: parseFloat(sodium) || 0,
      source,
      source_data
    };

    const historyItem = await MealHistory.addToHistory(historyData);

    res.status(201).json({
      success: true,
      data: { historyItem },
      message: 'Comida agregada al historial exitosamente'
    });
  } catch (error) {
    console.error('Error adding to meal history:', error);
    res.status(500).json({
      success: false,
      message: 'Error agregando al historial'
    });
  }
};

// Eliminar del historial
const removeFromHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que el elemento existe y pertenece al usuario
    const existingItem = await MealHistory.findById(id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Elemento del historial no encontrado'
      });
    }

    if (existingItem.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este elemento'
      });
    }

    await MealHistory.delete(id);

    res.json({
      success: true,
      message: 'Elemento eliminado del historial exitosamente'
    });
  } catch (error) {
    console.error('Error removing from meal history:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando del historial'
    });
  }
};

// Crear entrada de comida directamente con datos del frontend
const addDirectMeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      quantity,
      meal_type,
      entry_date,
      source,
      source_data
    } = req.body;

    console.log('🔄 Creando entrada directa:', { name, calories, protein, carbs, fat, quantity, meal_type, entry_date });

    // Crear entrada de comida directamente en food_entries
    const newEntry = await FoodEntry.createDirect({
      user_id: userId,
      name,
      calories,
      protein,
      carbs,
      fat,
      fiber: fiber || 0,
      sugar: sugar || 0,
      sodium: sodium || 0,
      quantity: quantity || 100,
      meal_type,
      entry_date,
      source: source || 'manual',
      source_data: source_data || null,
    });

    res.status(201).json({ success: true, data: newEntry });
  } catch (error) {
    console.error('Error adding direct meal:', error);
    res.status(500).json({ success: false, message: 'Error agregando comida directa' });
  }
};

module.exports = {
  getMealsByDate,
  addMeal,
  updateMeal,
  deleteMeal,
  getMealHistory,
  addToHistory,
  removeFromHistory,
  addDirectMeal
};
