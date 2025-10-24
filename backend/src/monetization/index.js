/**
 * Sistema de Monetización y Afiliados de Fitso
 * 
 * Este módulo contiene todo el sistema de monetización, incluyendo:
 * - Sistema de afiliados e influencers
 * - Comisiones automáticas
 * - Gestión de suscripciones premium
 * - Tracking de referidos y conversiones
 */

// Exportar todos los controladores
const affiliateController = require('./controllers/affiliateController');
const subscriptionController = require('./controllers/subscriptionController');

// Exportar todos los modelos
const AffiliateCode = require('./models/AffiliateCode');
const UserReferral = require('./models/UserReferral');
const AffiliateCommission = require('./models/AffiliateCommission');

// Exportar todos los servicios
const AffiliateService = require('./services/affiliateService');

// Exportar todas las rutas
const affiliateRoutes = require('./routes/affiliates');
const subscriptionRoutes = require('./routes/subscriptions');

module.exports = {
  // Controladores
  controllers: {
    affiliateController,
    subscriptionController
  },
  
  // Modelos
  models: {
    AffiliateCode,
    UserReferral,
    AffiliateCommission
  },
  
  // Servicios
  services: {
    AffiliateService
  },
  
  // Rutas
  routes: {
    affiliateRoutes,
    subscriptionRoutes
  }
};
