const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar JWT
const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔐 [AUTH] Verificando token...');
    console.log('📝 [AUTH] Headers:', req.headers);
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('🔑 [AUTH] Token recibido:', token ? 'Sí' : 'No');

    if (!token) {
      console.log('❌ [AUTH] No se encontró token');
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Verificar el token
    console.log('🔍 [AUTH] Verificando token con JWT_SECRET...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ [AUTH] Token decodificado:', { userId: decoded.userId, exp: decoded.exp });
    
    // Buscar el usuario en la base de datos
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('❌ [AUTH] Usuario no encontrado en BD:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'Token inválido - usuario no encontrado'
      });
    }
    
    console.log('✅ [AUTH] Usuario encontrado:', { id: user.id, email: user.email });

    // Agregar el usuario al request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Error en autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware opcional para verificar token (no falla si no hay token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
      }
    }
    
          // Si no hay usuario autenticado, crear un usuario guest
          if (!req.user) {
            req.user = {
              id: '00000000-0000-0000-0000-000000000000', // UUID válido para guest
              email: 'guest@fitso.app',
              name: 'Usuario Invitado',
              is_verified: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            console.log('👤 Usuario guest creado:', req.user.id);
          }
    
    next();
  } catch (error) {
    // Si hay error con el token, crear usuario guest
    req.user = {
      id: '00000000-0000-0000-0000-000000000000', // UUID válido para guest
      email: 'guest@fitso.app',
      name: 'Usuario Invitado',
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    next();
  }
};

// Generar token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Generar refresh token (opcional, para implementar más adelante)
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

module.exports = {
  authenticateToken,
  optionalAuth,
  generateToken,
  generateRefreshToken
};
