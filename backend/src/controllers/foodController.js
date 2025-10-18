const Food = require('../models/Food');
const FoodEntry = require('../models/FoodEntry');

// Buscar alimentos por nombre o categoría
const searchFoods = async (req, res) => {
  try {
    const { query, category, limit = 20, offset = 0 } = req.query;
    const userId = req.user.id;

    const foods = await Food.search({
      query,
      category,
      limit: parseInt(limit),
      offset: parseInt(offset),
      userId
    });

    res.json({
      success: true,
      data: {
        foods,
        count: foods.length,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      }
    });
  } catch (error) {
    console.error('Error searching foods:', error);
    res.status(500).json({
      success: false,
      message: 'Error buscando alimentos'
    });
  }
};

// Obtener alimento por ID
const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await Food.findById(id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Alimento no encontrado'
      });
    }

    res.json({
      success: true,
      data: { food }
    });
  } catch (error) {
    console.error('Error getting food by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo alimento'
    });
  }
};

// Crear nuevo alimento (personalizado)
const createFood = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      brand,
      barcode,
      calories_per_100g,
      protein_per_100g,
      carbs_per_100g,
      fat_per_100g,
      fiber_per_100g = 0,
      sugar_per_100g = 0,
      sodium_per_100g = 0,
      category,
      subcategory,
      tags = []
    } = req.body;

    // Validar datos requeridos
    if (!name || !calories_per_100g) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y calorías son requeridos'
      });
    }

    const foodData = {
      name,
      brand,
      barcode,
      calories_per_100g: parseFloat(calories_per_100g),
      protein_per_100g: parseFloat(protein_per_100g) || 0,
      carbs_per_100g: parseFloat(carbs_per_100g) || 0,
      fat_per_100g: parseFloat(fat_per_100g) || 0,
      fiber_per_100g: parseFloat(fiber_per_100g) || 0,
      sugar_per_100g: parseFloat(sugar_per_100g) || 0,
      sodium_per_100g: parseFloat(sodium_per_100g) || 0,
      category,
      subcategory,
      tags,
      is_custom: true,
      created_by: userId
    };

    const food = await Food.create(foodData);

    res.status(201).json({
      success: true,
      data: { food },
      message: 'Alimento creado exitosamente'
    });
  } catch (error) {
    console.error('Error creating food:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando alimento'
    });
  }
};

// Actualizar alimento personalizado
const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Verificar que el alimento existe y pertenece al usuario
    const existingFood = await Food.findById(id);
    if (!existingFood) {
      return res.status(404).json({
        success: false,
        message: 'Alimento no encontrado'
      });
    }

    if (existingFood.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar este alimento'
      });
    }

    const food = await Food.update(id, updateData);

    res.json({
      success: true,
      data: { food },
      message: 'Alimento actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error updating food:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando alimento'
    });
  }
};

// Eliminar alimento personalizado
const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que el alimento existe y pertenece al usuario
    const existingFood = await Food.findById(id);
    if (!existingFood) {
      return res.status(404).json({
        success: false,
        message: 'Alimento no encontrado'
      });
    }

    if (existingFood.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este alimento'
      });
    }

    await Food.delete(id);

    res.json({
      success: true,
      message: 'Alimento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting food:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando alimento'
    });
  }
};

// Obtener categorías de alimentos
const getCategories = async (req, res) => {
  try {
    const categories = await Food.getCategories();
    
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo categorías'
    });
  }
};

// Obtener estadísticas de la base de datos de alimentos
const getFoodStats = async (req, res) => {
  try {
    const stats = await Food.getStats();
    
    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Error getting food stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas'
    });
  }
};

module.exports = {
  searchFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  getCategories,
  getFoodStats
};
