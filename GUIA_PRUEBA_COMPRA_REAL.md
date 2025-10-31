# 🧪 Guía para Probar Compra Real y Ver Logs

## 📋 Requisitos Previos

✅ **Servidor en Render funcionando**: https://fitso.onrender.com
✅ **Webhook configurado en RevenueCat**: https://fitso.onrender.com/api/webhooks/revenuecat
✅ **Usuario de prueba creado**: test9@gmail.com / 211299
✅ **Base de datos conectada**

## 🚀 Pasos para Probar

### 1. Preparar el Entorno

#### A. Verificar Servidor en Render
```bash
# Verificar que el servidor responde
curl https://fitso.onrender.com/api/health

# Debe responder:
# {
#   "success": true,
#   "database": "conectado",
#   "environment": "production"
# }
```

#### B. Verificar Webhook en RevenueCat
1. Ve a: https://app.revenuecat.com
2. Navega a: **FITSO** → **Integrations** → **Webhooks**
3. Verifica que el webhook esté configurado:
   - **URL**: `https://fitso.onrender.com/api/webhooks/revenuecat`
   - **Environment**: Both Production and Sandbox
   - **Events**: Initial purchase, Renewal (marcados)
   - **Authorization header**: Configurado (si aplica)

### 2. Probar Webhook con Script

```bash
cd backend
BACKEND_URL=https://fitso.onrender.com node scripts/test-revenuecat-webhook-real.js
```

Este script:
- ✅ Verifica que el servidor esté disponible
- ✅ Envía un webhook realista de RevenueCat
- ✅ Simula un evento `INITIAL_PURCHASE`
- ✅ Muestra la respuesta del servidor

### 3. Ver Logs en Render

#### A. Acceder a Logs
1. Ve a: https://dashboard.render.com
2. Selecciona el servicio: **fitso-backend**
3. Ve a la pestaña: **Logs**

#### B. Buscar Logs del Webhook
Busca estas líneas en los logs:

```
🔍 [REVENUECAT] Validando webhook...
📨 [REVENUECAT] Webhook recibido
📋 [REVENUECAT] Payload: {...}
📨 [REVENUECAT] Tipo de evento: INITIAL_PURCHASE
👤 [REVENUECAT] Usuario: 36913c9a-fad3-4692-a6d9-598b4fc9763c
📦 [REVENUECAT] Producto: Fitso_Premium_Monthly
💰 [REVENUECAT] Precio: 2.99 USD
🎉 [REVENUECAT] Compra inicial detectada - procesando...
✅ [REVENUECAT] Usuario encontrado: test9@gmail.com Test User 9
✅ [REVENUECAT] Comisión inicial generada: $X.XX
✅ [REVENUECAT] Compra inicial procesada correctamente
```

### 4. Probar desde la App Móvil

#### A. Configuración en la App
1. Asegúrate de que la app esté usando el **App User ID** correcto
2. El App User ID debe ser el mismo que el ID del usuario en la BD
3. En `subscriptionService.ts`, línea 203: `await Purchases.logIn(userId);`

#### B. Flujo de Compra Real
1. **Abrir la app** en TestFlight o desarrollo
2. **Iniciar sesión** con: `test9@gmail.com` / `211299`
3. **Ir a pantalla Premium** (donde se muestran los planes)
4. **Seleccionar plan** (Monthly o Yearly)
5. **Tocar "Subscribe Now"**
6. **Autorizar compra** en el diálogo de Apple/Google

#### C. Qué Debería Pasar
1. **En la App**:
   - Diálogo de compra de Apple/Google
   - Procesamiento de pago
   - Mensaje de éxito
   - Estado premium activado

2. **En RevenueCat Dashboard**:
   - Ve a: **Customers** → Buscar por `test9@gmail.com` o User ID
   - Deberías ver:
     - ✅ Entitlement "Fitso Premium" activo
     - ✅ Suscripción activa
     - ✅ Transacción registrada

3. **En Render Logs**:
   - Webhook recibido de RevenueCat
   - Procesamiento de comisión
   - Logs de éxito

4. **En Base de Datos**:
   - Registro en `affiliate_commissions` (si tiene código de referencia)
   - Estado premium activado

### 5. Ver Eventos en RevenueCat Dashboard

1. Ve a: https://app.revenuecat.com
2. Navega a: **FITSO** → **Customers**
3. Busca el usuario por:
   - Email: `test9@gmail.com`
   - App User ID: `36913c9a-fad3-4692-a6d9-598b4fc9763c`
4. Verifica:
   - ✅ Entitlements activos: `entl0b12b2e363` (Fitso Premium)
   - ✅ Suscripciones activas
   - ✅ Historial de transacciones
   - ✅ Eventos del webhook (si están visibles)

### 6. Verificar Comisiones Generadas

#### A. En la Base de Datos
```sql
-- Ver comisiones del usuario
SELECT 
  ac.*,
  ur.affiliate_code,
  afc.commission_amount,
  afc.commission_percentage
FROM users u
LEFT JOIN user_referrals ur ON u.id = ur.user_id
LEFT JOIN affiliate_commissions afc ON ur.affiliate_code = afc.affiliate_code
WHERE u.email = 'test9@gmail.com';
```

#### B. En el Backend
```bash
# Verificar comisiones via API (si existe endpoint)
curl -X GET https://fitso.onrender.com/api/affiliates/commissions \
  -H "Authorization: Bearer TOKEN"
```

### 7. Monitorear en Tiempo Real

#### A. Logs de Render (Tiempo Real)
```bash
# Si tienes acceso CLI de Render (o usa el dashboard)
# Los logs se actualizan automáticamente
```

#### B. RevenueCat Events
- Los eventos aparecen inmediatamente después de la compra
- El webhook se envía en segundos/minutos después

#### C. Debugging
Si algo no funciona:

1. **Verificar App User ID**:
   ```javascript
   // En la app, después del login:
   console.log('App User ID:', await Purchases.getAppUserID());
   // Debe coincidir con el ID del usuario en la BD
   ```

2. **Verificar Webhook en RevenueCat**:
   - Ve a: **Integrations** → **Webhooks**
   - Revisa el último evento enviado
   - Verifica que llegó al servidor

3. **Revisar Logs de Render**:
   - Busca errores en los logs
   - Verifica que el webhook llegó
   - Revisa que el usuario se encontró correctamente

## 🎯 Checklist de Prueba

- [ ] Servidor en Render responde
- [ ] Webhook configurado en RevenueCat
- [ ] Usuario test9@gmail.com existe en BD
- [ ] App User ID configurado correctamente en la app
- [ ] Compra realizada desde la app
- [ ] Webhook recibido en Render (ver logs)
- [ ] Evento visible en RevenueCat dashboard
- [ ] Comisión generada (si aplica)
- [ ] Estado premium activado en la app

## 📊 Qué Esperar Ver

### Logs en Render:
```
🎉 [REVENUECAT] Compra inicial detectada
✅ [REVENUECAT] Usuario encontrado: test9@gmail.com
✅ [REVENUECAT] Comisión inicial generada: $0.XX
```

### En RevenueCat:
- Customer con entitlement activo
- Transacción registrada
- Webhook enviado exitosamente

### En la App:
- Estado premium activado
- Acceso a funcionalidades premium
- Sin restricciones

## 🔧 Troubleshooting

### Webhook no llega:
1. Verificar URL en RevenueCat: `https://fitso.onrender.com/api/webhooks/revenuecat`
2. Verificar que el servidor esté corriendo
3. Verificar Authorization header (si está configurado)

### Comisión no se genera:
1. Verificar que el usuario tenga código de referencia en `user_referrals`
2. Verificar que el código existe en `affiliate_codes`
3. Revisar logs para errores

### App User ID no coincide:
1. Asegúrate de llamar `Purchases.logIn(userId)` después del login
2. Verifica que el userId sea el mismo que en la BD
3. Revisa logs de RevenueCat para ver qué App User ID recibió

## ✅ Listo para Probar

Ejecuta el script de prueba primero:
```bash
cd backend
BACKEND_URL=https://fitso.onrender.com node scripts/test-revenuecat-webhook-real.js
```

Luego prueba desde la app móvil y observa los logs en Render.

