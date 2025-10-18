const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener comidas por fecha
router.get('/date/:date', mealController.getMealsByDate);

// Agregar comida
router.post('/', mealController.addMeal);

// Agregar comida directamente (sin buscar en tabla foods)
router.post('/direct', mealController.addDirectMeal);

// Actualizar comida
router.put('/:id', mealController.updateMeal);

// Eliminar comida
router.delete('/:id', mealController.deleteMeal);

// Obtener historial de comidas
router.get('/history', mealController.getMealHistory);

// Agregar al historial
router.post('/history', mealController.addToHistory);

// Eliminar del historial
router.delete('/history/:id', mealController.removeFromHistory);

module.exports = router;
