# 🐛 Debugging: Problema de Webhook y Estado Premium

## 🔴 Problemas Identificados

1. **Authorization inválida en webhook**: El webhook de RevenueCat está siendo rechazado
2. **Estado premium no se actualiza**: Después de la compra, el usuario no aparece como premium

## ✅ Cambios Realizados

### 1. Mejoras en el Webhook Controller (`backend/src/monetization/controllers/revenuecatWebhookController.js`)

- ✅ Agregado logging detallado para ver qué está llegando
- ✅ Validación más flexible del Authorization header
- ✅ En modo desarrollo, permite continuar aunque falle la validación (para debugging)
- ✅ Comparación más robusta (ignora mayúsculas/minúsculas en "Bearer")

### 2. Mejoras en Subscription Service (`src/services/subscriptionService.ts`)

- ✅ Logging detallado después de la compra
- ✅ Re-verificación automática del estado premium después de 1 segundo
- ✅ Logs detallados al refrescar el estado premium
- ✅ Muestra información completa de entitlements y subscriptions

## 🔍 Cómo Verificar el Problema

### Paso 1: Verificar Logs en Render

Después de hacer una compra de prueba, revisa los logs en Render Dashboard:

```
🔍 [REVENUECAT] Validando webhook...
🔑 [REVENUECAT] Webhook secret configurado: Sí
📨 [REVENUECAT] Authorization header recibido: Bearer Caradeperro...
```

**Si ves:**
- ✅ `✅ [REVENUECAT] Authorization válida` → El webhook está funcionando
- ❌ `❌ [REVENUECAT] Authorization inválida` → Hay un problema con el secret

**Verifica:**
- El valor exacto que aparece en los logs vs el que pusiste en Render
- Si hay espacios o caracteres extra

### Paso 2: Verificar Logs en la App

Después de hacer una compra, revisa los logs de la app:

```
📦 [PURCHASE] Entitlements activos: [...]
✅ [REFRESH] Premium entitlement encontrado: {...}
✅ [REFRESH] Usuario es premium: true
```

**Si ves:**
- ✅ `Usuario es premium: true` → El estado se actualizó correctamente
- ❌ `Premium entitlement NO encontrado` → Hay un problema con el entitlement

### Paso 3: Verificar App User ID

El problema puede ser que el App User ID no está configurado correctamente.

**En la app, deberías ver:**
```
👤 Configurando App User ID: [id-del-usuario]
✅ App User ID configurado en RevenueCat
```

**En Render (después del webhook), deberías ver:**
```
👤 [REVENUECAT] Usuario: [app_user_id]
```

**Si no coinciden**, el webhook está llegando pero para un usuario diferente.

## 🔧 Soluciones

### Solución 1: Verificar Authorization Header

1. Ve a Render Dashboard > Logs
2. Busca el mensaje: `📨 [REVENUECAT] Authorization header recibido`
3. Compara el valor con `Bearer Caradeperro211299`
4. Si no coinciden exactamente:
   - Verifica en RevenueCat Dashboard que el "Authorization header value" sea exactamente `Caradeperro211299`
   - Verifica en Render que `REVENUECAT_WEBHOOK_SECRET` sea exactamente `Caradeperro211299`

### Solución 2: Verificar App User ID

El App User ID debe ser el mismo en:
- La app móvil (cuando hace la compra)
- RevenueCat Dashboard (en el evento del webhook)

**Para verificar:**
1. En la app, después de iniciar sesión, revisa los logs:
   ```
   👤 Configurando App User ID: [debería ser el ID del usuario en tu BD]
   ```

2. En RevenueCat Dashboard:
   - Ve a Customers
   - Busca el App User ID del usuario `test1@gmail.com`
   - Debería ser el mismo que aparece en los logs de la app

3. Si no coincide:
   - El problema es que RevenueCat está usando un ID anónimo
   - Asegúrate de que el usuario esté autenticado ANTES de hacer la compra
   - O configura el App User ID manualmente antes de comprar

### Solución 3: Verificar Entitlement ID

El entitlement ID debe ser correcto:

- **En el código**: `PREMIUM_ENTITLEMENT = 'entl0b12b2e363'`
- **En RevenueCat**: Debe existir un entitlement con ese ID exacto

**Para verificar:**
1. Ve a RevenueCat Dashboard > Product catalog
2. Verifica que existe un entitlement llamado "Fitso Premium" con ID `entl0b12b2e363`

## 🧪 Testing con el Usuario test1@gmail.com

### Paso 1: Limpiar Estado

1. En la app, cierra sesión
2. Elimina la app y reinstálala (para limpiar RevenueCat cache)
3. O mejor: ve a Settings > App Store > Sandbox Account y cierra sesión

### Paso 2: Iniciar Sesión

1. Inicia sesión con `test1@gmail.com` / `211299`
2. Verifica los logs:
   ```
   👤 Configurando App User ID: [id-del-usuario-test1]
   ✅ App User ID configurado en RevenueCat
   ```
3. Anota el App User ID que aparece

### Paso 3: Hacer Compra de Prueba

1. Ve a la pantalla de Premium
2. Selecciona un plan
3. Completa la compra
4. Revisa los logs inmediatamente después

### Paso 4: Verificar en RevenueCat

1. Ve a RevenueCat Dashboard > Customers
2. Busca el App User ID que anotaste
3. Deberías ver:
   - Un evento `INITIAL_PURCHASE`
   - El entitlement "Fitso Premium" activo

### Paso 5: Verificar Logs en Render

1. Ve a Render Dashboard > Logs
2. Busca los mensajes del webhook
3. Deberías ver:
   ```
   📨 [REVENUECAT] Webhook recibido
   ✅ [REVENUECAT] Authorization válida
   👤 [REVENUECAT] Usuario: [app_user_id]
   📦 [REVENUECAT] Producto: Fitso_Premium_Yearly
   🎉 [REVENUECAT] Primera compra detectada
   ```

## 📝 Checklist de Verificación

- [ ] Authorization header llega correctamente a Render
- [ ] El secret coincide exactamente entre RevenueCat y Render
- [ ] El App User ID es el mismo en la app y RevenueCat
- [ ] El entitlement ID es correcto (`entl0b12b2e363`)
- [ ] El webhook se procesa correctamente (no hay errores)
- [ ] El estado premium se actualiza en la app después de la compra
- [ ] Los logs muestran que el usuario es premium

## 🚨 Problemas Comunes

### "Authorization inválida" pero el secret está correcto

**Causa:** Puede haber espacios o caracteres invisibles
**Solución:** 
- Copia el secret nuevamente desde RevenueCat
- Pégalo en un editor de texto plano primero
- Luego cópialo desde allí a Render

### Estado premium no se actualiza después de la compra

**Causa:** El entitlement no está activo inmediatamente o hay un delay
**Solución:**
- Espera 2-3 segundos y luego cierra y reabre la app
- O usa el botón "Restaurar compras"

### Webhook no llega a Render

**Causa:** La URL del webhook está mal configurada
**Solución:**
- Verifica que la URL en RevenueCat sea exactamente: `https://fitso.onrender.com/api/webhooks/revenuecat`
- Prueba el endpoint: `curl https://fitso.onrender.com/api/webhooks/revenuecat/test`

## 📞 Próximos Pasos

1. **Despliega los cambios** en Render (push a main o manual deploy)
2. **Prueba con el usuario test1@gmail.com** siguiendo los pasos arriba
3. **Revisa los logs** en Render y en la app
4. **Comparte los logs** si el problema persiste

