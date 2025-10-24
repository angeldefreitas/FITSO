# Sistema de Monetización y Afiliados - Fitso

Este directorio contiene todo el sistema de monetización de la aplicación Fitso, incluyendo el sistema de afiliados, comisiones y gestión de suscripciones premium.

## 📁 Estructura del Directorio

```
monetization/
├── README.md                    # Este archivo
├── index.js                     # Exportaciones principales del módulo
├── config/
│   └── affiliate_schema.sql     # Esquema de base de datos para afiliados
├── controllers/
│   ├── affiliateController.js   # Controlador para gestión de afiliados
│   └── subscriptionController.js # Controlador para suscripciones (actualizado)
├── models/
│   ├── AffiliateCode.js         # Modelo para códigos de afiliado
│   ├── UserReferral.js          # Modelo para referencias de usuarios
│   └── AffiliateCommission.js   # Modelo para comisiones
├── routes/
│   ├── affiliates.js            # Rutas para sistema de afiliados
│   └── subscriptions.js         # Rutas para suscripciones
└── services/
    └── affiliateService.js      # Servicios para procesamiento de comisiones
```

## 🚀 Características del Sistema

### Sistema de Afiliados
- ✅ Creación y gestión de códigos de referencia únicos
- ✅ Tracking automático de usuarios referidos
- ✅ Comisiones automáticas por conversiones premium
- ✅ Comisiones recurrentes por renovaciones
- ✅ Estadísticas detalladas para afiliados
- ✅ Sistema de pagos integrado

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

### Suscripciones
- `POST /api/subscriptions/verify-receipt` - Verificar recibo
- `GET /api/subscriptions/status/:userId` - Estado de suscripción
- `POST /api/subscriptions/cancel` - Cancelar suscripción
- `GET /api/subscriptions/history/:userId` - Historial de suscripciones

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
