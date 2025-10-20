const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
// const rateLimit = require('express-rate-limit'); // DESHABILITADO PARA TESTING
require('dotenv').config();

const { testConnection, query } = require('./config/database');
const fs = require('fs');
const path = require('path');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const progressRoutes = require('./routes/progress');
const foodRoutes = require('./routes/foods');
const fitsoFoodRoutes = require('./routes/fitsoFoods');
const mealRoutes = require('./routes/meals');
const subscriptionRoutes = require('./routes/subscriptions');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());

// Configuración de CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8081',
  credentials: true
}));

// Rate limiting - DESHABILITADO PARA TESTING
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutos
//   max: 100, // máximo 100 requests por IP por ventana
//   message: {
//     success: false,
//     message: 'Demasiadas solicitudes, intenta más tarde'
//   }
// });
// app.use(limiter);

// Rate limiting más estricto para auth - DESHABILITADO PARA TESTING
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutos
//   max: 5, // máximo 5 intentos de login por IP por ventana
//   message: {
//     success: false,
//     message: 'Demasiados intentos de login, intenta más tarde'
//   }
// });

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/fitso-foods', fitsoFoodRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Ruta de salud
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    res.json({
      success: true,
      message: 'Servidor funcionando correctamente',
      timestamp: new Date().toISOString(),
      database: dbStatus ? 'conectado' : 'desconectado',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Fitso MVP',
    version: '1.0.0',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        profile: '/api/profile',
        progress: '/api/progress',
        foods: '/api/foods',
        fitsoFoods: '/api/fitso-foods',
        meals: '/api/meals',
        subscriptions: '/api/subscriptions'
      },
      progressEndpoints: {
        weight: '/api/progress/weight',
        water: '/api/progress/water',
        caloriesBurned: '/api/progress/calories-burned'
      }
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Función para verificar e inicializar la base de datos
const checkAndInitializeDatabase = async () => {
  try {
    // Verificar si la tabla users existe
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;
    
    const result = await query(checkTableQuery);
    const tableExists = result.rows[0].exists;
    
    if (!tableExists) {
      console.log('🏗️ Tabla users no existe, inicializando base de datos...');
      
      // Leer y ejecutar el esquema
      const schemaPath = path.join(__dirname, 'config/schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      await query(schema);
      console.log('✅ Base de datos inicializada correctamente');
    } else {
      console.log('✅ Base de datos ya inicializada');
    }
  } catch (error) {
    console.error('❌ Error verificando/inicializando base de datos:', error.message);
    throw error;
  }
};

// Iniciar servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    console.log('🔍 Probando conexión a la base de datos...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    // Verificar e inicializar base de datos si es necesario
    await checkAndInitializeDatabase();

    // Desplegar sistema FITSO Foods en producción
    if (process.env.NODE_ENV === 'production') {
      try {
        console.log('🚀 Ejecutando despliegue de sistema FITSO Foods...');
        const deployFitsoFoods = require('../scripts/deploy-fitso-foods');
        await deployFitsoFoods();
      } catch (error) {
        console.error('❌ Error desplegando sistema FITSO Foods:', error);
        // No salir del proceso, continuar con el servidor
      }
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
      console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8081'}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

// Manejar cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
});

// Iniciar el servidor
startServer();
