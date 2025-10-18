const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// ==================== PESO ====================

// Obtener entradas de peso por fecha específica
router.get('/weight/date/:date', progressController.getWeightEntriesByDate);

// Obtener entradas de peso por rango de fechas
router.get('/weight/range', progressController.getWeightEntriesByDateRange);

// Obtener historial de peso
router.get('/weight/history', progressController.getWeightHistory);

// Obtener entrada de peso específica
router.get('/weight/:id', progressController.getWeightEntryById);

// Agregar nueva entrada de peso
router.post('/weight', validate(schemas.weightEntry), progressController.addWeightEntry);

// Actualizar entrada de peso
router.put('/weight/:id', validate(schemas.weightEntryUpdate), progressController.updateWeightEntry);

// Eliminar entrada de peso
router.delete('/weight/:id', progressController.deleteWeightEntry);

// ==================== AGUA ====================

// Obtener entradas de agua por fecha específica
router.get('/water/date/:date', progressController.getWaterEntriesByDate);

// Obtener entradas de agua por rango de fechas
router.get('/water/range', progressController.getWaterEntriesByDateRange);

// Obtener historial de agua
router.get('/water/history', progressController.getWaterHistory);

// Obtener entrada de agua específica
router.get('/water/:id', progressController.getWaterEntryById);

// Agregar nueva entrada de agua
router.post('/water', validate(schemas.waterEntry), progressController.addWaterEntry);

// Actualizar entrada de agua
router.put('/water/:id', validate(schemas.waterEntryUpdate), progressController.updateWaterEntry);

// Eliminar entrada de agua
router.delete('/water/:id', progressController.deleteWaterEntry);

// ==================== CALORÍAS QUEMADAS ====================

// Obtener calorías quemadas por fecha específica
router.get('/calories-burned/date/:date', progressController.getCaloriesBurnedByDate);

// Obtener calorías quemadas por rango de fechas
router.get('/calories-burned/range', progressController.getCaloriesBurnedByDateRange);

// Obtener historial de calorías quemadas
router.get('/calories-burned/history', progressController.getCaloriesBurnedHistory);

// Obtener entrada de calorías quemadas específica
router.get('/calories-burned/:id', progressController.getCaloriesBurnedEntryById);

// Agregar o actualizar entrada de calorías quemadas
router.post('/calories-burned', validate(schemas.caloriesBurnedEntry), progressController.addCaloriesBurnedEntry);

// Actualizar entrada de calorías quemadas
router.put('/calories-burned/:id', validate(schemas.caloriesBurnedEntryUpdate), progressController.updateCaloriesBurnedEntry);

// Eliminar entrada de calorías quemadas
router.delete('/calories-burned/:id', progressController.deleteCaloriesBurnedEntry);

module.exports = router;
