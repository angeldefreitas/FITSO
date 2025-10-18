const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Rutas públicas
router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);
router.post('/forgot-password', validate(schemas.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(schemas.resetPassword), authController.resetPassword);
router.post('/verify-email', validate(schemas.verifyEmail), authController.verifyEmail);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validate(schemas.userProfile), authController.updateProfile);
router.put('/change-password', authenticateToken, validate(schemas.changePassword), authController.changePassword);
router.delete('/account', authenticateToken, authController.deleteAccount);

module.exports = router;
