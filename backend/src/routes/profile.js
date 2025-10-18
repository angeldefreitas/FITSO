const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener perfil completo del usuario
router.get('/', profileController.getProfile);

// Actualizar datos biométricos
router.put('/biometric', validate(schemas.biometricData), profileController.updateBiometricData);

// Actualizar datos de metas
router.put('/goals', validate(schemas.goalsData), profileController.updateGoalsData);

// Actualizar perfil completo (flexible)
router.put('/', validate(schemas.profileData), profileController.updateProfile);

// Eliminar perfil
router.delete('/', profileController.deleteProfile);

module.exports = router;
