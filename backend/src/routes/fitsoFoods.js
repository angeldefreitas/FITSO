const express = require('express');
const router = express.Router();
const fitsoFoodController = require('../controllers/fitsoFoodController');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Buscar alimentos FITSO con traducciones
router.get('/search', fitsoFoodController.searchFitsoFoods);

// Obtener alimentos aleatorios para pantalla inicial
router.get('/random', fitsoFoodController.getRandomFitsoFoods);

// Obtener alimento FITSO por ID
router.get('/:id', fitsoFoodController.getFitsoFoodById);

// Buscar alimento FITSO por código de barras
router.get('/barcode/:barcode', fitsoFoodController.getFitsoFoodByBarcode);

// Obtener categorías FITSO
router.get('/categories/list', fitsoFoodController.getFitsoCategories);

// Obtener estadísticas FITSO
router.get('/stats/overview', fitsoFoodController.getFitsoFoodStats);

module.exports = router;
