const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Buscar alimentos
router.get('/search', foodController.searchFoods);

// Obtener alimento por ID
router.get('/:id', foodController.getFoodById);

// Crear alimento personalizado
router.post('/', foodController.createFood);

// Actualizar alimento personalizado
router.put('/:id', foodController.updateFood);

// Eliminar alimento personalizado
router.delete('/:id', foodController.deleteFood);

// Obtener categorías
router.get('/categories/list', foodController.getCategories);

// Obtener estadísticas
router.get('/stats/overview', foodController.getFoodStats);

module.exports = router;
