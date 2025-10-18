const WeightEntry = require('../models/WeightEntry');
const WaterEntry = require('../models/WaterEntry');
const CaloriesBurned = require('../models/CaloriesBurned');

// ==================== PESO ====================

// Obtener entradas de peso de una fecha específica
const getWeightEntriesByDate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.params;

    // Validar formato de fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }

    const entries = await WeightEntry.findByUserAndDate(userId, date);
    const totalWeight = entries.length > 0 ? entries[0].weight : null; // Peso más reciente del día

    res.json({
      success: true,
      data: {
        date: date,
        entries: entries.map(entry => entry.toPublicObject()),
        total_weight: totalWeight,
        entry_count: entries.length
      }
    });
  } catch (error) {
    console.error('Error obteniendo entradas de peso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener entradas de peso en un rango de fechas
const getWeightEntriesByDateRange = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate y endDate son requeridos'
      });
    }

    // Validar formato de fechas
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }

    const entries = await WeightEntry.findByUserAndDateRange(userId, startDate, endDate);
    const stats = await WeightEntry.getWeightStats(userId, startDate, endDate);

    res.json({
      success: true,
      data: {
        start_date: startDate,
        end_date: endDate,
        entries: entries.map(entry => entry.toPublicObject()),
        stats: stats
      }
    });
  } catch (error) {
    console.error('Error obteniendo entradas de peso por rango:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener historial de peso
const getWeightHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 30;

    const historyDates = await WeightEntry.getWeightHistoryDates(userId, limit);

    res.json({
      success: true,
      data: {
        history: historyDates,
        count: historyDates.length
      }
    });
  } catch (error) {
    console.error('Error obteniendo historial de peso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Agregar nueva entrada de peso
const addWeightEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { weight, entry_date, notes } = req.body;

    // Validar datos requeridos
    if (!weight || !entry_date) {
      return res.status(400).json({
        success: false,
        message: 'weight y entry_date son requeridos'
      });
    }

    // Validar formato de fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry_date)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }

    // Validar peso
    if (weight <= 0 || weight > 500) {
      return res.status(400).json({
        success: false,
        message: 'El peso debe estar entre 0.1 y 500 kg'
      });
    }

    const entry = await WeightEntry.create({
      user_id: userId,
      weight: parseFloat(weight),
      entry_date,
      notes: notes || null
    });

    res.status(201).json({
      success: true,
      message: 'Entrada de peso agregada exitosamente',
      data: entry.toPublicObject()
    });
  } catch (error) {
    console.error('Error agregando entrada de peso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener entrada de peso por ID
const getWeightEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const entry = await WeightEntry.findById(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entrada de peso no encontrada'
      });
    }

    // Verificar que la entrada pertenece al usuario
    if (entry.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a esta entrada'
      });
    }

    res.json({
      success: true,
      data: entry.toPublicObject()
    });
  } catch (error) {
    console.error('Error obteniendo entrada de peso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar entrada de peso
const updateWeightEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Verificar que la entrada existe y pertenece al usuario
    const existingEntry = await WeightEntry.findById(id);
    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: 'Entrada de peso no encontrada'
      });
    }

    if (existingEntry.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar esta entrada'
      });
    }

    // Validar peso si se está actualizando
    if (updateData.weight && (updateData.weight <= 0 || updateData.weight > 500)) {
      return res.status(400).json({
        success: false,
        message: 'El peso debe estar entre 0.1 y 500 kg'
      });
    }

    // Validar formato de fecha si se está actualizando
    if (updateData.entry_date && !/^\d{4}-\d{2}-\d{2}$/.test(updateData.entry_date)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }

    const entry = await WeightEntry.update(id, updateData);

    res.json({
      success: true,
      message: 'Entrada de peso actualizada exitosamente',
      data: entry.toPublicObject()
    });
  } catch (error) {
    console.error('Error actualizando entrada de peso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar entrada de peso
const deleteWeightEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que la entrada existe y pertenece al usuario
    const existingEntry = await WeightEntry.findById(id);
    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: 'Entrada de peso no encontrada'
      });
    }

    if (existingEntry.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta entrada'
      });
    }

    await WeightEntry.delete(id);

    res.json({
      success: true,
      message: 'Entrada de peso eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando entrada de peso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// ==================== AGUA ====================

// Obtener entradas de agua de una fecha específica
const getWaterEntriesByDate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.params;

    // Validar formato de fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }

    const entries = await WaterEntry.findByUserAndDate(userId, date);
    const totalMl = await WaterEntry.getTotalWaterForDate(userId, date);

    res.json({
      success: true,
      data: {
        date: date,
        entries: entries.map(entry => entry.toPublicObject()),
        total_ml: totalMl,
        total_liters: WaterEntry.mlToLiters(totalMl),
        entry_count: entries.length
      }
    });
  } catch (error) {
    console.error('Error obteniendo entradas de agua:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener entradas de agua en un rango de fechas
const getWaterEntriesByDateRange = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate y endDate son requeridos'
      });
    }

    // Validar formato de fechas
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }

    const entries = await WaterEntry.findByUserAndDateRange(userId, startDate, endDate);
    const stats = await WaterEntry.getWaterStats(userId, startDate, endDate);
    const averageDaily = await WaterEntry.getAverageDailyWater(userId, startDate, endDate);

    res.json({
      success: true,
      data: {
        start_date: startDate,
        end_date: endDate,
        entries: entries.map(entry => entry.toPublicObject()),
        stats: stats,
        average_daily: averageDaily
      }
    });
  } catch (error) {
    console.error('Error obteniendo entradas de agua por rango:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener historial de agua
const getWaterHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 30;

    const historyDates = await WaterEntry.getWaterHistoryDates(userId, limit);

    res.json({
      success: true,
      data: {
        history: historyDates,
        count: historyDates.length
      }
    });
  } catch (error) {
    console.error('Error obteniendo historial de agua:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Agregar nueva entrada de agua
const addWaterEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount_ml, entry_date } = req.body;

    // Validar datos requeridos
    if (!amount_ml || !entry_date) {
      return res.status(400).json({
        success: false,
        message: 'amount_ml y entry_date son requeridos'
      });
    }

    // Validar formato de fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry_date)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }

    // Validar cantidad de agua
    if (amount_ml <= 0 || amount_ml > 10000) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad de agua debe estar entre 1 y 10000 ml'
      });
    }

    const entry = await WaterEntry.create({
      user_id: userId,
      amount_ml: parseInt(amount_ml),
      entry_date
    });

    res.status(201).json({
      success: true,
      message: 'Entrada de agua agregada exitosamente',
      data: entry.toPublicObject()
    });
  } catch (error) {
    console.error('Error agregando entrada de agua:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener entrada de agua por ID
const getWaterEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const entry = await WaterEntry.findById(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entrada de agua no encontrada'
      });
    }

    // Verificar que la entrada pertenece al usuario
    if (entry.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a esta entrada'
      });
    }

    res.json({
      success: true,
      data: entry.toPublicObject()
    });
  } catch (error) {
    console.error('Error obteniendo entrada de agua:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar entrada de agua
const updateWaterEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Verificar que la entrada existe y pertenece al usuario
    const existingEntry = await WaterEntry.findById(id);
    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: 'Entrada de agua no encontrada'
      });
    }

    if (existingEntry.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar esta entrada'
      });
    }

    // Validar cantidad de agua si se está actualizando
    if (updateData.amount_ml && (updateData.amount_ml <= 0 || updateData.amount_ml > 10000)) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad de agua debe estar entre 1 y 10000 ml'
      });
    }

    // Validar formato de fecha si se está actualizando
    if (updateData.entry_date && !/^\d{4}-\d{2}-\d{2}$/.test(updateData.entry_date)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }

    const entry = await WaterEntry.update(id, updateData);

    res.json({
      success: true,
      message: 'Entrada de agua actualizada exitosamente',
      data: entry.toPublicObject()
    });
  } catch (error) {
    console.error('Error actualizando entrada de agua:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar entrada de agua
const deleteWaterEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que la entrada existe y pertenece al usuario
    const existingEntry = await WaterEntry.findById(id);
    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: 'Entrada de agua no encontrada'
      });
    }

    if (existingEntry.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta entrada'
      });
    }

    await WaterEntry.delete(id);

    res.json({
      success: true,
      message: 'Entrada de agua eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando entrada de agua:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// ==================== CALORÍAS QUEMADAS ====================

// Obtener entrada de calorías quemadas de una fecha específica
const getCaloriesBurnedByDate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.params;

    // Validar formato de fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }

    const entry = await CaloriesBurned.findByUserAndDate(userId, date);
    
    // Si no existe entrada, crear una con valores por defecto
    const caloriesData = entry || await CaloriesBurned.getOrCreateForDate(userId, date, 0, 750);

    res.json({
      success: true,
      data: {
        date: date,
        calories_burned: caloriesData.calories_burned,
        calories_goal: caloriesData.calories_goal,
        entry: caloriesData.toPublicObject()
      }
    });
  } catch (error) {
    console.error('Error obteniendo calorías quemadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener entradas de calorías quemadas en un rango de fechas
const getCaloriesBurnedByDateRange = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate y endDate son requeridos'
      });
    }

    // Validar formato de fechas
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }

    const entries = await CaloriesBurned.findByUserAndDateRange(userId, startDate, endDate);
    const stats = await CaloriesBurned.getCaloriesBurnedStats(userId, startDate, endDate);
    const averageDaily = await CaloriesBurned.getAverageDailyCaloriesBurned(userId, startDate, endDate);

    res.json({
      success: true,
      data: {
        start_date: startDate,
        end_date: endDate,
        entries: entries.map(entry => entry.toPublicObject()),
        stats: stats,
        average_daily: averageDaily
      }
    });
  } catch (error) {
    console.error('Error obteniendo calorías quemadas por rango:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener historial de calorías quemadas
const getCaloriesBurnedHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 30;

    const historyDates = await CaloriesBurned.getCaloriesBurnedHistoryDates(userId, limit);

    res.json({
      success: true,
      data: {
        history: historyDates,
        count: historyDates.length
      }
    });
  } catch (error) {
    console.error('Error obteniendo historial de calorías quemadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Agregar o actualizar entrada de calorías quemadas
const addCaloriesBurnedEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { calories_burned, calories_goal, entry_date } = req.body;

    // Validar datos requeridos
    if (calories_burned === undefined || !entry_date) {
      return res.status(400).json({
        success: false,
        message: 'calories_burned y entry_date son requeridos'
      });
    }

    // Validar formato de fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry_date)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }

    // Validar calorías quemadas
    if (calories_burned < 0 || calories_burned > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Las calorías quemadas deben estar entre 0 y 10000'
      });
    }

    // Validar objetivo de calorías si se proporciona
    if (calories_goal !== undefined && (calories_goal < 100 || calories_goal > 10000)) {
      return res.status(400).json({
        success: false,
        message: 'El objetivo de calorías debe estar entre 100 y 10000'
      });
    }

    const entry = await CaloriesBurned.create({
      user_id: userId,
      calories_burned: parseInt(calories_burned),
      calories_goal: calories_goal ? parseInt(calories_goal) : 750, // Valor por defecto
      entry_date
    });

    res.status(201).json({
      success: true,
      message: 'Entrada de calorías quemadas agregada exitosamente',
      data: entry.toPublicObject()
    });
  } catch (error) {
    console.error('Error agregando entrada de calorías quemadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener entrada de calorías quemadas por ID
const getCaloriesBurnedEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const entry = await CaloriesBurned.findById(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entrada de calorías quemadas no encontrada'
      });
    }

    // Verificar que la entrada pertenece al usuario
    if (entry.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a esta entrada'
      });
    }

    res.json({
      success: true,
      data: entry.toPublicObject()
    });
  } catch (error) {
    console.error('Error obteniendo entrada de calorías quemadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar entrada de calorías quemadas
const updateCaloriesBurnedEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Verificar que la entrada existe y pertenece al usuario
    const existingEntry = await CaloriesBurned.findById(id);
    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: 'Entrada de calorías quemadas no encontrada'
      });
    }

    if (existingEntry.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar esta entrada'
      });
    }

    // Validar calorías quemadas si se está actualizando
    if (updateData.calories_burned !== undefined && (updateData.calories_burned < 0 || updateData.calories_burned > 10000)) {
      return res.status(400).json({
        success: false,
        message: 'Las calorías quemadas deben estar entre 0 y 10000'
      });
    }

    // Validar objetivo de calorías si se está actualizando
    if (updateData.calories_goal !== undefined && (updateData.calories_goal < 100 || updateData.calories_goal > 10000)) {
      return res.status(400).json({
        success: false,
        message: 'El objetivo de calorías debe estar entre 100 y 10000'
      });
    }

    // Validar formato de fecha si se está actualizando
    if (updateData.entry_date && !/^\d{4}-\d{2}-\d{2}$/.test(updateData.entry_date)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }

    const entry = await CaloriesBurned.update(id, updateData);

    res.json({
      success: true,
      message: 'Entrada de calorías quemadas actualizada exitosamente',
      data: entry.toPublicObject()
    });
  } catch (error) {
    console.error('Error actualizando entrada de calorías quemadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar entrada de calorías quemadas
const deleteCaloriesBurnedEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que la entrada existe y pertenece al usuario
    const existingEntry = await CaloriesBurned.findById(id);
    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: 'Entrada de calorías quemadas no encontrada'
      });
    }

    if (existingEntry.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta entrada'
      });
    }

    await CaloriesBurned.delete(id);

    res.json({
      success: true,
      message: 'Entrada de calorías quemadas eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando entrada de calorías quemadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  // Peso
  getWeightEntriesByDate,
  getWeightEntriesByDateRange,
  getWeightHistory,
  addWeightEntry,
  getWeightEntryById,
  updateWeightEntry,
  deleteWeightEntry,
  
  // Agua
  getWaterEntriesByDate,
  getWaterEntriesByDateRange,
  getWaterHistory,
  addWaterEntry,
  getWaterEntryById,
  updateWaterEntry,
  deleteWaterEntry,
  
  // Calorías Quemadas
  getCaloriesBurnedByDate,
  getCaloriesBurnedByDateRange,
  getCaloriesBurnedHistory,
  addCaloriesBurnedEntry,
  getCaloriesBurnedEntryById,
  updateCaloriesBurnedEntry,
  deleteCaloriesBurnedEntry
};
