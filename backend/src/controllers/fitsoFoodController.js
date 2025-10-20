const FitsoFood = require('../models/FitsoFood');

// Buscar alimentos FITSO con traducciones
const searchFitsoFoods = async (req, res) => {
  try {
    const { query, category, limit = 20, offset = 0, lang } = req.query;
    const userId = req.user.id;

    const foods = await FitsoFood.search({
      query,
      category,
      limit: parseInt(limit),
      offset: parseInt(offset),
      userId,
      lang: lang || req.headers['accept-language']?.split(',')[0]?.slice(0,2) || 'es'
    });

    res.json({
      success: true,
      data: {
        foods,
        count: foods.length,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset)
        },
        language: lang || req.headers['accept-language']?.split(',')[0]?.slice(0,2) || 'es'
      }
    });
  } catch (error) {
    console.error('Error searching fitso foods:', error);
    res.status(500).json({
      success: false,
      message: 'Error buscando alimentos FITSO'
    });
  }
};

// Obtener alimento FITSO por ID
const getFitsoFoodById = async (req, res) => {
  try {
    const { id } = req.params;
    const { lang } = req.query;
    
    const food = await FitsoFood.findById(id, lang || req.headers['accept-language']?.split(',')[0]?.slice(0,2) || 'es');

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Alimento FITSO no encontrado'
      });
    }

    res.json({
      success: true,
      data: { 
        food,
        language: lang || req.headers['accept-language']?.split(',')[0]?.slice(0,2) || 'es'
      }
    });
  } catch (error) {
    console.error('Error getting fitso food by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo alimento FITSO'
    });
  }
};

// Buscar alimento FITSO por código de barras
const getFitsoFoodByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const { lang } = req.query;
    
    const food = await FitsoFood.findByBarcode(barcode, lang || req.headers['accept-language']?.split(',')[0]?.slice(0,2) || 'es');

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Alimento FITSO no encontrado para este código de barras'
      });
    }

    res.json({
      success: true,
      data: { 
        food,
        language: lang || req.headers['accept-language']?.split(',')[0]?.slice(0,2) || 'es'
      }
    });
  } catch (error) {
    console.error('Error getting fitso food by barcode:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo alimento FITSO por código de barras'
    });
  }
};

// Obtener categorías de alimentos FITSO
const getFitsoCategories = async (req, res) => {
  try {
    const { lang } = req.query;
    const categories = await FitsoFood.getCategories(lang || req.headers['accept-language']?.split(',')[0]?.slice(0,2) || 'es');
    
    res.json({
      success: true,
      data: { 
        categories,
        language: lang || req.headers['accept-language']?.split(',')[0]?.slice(0,2) || 'es'
      }
    });
  } catch (error) {
    console.error('Error getting fitso categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo categorías FITSO'
    });
  }
};

// Obtener estadísticas de alimentos FITSO
const getFitsoFoodStats = async (req, res) => {
  try {
    const stats = await FitsoFood.getStats();
    
    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Error getting fitso food stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas FITSO'
    });
  }
};

module.exports = {
  searchFitsoFoods,
  getFitsoFoodById,
  getFitsoFoodByBarcode,
  getFitsoCategories,
  getFitsoFoodStats
};
