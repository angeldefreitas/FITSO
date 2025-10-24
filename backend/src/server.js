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
const { routes } = require('./monetization');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());

// Middleware para manejar preflight requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }
  next();
});

// Configuración de CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:8081',
    'http://localhost:8081',
    'http://192.168.1.100:8081', // IP local común
    'http://192.168.0.100:8081', // IP local común
    'exp://192.168.1.100:8081',  // Expo URL
    'exp://192.168.0.100:8081',  // Expo URL
    /^exp:\/\/.*\.tunnel\.expo\.dev$/, // Expo tunnels
    /^https:\/\/.*\.expo\.dev$/ // Expo web
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
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
app.use('/api/subscriptions', routes.subscriptionRoutes);
app.use('/api/affiliates', routes.affiliateRoutes);

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

// Middleware de logging simple para debugging
app.use((req, res, next) => {
  if (req.path.includes('/api/affiliates')) {
    console.log(`📥 [AFFILIATES] ${req.method} ${req.path} - ${new Date().toISOString()}`);
  }
  next();
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
        subscriptions: '/api/subscriptions',
        affiliates: '/api/affiliates'
      },
      progressEndpoints: {
        weight: '/api/progress/weight',
        water: '/api/progress/water',
        caloriesBurned: '/api/progress/calories-burned'
      }
  });
});

// Endpoint temporal para verificar tablas existentes
app.get('/api/check-tables', async (req, res) => {
  try {
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tables = result.rows.map(row => row.table_name);
    
    res.json({
      success: true,
      tables: tables,
      count: tables.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint temporal para crear tablas de afiliados
app.post('/api/migrate-create-affiliate-tables', async (req, res) => {
  try {
    console.log('🔄 Creando tablas de afiliados...');
    
    // Crear tabla affiliate_codes (simplificada)
    await query(`
      CREATE TABLE IF NOT EXISTS affiliate_codes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          code VARCHAR(50) UNIQUE NOT NULL,
          affiliate_name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 30.00,
          is_active BOOLEAN DEFAULT TRUE,
          created_by UUID REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla affiliate_codes creada');
    
    // Crear tabla user_referrals (simplificada)
    await query(`
      CREATE TABLE IF NOT EXISTS user_referrals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          affiliate_code VARCHAR(50) REFERENCES affiliate_codes(code) ON DELETE SET NULL,
          referral_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_premium BOOLEAN DEFAULT FALSE,
          premium_conversion_date TIMESTAMP,
          UNIQUE(user_id)
      )
    `);
    console.log('✅ Tabla user_referrals creada');
    
    // Crear índices
    await query('CREATE INDEX IF NOT EXISTS idx_affiliate_codes_code ON affiliate_codes(code)');
    await query('CREATE INDEX IF NOT EXISTS idx_affiliate_codes_active ON affiliate_codes(is_active)');
    await query('CREATE INDEX IF NOT EXISTS idx_user_referrals_user_id ON user_referrals(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_user_referrals_affiliate_code ON user_referrals(affiliate_code)');
    console.log('✅ Índices creados');
    
    res.json({
      success: true,
      message: 'Tablas de afiliados creadas exitosamente',
      tables: ['affiliate_codes', 'user_referrals']
    });
  } catch (error) {
    console.error('❌ Error creando tablas de afiliados:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando tablas de afiliados',
      error: error.message
    });
  }
});

// Endpoint temporal para agregar columna is_affiliate
app.post('/api/migrate-add-affiliate-column', async (req, res) => {
  try {
    console.log('🔄 Ejecutando migración para agregar columna is_affiliate...');
    
    // Agregar columna is_affiliate
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_affiliate BOOLEAN DEFAULT FALSE');
    console.log('✅ Columna is_affiliate agregada');
    
    // Crear índice
    await query('CREATE INDEX IF NOT EXISTS idx_users_is_affiliate ON users(is_affiliate)');
    console.log('✅ Índice creado');
    
    res.json({
      success: true,
      message: 'Migración completada exitosamente',
      changes: ['Columna is_affiliate agregada', 'Índice creado']
    });
  } catch (error) {
    console.error('❌ Error en migración:', error);
    res.status(500).json({
      success: false,
      message: 'Error en migración',
      error: error.message
    });
  }
});

// Endpoint simple para crear afiliados (sin autenticación para testing)
app.post('/api/create-affiliate-simple', async (req, res) => {
  try {
    console.log('🔍 [SIMPLE] Creando afiliado...');
    console.log('📝 [SIMPLE] Body:', req.body);
    
    const { email, name, password, referralCode, commissionPercentage = 30.0 } = req.body;

    // Validaciones
    if (!email || !name || !password || !referralCode) {
      return res.status(400).json({
        success: false,
        message: 'Email, nombre, contraseña y código de referido son requeridos'
      });
    }

    // Usar el modelo User que ya funciona
    const User = require('./models/User');
    const AffiliateCode = require('./monetization/models/AffiliateCode');

    // Verificar si el email ya existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log('⚠️ [SIMPLE] Usuario ya existe, actualizando...');
      await User.updateAffiliateStatus(existingUser.id, true);
      console.log('✅ [SIMPLE] Usuario actualizado como afiliado');
    } else {
      console.log('👤 [SIMPLE] Creando nuevo usuario...');
      const user = await User.create({
        email,
        name,
        password
      });
      console.log('✅ [SIMPLE] Usuario creado:', user.id);
      
      // Marcar como afiliado
      await User.updateAffiliateStatus(user.id, true);
      console.log('✅ [SIMPLE] Usuario marcado como afiliado');
    }

    // Verificar si el código ya existe
    const existingCode = await AffiliateCode.findByCode(referralCode);
    if (existingCode) {
      console.log('⚠️ [SIMPLE] Código ya existe:', existingCode.id);
    } else {
      console.log('🎫 [SIMPLE] Creando código de afiliado...');
      const user = await User.findByEmail(email);
      
      // Crear código de afiliado directamente sin usar la función generate_affiliate_code
      const insertQuery = `
        INSERT INTO affiliate_codes (code, affiliate_name, email, commission_percentage, created_by)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const values = [referralCode, name, email, parseFloat(commissionPercentage), user.id];
      const result = await query(insertQuery, values);
      console.log('✅ [SIMPLE] Código de afiliado creado:', result.rows[0].id);
    }

    res.status(201).json({
      success: true,
      message: 'Afiliado creado exitosamente',
      data: {
        email,
        name,
        referralCode,
        commissionPercentage: parseFloat(commissionPercentage)
      }
    });

  } catch (error) {
    console.error('❌ [SIMPLE] Error creando afiliado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
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
        console.log('📅 Timestamp:', new Date().toISOString());
        const deployFitsoFoods = require('../scripts/deploy-fitso-foods');
        await deployFitsoFoods();
        console.log('✅ Sistema FITSO Foods desplegado exitosamente');
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
