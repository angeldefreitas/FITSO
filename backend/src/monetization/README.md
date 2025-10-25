# Sistema de Monetización y Afiliados - Fitso

Este directorio contiene **TODO** el sistema de monetización de la aplicación Fitso, centralizado en una sola carpeta para facilitar el mantenimiento y la escalabilidad.

## 📁 Estructura del Directorio

```
monetization/
├── README.md                    # Este archivo
├── index.js                     # Exportaciones principales del módulo
├── config/
│   └── affiliate_schema.sql     # Esquema de base de datos para afiliados
├── controllers/                 # Controladores de la API
│   ├── affiliateController.js   # Controlador principal de afiliados
│   ├── simpleAffiliateController.js # Controlador simplificado
│   ├── subscriptionController.js # Controlador para suscripciones
│   ├── paymentController.js     # Controlador para pagos
│   └── balanceController.js     # Controlador para balances
├── models/                      # Modelos de base de datos
│   ├── AffiliateCode.js         # Modelo para códigos de afiliado
│   ├── UserReferral.js          # Modelo para referencias de usuarios
│   └── AffiliateCommission.js   # Modelo para comisiones
├── routes/                      # Definición de rutas
│   ├── affiliates.js            # Rutas para sistema de afiliados
│   ├── subscriptions.js         # Rutas para suscripciones
│   ├── payments.js              # Rutas para pagos
│   └── balance.js               # Rutas para balances
└── services/                    # Lógica de negocio
    ├── affiliateService.js      # Servicios para procesamiento de comisiones
    └── payment/                 # Servicios de pago centralizados
        ├── index.js             # Exportaciones de servicios de pago
        ├── stripeService.js     # Servicio de Stripe
        ├── stripeWebhookService.js # Webhooks de Stripe
        └── appleReceiptService.js # Validación de recibos de Apple
```

## 🚀 Características del Sistema

### Sistema de Afiliados
- ✅ Creación y gestión de códigos de referencia únicos
- ✅ Tracking automático de usuarios referidos
- ✅ Comisiones automáticas por conversiones premium
- ✅ Comisiones recurrentes por renovaciones
- ✅ Estadísticas detalladas para afiliados
- ✅ Dashboard en tiempo real
- ✅ Sistema de pagos integrado

### Servicios de Pago
- ✅ **Stripe**: Pagos y transferencias automáticas
- ✅ **Apple Store**: Validación de recibos
- ✅ **Webhooks**: Procesamiento automático de eventos
- ✅ **Balances**: Tracking de comisiones pendientes y pagadas

### Sistema de Suscripciones
- ✅ Integración con Apple Store
- ✅ Verificación automática de recibos
- ✅ Tracking de renovaciones
- ✅ Integración automática con sistema de afiliados

## 📊 Flujo del Sistema

1. **Creación de Códigos**: Los influencers reciben códigos únicos (ej: "FITNESS_GURU")
2. **Registro de Usuario**: El usuario ingresa el código después de sus datos biométricos
3. **Conversión Premium**: Cuando paga premium, se genera la primera comisión automáticamente
4. **Comisiones Recurrentes**: Por cada renovación mensual/anual, nueva comisión
5. **Pagos**: Los afiliados pueden ver sus ganancias y recibir pagos

## 🛠️ Instalación y Configuración

### 1. Inicializar Base de Datos
```bash
cd backend
node scripts/init-affiliate-system.js
```

### 2. Crear Código de Afiliado
```bash
POST /api/affiliates/codes
{
  "affiliate_name": "FITNESS_INFLUENCER",
  "email": "influencer@example.com",
  "commission_percentage": 30
}
```

### 3. Registrar Código de Referencia (Frontend)
```bash
POST /api/affiliates/referral
{
  "referral_code": "FITNESS_INFLUENCER"
}
```

## 📈 API Endpoints

### Afiliados
- `POST /api/affiliates/codes` - Crear código de afiliado
- `GET /api/affiliates/codes` - Listar códigos activos
- `POST /api/affiliates/referral` - Registrar código de referencia
- `GET /api/affiliates/my-referral` - Obtener mi referencia
- `GET /api/affiliates/stats/:code` - Estadísticas del afiliado
- `GET /api/affiliates/commissions/:code` - Comisiones del afiliado
- `POST /api/affiliates/payments` - Procesar pagos
- `GET /api/affiliates/simple-dashboard` - Dashboard simplificado
- `PUT /api/affiliates/codes/:code/commission` - Actualizar comisión

### Suscripciones
- `POST /api/subscriptions/verify-receipt` - Verificar recibo
- `GET /api/subscriptions/status/:userId` - Estado de suscripción
- `POST /api/subscriptions/cancel` - Cancelar suscripción
- `GET /api/subscriptions/history/:userId` - Historial de suscripciones

### Pagos
- `POST /api/affiliates/create-stripe-account` - Crear cuenta Stripe
- `POST /api/affiliates/process-payment` - Procesar pago
- `GET /api/affiliates/payment-history` - Historial de pagos

### Balances
- `GET /api/affiliates/balance` - Obtener balance
- `GET /api/affiliates/pending-payments` - Pagos pendientes

## 💰 Configuración de Comisiones

- **Por defecto**: 30% de comisión
- **Configurable**: Cada afiliado puede tener su propio porcentaje
- **Recurrente**: Comisiones por cada renovación mientras el usuario mantenga premium
- **Automático**: Procesamiento automático sin intervención manual

## 🔧 Desarrollo

### Agregar Nueva Funcionalidad
1. Crear modelo en `models/`
2. Agregar lógica en `controllers/`
3. Crear rutas en `routes/`
4. Actualizar `index.js` con las nuevas exportaciones

### Testing
```bash
# Probar endpoints de afiliados
curl -X POST http://localhost:3000/api/affiliates/codes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"affiliate_name": "TEST_INFLUENCER", "commission_percentage": 25}'
```

## 📝 Notas Importantes

- Todas las rutas requieren autenticación
- Los códigos de afiliado son únicos y se generan automáticamente
- Las comisiones se procesan automáticamente al verificar suscripciones
- El sistema es completamente escalable y soporta miles de afiliados
- Todos los datos están auditados con timestamps de creación y actualización

## 🎯 Ventajas de la Estructura Centralizada

✅ **Mantenimiento**: Todo el código de monetización en un solo lugar
✅ **Escalabilidad**: Fácil agregar nuevas funcionalidades
✅ **Testing**: Tests centralizados y organizados
✅ **Documentación**: Un solo lugar para documentar el sistema
✅ **Deploy**: Despliegue independiente del sistema de monetización
✅ **Debugging**: Más fácil encontrar y solucionar problemas