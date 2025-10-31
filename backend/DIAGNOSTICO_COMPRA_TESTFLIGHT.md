# 🔍 Diagnóstico: Compra en TestFlight Falló

## ❌ Problema Detectado:

### **La compra se procesó pero el entitlement NO se activó**

Según el código y los síntomas:
1. ✅ Apple procesó el pago (diálogo de confirmación)
2. ✅ RevenueCat registró la compra (aparece en dashboard)
3. ❌ **El entitlement `entl0b12b2e363` NO está activo** después de la compra
4. ❌ La app detecta esto y muestra error
5. ❌ Como falla ANTES de `notifyBackendAboutPurchase()`, nunca se notifica al backend
6. ❌ RevenueCat NO envía el webhook (probablemente porque el entitlement no está activo o App User ID incorrecto)

## 🔍 Causas Posibles:

### 1. **App User ID No Configurado Correctamente** ⚠️

**Síntoma:**
- RevenueCat muestra "active customer" pero sin suscripción
- Esto sugiere que la compra se asoció a un ID anónimo, no al ID del usuario

**Verificación necesaria:**
- Revisar logs de la app (en Xcode console) para ver si hay:
  ```
  ✅ [INIT] App User ID configurado correctamente en RevenueCat
  👤 [PURCHASE] Configurando App User ID antes de la compra: [ID]
  ✅ [PURCHASE] App User ID configurado correctamente
  ```

### 2. **Entitlement ID Incorrecto** ⚠️

**Posible problema:**
- El entitlement ID `entl0b12b2e363` podría no estar configurado correctamente en RevenueCat
- O los productos no están vinculados al entitlement

**Verificación necesaria:**
- En RevenueCat dashboard: Verificar que `Fitso_Premium_Monthly` y `Fitso_Premium_Yearly` estén vinculados al entitlement `entl0b12b2e363`

### 3. **Product IDs No Coinciden** ⚠️

**Posible problema:**
- Los product IDs en la app (`Fitso_Premium_Monthly`, `Fitso_Premium_Yearly`)
- No coinciden con los configurados en RevenueCat
- O en Apple App Store Connect

### 4. **Webhook No Configurado para Sandbox** ⚠️

**Posible problema:**
- El webhook en RevenueCat está configurado solo para Production
- TestFlight usa Sandbox, entonces no se envía el webhook

## 🛠️ Soluciones:

### **Paso 1: Verificar Logs de la App en Xcode**

1. Conecta tu iPhone a la Mac
2. Abre Xcode → Window → Devices and Simulators
3. Selecciona tu iPhone
4. Abre los logs de la app mientras haces la compra
5. Busca estos logs críticos:

```
👤 [PURCHASE] Configurando App User ID antes de la compra: 4909ff06-1979-4033-b652-e248d516fd3d
✅ [PURCHASE] App User ID configurado correctamente
💳 [PURCHASE] Iniciando compra con RevenueCat...
📦 [PURCHASE] Customer Info después de compra:
  - App User ID: ???
  - Active Entitlements: ???
✅ [PURCHASE] Compra exitosa, usuario tiene acceso premium
```

O si falla:
```
❌ [PURCHASE] Compra exitosa pero NO hay entitlement activo
❌ [PURCHASE] Entitlements activos: []
```

### **Paso 2: Verificar en RevenueCat Dashboard**

1. Ve a: https://app.revenuecat.com
2. **Customers** → Busca por `4909ff06-1979-4033-b652-e248d516fd3d` o `tests1@gmail.com`
3. Verifica:
   - ✅ App User ID: ¿Coincide con el ID del usuario?
   - ✅ Entitlements: ¿Aparece `entl0b12b2e363` como activo?
   - ✅ Subscriptions: ¿Hay una suscripción activa?
   - ✅ Webhooks: ¿Se intentó enviar algún webhook? (ver logs de webhooks)

### **Paso 3: Verificar Configuración del Webhook**

En RevenueCat dashboard:
1. **Integrations** → **Webhooks**
2. Verifica:
   - URL: `https://fitso.onrender.com/api/webhooks/revenuecat`
   - **Environment**: Debe ser "Both Production and Sandbox" (o al menos "Sandbox")
   - Events: `INITIAL_PURCHASE` marcado

### **Paso 4: Verificar Productos en RevenueCat**

1. **Product catalog** → Verifica:
   - `Fitso_Premium_Monthly` existe y está activo
   - `Fitso_Premium_Yearly` existe y está activo
   - Ambos están vinculados al entitlement `entl0b12b2e363`

### **Paso 5: Verificar Product IDs en App Store Connect**

Los product IDs deben coincidir exactamente:
- En App Store Connect: `Fitso_Premium_Monthly` y `Fitso_Premium_Yearly`
- En RevenueCat: Mismos IDs
- En el código: Mismos IDs (✅ ya están correctos)

## 🎯 Próximos Pasos:

1. **Revisar logs de Xcode** para ver qué está pasando exactamente
2. **Verificar en RevenueCat** el App User ID y entitlements del usuario
3. **Verificar configuración del webhook** (que esté para Sandbox también)
4. **Corregir según lo encontrado**

## 📊 Lo que DEBERÍA aparecer en los logs de Render:

Si todo funcionara correctamente, verías:

```
POST /api/webhooks/revenuecat
🔍 [REVENUECAT] Validando webhook...
📨 [REVENUECAT] Webhook recibido
📨 [REVENUECAT] Tipo de evento: INITIAL_PURCHASE
👤 [REVENUECAT] Usuario: 4909ff06-1979-4033-b652-e248d516fd3d
📦 [REVENUECAT] Producto: Fitso_Premium_Monthly  // o Fitso_Premium_Yearly
💰 [REVENUECAT] Precio: 2.99 USD  // o 19.99 USD
✅ [REVENUECAT] Usuario encontrado: tests1@gmail.com
✅ [REVENUECAT] Compra inicial procesada correctamente
```

Pero **NO aparece porque el webhook nunca llegó**.

