/**
 * Sistema de Monetización y Afiliados de Fitso
 * 
 * Este módulo contiene todo el sistema de monetización, incluyendo:
 * - Sistema de afiliados e influencers
 * - Comisiones automáticas
 * - Gestión de suscripciones premium
 * - Tracking de referidos y conversiones
 * - Servicios de pago (Stripe, Apple)
 * - Gestión de balances y pagos
 */

// Exportar todos los controladores
const affiliateController = require('./controllers/affiliateController');
const subscriptionController = require('./controllers/subscriptionController');
const paymentController = require('./controllers/paymentController');
const balanceController = require('./controllers/balanceController');
const simpleAffiliateDashboardController = require('./controllers/simpleAffiliateDashboardController');

// Exportar todos los modelos
const AffiliateCode = require('./models/AffiliateCode');
const UserReferral = require('./models/UserReferral');
const AffiliateCommission = require('./models/AffiliateCommission');

// Exportar todos los servicios
const AffiliateService = require('./services/affiliateService');
const paymentServices = require('./services/payment');

// Exportar todas las rutas
const affiliateRoutes = require('./routes/affiliates');
const subscriptionRoutes = require('./routes/subscriptions');
const paymentRoutes = require('./routes/payments');
const balanceRoutes = require('./routes/balance');
const simpleAffiliateDashboardRoutes = require('./routes/simpleAffiliateDashboard');

module.exports = {
  // Controladores
  controllers: {
    affiliateController,
    subscriptionController,
    paymentController,
    balanceController
  },
  
  // Modelos
  models: {
    AffiliateCode,
    UserReferral,
    AffiliateCommission
  },
  
  // Servicios
  services: {
    AffiliateService,
    ...paymentServices
  },
  
  // Rutas
  routes: {
    affiliateRoutes,
    subscriptionRoutes,
    paymentRoutes,
    balanceRoutes,
    simpleAffiliateDashboardRoutes
  }
};
