# Solución: Compras Compartidas Entre Usuarios

## Problema Identificado

Las compras de suscripciones se estaban compartiendo entre diferentes usuarios (test1@gmail.com veía la compra de test2@gmail.com). Esto ocurría porque:

1. **El webhook NO guardaba suscripciones en la BD** - Solo procesaba comisiones
2. **El `app_user_id` no se verificaba correctamente antes de comprar** - RevenueCat podía usar un ID anónimo compartido
3. **El logout no limpiaba completamente el estado de RevenueCat**

## Soluciones Implementadas

### 1. Webhook ahora guarda suscripciones en BD ✅

El webhook de RevenueCat ahora guarda/actualiza las suscripciones en la tabla `subscriptions`:

- **INITIAL_PURCHASE**: Crea registro en BD con `user_id` del usuario que compró
- **RENEWAL**: Actualiza o crea registro para renovación
- **CANCELLATION**: Marca suscripción como `is_active = false`
- **EXPIRATION**: Marca suscripción como `is_active = false`

**Archivo modificado:** `backend/src/monetization/controllers/revenuecatWebhookController.js`

### 2. Verificación forzada de App User ID antes de comprar ✅

Antes de realizar cualquier compra, el código ahora:

1. Verifica que el `app_user_id` coincida con el `user.id`
2. Si no coincide, hace `logout()` y `logIn(userId)` para corregirlo
3. Si aún así no coincide, **NO permite continuar con la compra**

**Archivo modificado:** `src/services/subscriptionService.ts` (función `purchaseSubscription`)

### 3. Logout mejorado ✅

El logout ahora:

1. Verifica el estado antes de cerrar
2. Hace `logOut()` de RevenueCat
3. Verifica que se haya cerrado correctamente
4. Si todavía hay un `app_user_id`, fuerza limpieza nuevamente

**Archivo modificado:** `src/contexts/AuthContext.tsx` (función `logout`)

## Cómo Verificar que Funciona

### 1. Verificar en la Base de Datos

```sql
-- Ver todas las suscripciones activas
SELECT 
    u.email,
    u.id as user_id,
    s.product_id,
    s.transaction_id,
    s.is_active,
    s.purchase_date,
    s.expires_date
FROM subscriptions s
JOIN users u ON s.user_id = u.id
WHERE s.is_active = true
ORDER BY s.created_at DESC;
```

**Resultado esperado:** Cada usuario debe tener SU PROPIA suscripción. Si test1@gmail.com compró, solo él debe tener `is_active = true`.

### 2. Verificar Logs en Render

Busca en los logs del backend cuando llega un webhook:

```
🎉 [REVENUECAT] Primera compra detectada
👤 [REVENUECAT] App User ID: [user-id-del-usuario]
✅ [REVENUECAT] Usuario encontrado: test1@gmail.com
✅ [REVENUECAT] Suscripción guardada en BD para usuario: [user-id]
```

### 3. Verificar Logs en la App

Cuando un usuario intenta comprar, busca estos logs:

```
👤 [PURCHASE] App User ID verificado correctamente antes de comprar
✅ [PURCHASE] App User ID verificado correctamente - la compra se asociará al usuario correcto
```

Si ves este error, significa que el `app_user_id` no estaba configurado:

```
❌ [PURCHASE] CRÍTICO: App User ID incorrecto antes de comprar!
```

### 4. Verificar en RevenueCat Dashboard

1. Ve a RevenueCat Dashboard → Customers
2. Busca por el `app_user_id` (que debe ser el `user.id` de la BD)
3. Verifica que las compras estén asociadas al usuario correcto

## Pasos para Probar

### Prueba 1: Usuario 1 compra suscripción

1. Login como `test1@gmail.com`
2. Verificar logs: `App User ID verificado correctamente antes de comprar`
3. Comprar suscripción monthly
4. Verificar en BD:
   ```sql
   SELECT * FROM subscriptions WHERE user_id = '[id-de-test1]';
   ```
   Debe haber 1 registro con `is_active = true`

### Prueba 2: Usuario 2 NO debe ver la compra del Usuario 1

1. Logout de `test1@gmail.com`
2. Verificar logs: `✅ [LOGOUT] RevenueCat session cerrada correctamente`
3. Login como `test2@gmail.com`
4. Verificar logs: `App User ID configurado correctamente`
5. El estado premium debe ser `false` (no debe ver la compra de test1)

### Prueba 3: Usuario 2 compra su propia suscripción

1. Con `test2@gmail.com` logueado, comprar suscripción
2. Verificar en BD:
   ```sql
   SELECT u.email, s.* 
   FROM subscriptions s 
   JOIN users u ON s.user_id = u.id 
   WHERE s.is_active = true;
   ```
   Debe haber 2 registros, uno para cada usuario.

## Problemas Comunes y Soluciones

### Problema: El webhook no está guardando suscripciones

**Verificar:**
1. Los logs del webhook en Render muestran: `✅ [REVENUECAT] Suscripción guardada en BD`
2. Si no aparece, verificar que la tabla `subscriptions` existe

**Solución:**
```sql
-- Verificar que la tabla existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'subscriptions'
);
```

### Problema: El app_user_id sigue siendo incorrecto

**Síntomas:**
- Logs muestran: `❌ [PURCHASE] CRÍTICO: App User ID incorrecto`
- El webhook llega con `app_user_id` diferente al `user.id`

**Solución:**
1. Forzar logout completo
2. Cerrar completamente la app
3. Reabrir y hacer login nuevamente
4. Verificar antes de comprar que el `app_user_id` sea correcto

### Problema: Usuario ve compra de otro usuario

**Verificar:**
1. ¿El usuario hizo logout correctamente? Buscar: `✅ [LOGOUT] RevenueCat session cerrada`
2. ¿El nuevo usuario tiene `app_user_id` configurado? Buscar: `✅ [PREMIUM CONTEXT] App User ID configurado correctamente`

**Solución:**
- Asegurarse de hacer logout ANTES de cambiar de usuario
- Verificar que el nuevo usuario tenga su propio `app_user_id` antes de verificar estado premium

## Queries Útiles para Debugging

```sql
-- Ver todas las suscripciones con información de usuario
SELECT 
    u.email,
    u.id as user_id,
    s.product_id,
    s.transaction_id,
    s.is_active,
    s.purchase_date,
    s.expires_date,
    s.created_at
FROM subscriptions s
JOIN users u ON s.user_id = u.id
ORDER BY s.created_at DESC;

-- Contar suscripciones activas por usuario
SELECT 
    u.email,
    COUNT(*) as suscripciones_activas
FROM subscriptions s
JOIN users u ON s.user_id = u.id
WHERE s.is_active = true
GROUP BY u.email;

-- Ver suscripciones duplicadas (mismo transaction_id)
SELECT transaction_id, COUNT(*) as count
FROM subscriptions
GROUP BY transaction_id
HAVING COUNT(*) > 1;
```

## Notas Importantes

1. **Cada compra debe tener un `transaction_id` único** - Si hay duplicados, significa que el webhook está procesando la misma compra múltiples veces

2. **El `app_user_id` debe coincidir con `user.id`** - Si no coincide, las compras se asociarán al usuario incorrecto

3. **El logout es crítico** - Si no se cierra correctamente, el siguiente usuario puede ver las compras del anterior

4. **El webhook debe guardar en BD** - Aunque RevenueCat maneja el estado premium, necesitamos el registro en BD para verificar que cada usuario tiene su propia suscripción

