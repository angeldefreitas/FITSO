# Diagnóstico del Flujo de Compra

## Estado Actual

### ✅ Servidor Backend
- **Estado**: Corriendo (puerto 3000)
- **Health Check**: ✅ Funciona
- **URL**: http://localhost:3000

### ❌ Base de Datos
- **Estado**: Desconectada
- **Problema**: No puede conectarse a PostgreSQL
- **Causa**: Falta configuración de variables de entorno o credenciales incorrectas

### 📝 Usuario de Prueba
- **Email**: test9@gmail.com
- **Password**: 211299

## Flujo Esperado de Compra

### En la App (React Native)
1. Usuario selecciona plan (monthly/yearly) en `PremiumScreen.tsx`
2. Se llama a `purchaseSubscription(productId)` desde `PremiumContext`
3. El servicio `subscriptionService.purchaseSubscription()`:
   - Configura App User ID en RevenueCat
   - Obtiene ofertas de RevenueCat
   - Llama a `Purchases.purchasePackage()` (procesa pago real con Apple/Google)
   - Verifica entitlement activo
   - Actualiza estado premium local
   - Notifica al backend vía `/api/subscriptions/purchase`

### En RevenueCat
1. Procesa el pago con Apple/Google
2. Valida el recibo
3. Activa el entitlement premium
4. **Envía webhook** al backend: `POST /api/webhooks/revenuecat`
5. Evento tipo: `INITIAL_PURCHASE`

### En Render (Backend)
1. **Recibe notificación inmediata** desde la app: `POST /api/subscriptions/purchase`
   - Procesa comisión de afiliado si el usuario tiene código de referencia
   - Responde con éxito (pero no es crítico si falla)

2. **Recibe webhook de RevenueCat**: `POST /api/webhooks/revenuecat`
   - Valida autorización (Bearer token)
   - Procesa evento según tipo:
     - `INITIAL_PURCHASE`: Genera comisión de conversión
     - `RENEWAL`: Genera comisión recurrente
     - `CANCELLATION`: Marca suscripción como cancelada
     - `EXPIRATION`: Marca suscripción como expirada
   - Llama a `AffiliateService.processPremiumConversion()` o `processSubscriptionRenewal()`

3. **Procesamiento de Comisiones**:
   - Busca si el usuario tiene código de referencia en `user_referrals`
   - Obtiene el código de afiliado de `affiliate_codes`
   - Crea registro en `affiliate_commissions` con:
     - Monto de comisión calculado
     - Período de pago (mes actual)
     - Estado pendiente

## Para Simular Sin Base de Datos Real

El script `simulate-purchase.js` intenta:
1. ✅ Hacer login (requiere BD)
2. ✅ Verificar estado actual (requiere BD)
3. ✅ Simular compra desde app (requiere BD para guardar comisión)
4. ✅ Simular webhook RevenueCat (requiere BD para guardar comisión)

**Para que funcione necesitas**:
- Base de datos PostgreSQL conectada
- Usuario `test9@gmail.com` existe en la BD
- Variables de entorno configuradas (`.env` o en el sistema)

## Soluciones

### Opción 1: Conectar Base de Datos Local
```bash
# Crear archivo .env en backend/
DATABASE_URL=postgresql://usuario:password@localhost:5432/fitso_db
```

### Opción 2: Usar Base de Datos de Producción (Render)
```bash
# Obtener DATABASE_URL de Render dashboard y configurarla
export DATABASE_URL="postgresql://..."
```

### Opción 3: Verificar Logs del Servidor
```bash
# Ver qué errores está mostrando el servidor
cd backend
npm run dev
# Revisar mensajes de error de conexión
```

## Siguiente Paso

Una vez que la BD esté conectada, ejecutar:
```bash
cd backend
node scripts/simulate-purchase.js monthly
```

Esto simulará:
- Login del usuario test9@gmail.com
- Compra mensual de $2.99
- Procesamiento de webhook de RevenueCat
- Generación de comisión de afiliado (si aplica)

