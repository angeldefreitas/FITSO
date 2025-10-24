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

## Testing

- **Expo Go**: RevenueCat está desactivado (funcionalidad limitada)
- **Builds Nativos**: RevenueCat funcionará con las API keys de producción
- **Sandbox**: Usa las API keys de sandbox para testing

## Próximos Pasos

1. Verifica las API keys en tu dashboard de RevenueCat
2. Confirma que los IDs de productos sean correctos
3. Prueba las compras en un build nativo (no en Expo Go)
