# Configuración de RevenueCat

## Información de tu Proyecto

### Entitlement
- **Nombre**: Fitso Premium
- **ID**: `entl0b12b2e363`

### Productos de Suscripción
- **Mensual**: `Fitso_Premium_Monthly`
- **Anual**: `Fitso_Premium_Yearly`

### API Keys (Verificar en tu dashboard)
- **iOS Producción**: `sk_ORwbKeMvzBapPnHcbzlxbGeulgeAi`
- **iOS Sandbox**: `test_oHHhNQjFIioQxDmtSBjCJzqpRRT`
- **Android Producción**: `sk_ORwbKeMvzBapPnHcbzlxbGeulgeAi` (¿Es correcta?)
- **Android Sandbox**: (¿Tienes una diferente?)

## Configuración Actual

La configuración está en `src/services/subscriptionService.ts`:

```typescript
// Entitlement ID
const PREMIUM_ENTITLEMENT = 'entl0b12b2e363';

// Productos
const SUBSCRIPTION_PRODUCTS = [
  'Fitso_Premium_Monthly',
  'Fitso_Premium_Yearly',
];

// API Keys
const REVENUECAT_API_KEY = {
  ios: 'sk_ORwbKeMvzBapPnHcbzlxbGeulgeAi',
  android: 'sk_ORwbKeMvzBapPnHcbzlxbGeulgeAi', // ¿Es correcta?
  // ...
};
```

## Verificaciones Necesarias

1. **API Keys**: Verifica que las API keys sean correctas en tu dashboard de RevenueCat
2. **Productos**: Confirma que los IDs de productos coincidan exactamente
3. **Entitlement**: El ID `entl0b12b2e363` debe coincidir con tu entitlement "Fitso Premium"
4. **Webhook**: Debe estar configurado apuntando a `https://fitso.onrender.com/api/webhooks/revenuecat`

## Testing

- **Expo Go**: RevenueCat está desactivado (funcionalidad limitada)
- **Builds Nativos**: RevenueCat funcionará con las API keys de producción
- **Sandbox**: Usa las API keys de sandbox para testing

## Configuración del Webhook

**⚠️ IMPORTANTE PARA APPLE REVIEW:**

El webhook de RevenueCat DEBE estar configurado para que las compras funcionen correctamente durante la revisión de Apple.

Ver la guía completa en: `REVENUECAT_WEBHOOK_SETUP.md`

### Configuración Rápida:

1. Ve a RevenueCat Dashboard → Project Settings → Integrations → Webhooks
2. Agrega webhook: `https://fitso.onrender.com/api/webhooks/revenuecat`
3. Selecciona eventos: `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `EXPIRATION`, `BILLING_ISSUE`
4. Copia el Auth Token
5. Configúralo en Render como variable de entorno: `REVENUECAT_WEBHOOK_SECRET`
6. Redeploy el servicio

## Próximos Pasos

1. Verifica las API keys en tu dashboard de RevenueCat
2. Confirma que los IDs de productos sean correctos
3. **Configura el webhook** (VER `REVENUECAT_WEBHOOK_SETUP.md`)
4. Prueba las compras en un build nativo (no en Expo Go)
5. Verifica que los eventos lleguen al servidor en los logs
