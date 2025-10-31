# 📱 Cómo Ver los Logs de la App para Diagnosticar

## 🔍 Problema Actual:

- Compra se procesa pero falla después
- Webhook NO llega a Render
- Necesitamos ver los logs de la app para saber qué está pasando

## 📋 Pasos para Ver Logs:

### Opción 1: Logs en Xcode (Recomendado)

1. **Conectar iPhone a Mac**:
   - Conecta el cable USB
   - Confía en la computadora en el iPhone

2. **Abrir Xcode**:
   - Xcode → Window → Devices and Simulators (Shift + Cmd + 2)
   - O: Window → Devices

3. **Seleccionar tu iPhone**:
   - En la lista de la izquierda
   - Verás la app "Fitso" instalada

4. **Abrir Console de la App**:
   - Selecciona tu iPhone
   - Busca "Fitso" en la lista de apps
   - Haz clic en "Open Console"
   - O usa el botón "View Device Logs"

5. **Filtrar Logs**:
   - En el campo de búsqueda, escribe: `[PURCHASE]` o `[REVENUECAT]`
   - O busca: `subscriptionService`

6. **Reproducir la Compra**:
   - Mientras los logs están abiertos
   - Haz la compra en tu iPhone
   - Verás los logs en tiempo real

### Opción 2: Logs en Terminal (Alternativa)

```bash
# En Mac, abrir Terminal y ejecutar:
xcrun simctl spawn booted log stream --level=debug --predicate 'processImagePath contains "Fitso"'

# O para dispositivo físico:
# Necesitas el UUID del dispositivo primero
```

### Opción 3: Ver Logs Directamente en iPhone

1. **Configurar Logging en la App**:
   - La app usa `console.log()` que debería aparecer en Xcode
   - Si usas un logger de terceros, verifica su configuración

## 🔍 Qué Buscar en los Logs:

### **Logs Críticos que DEBES ver:**

1. **Al iniciar la app (después de registro)**:
   ```
   👤 Usuario autenticado detectado, configurando App User ID...
   ✅ [INIT] App User ID configurado correctamente en RevenueCat
   ```

2. **Al hacer clic en "Subscribe"**:
   ```
   🛒 [PURCHASE] Iniciando compra de suscripción: Fitso_Premium_Monthly
   👤 [PURCHASE] Configurando App User ID antes de la compra: 4909ff06-1979-4033-b652-e248d516fd3d
   ✅ [PURCHASE] App User ID configurado correctamente
   ```

3. **Después de la compra**:
   ```
   💳 [PURCHASE] Iniciando compra con RevenueCat...
   📦 [PURCHASE] Customer Info después de compra:
     - App User ID: ???
     - Active Entitlements: ???
   ```

### **Si hay problema, verás:**

```
❌ [PURCHASE] Compra exitosa pero NO hay entitlement activo
❌ [PURCHASE] Entitlements activos: []
❌ [PURCHASE] Buscando entitlement: entl0b12b2e363
```

O:

```
⚠️ [PURCHASE] ADVERTENCIA: App User ID cambió después de la compra!
  - Esperado: 4909ff06-1979-4033-b652-e248d516fd3d
  - Obtenido: [ID-DIFERENTE]
```

## 🎯 Qué Hacer con los Logs:

1. **Copia todos los logs relacionados con**:
   - `[PURCHASE]`
   - `[REVENUECAT]`
   - `[INIT]`
   - Cualquier error

2. **Envíalos para analizar** y podremos identificar exactamente qué falló

## 🔧 Verificar También en RevenueCat:

1. Ve a: https://app.revenuecat.com
2. **Customers** → Busca: `4909ff06-1979-4033-b652-e248d516fd3d`
3. Verifica:
   - **App User ID**: ¿Es el mismo que el ID del usuario?
   - **Entitlements**: ¿Aparece `entl0b12b2e363`?
   - **Webhooks**: Ve a **Integrations** → **Webhooks** → Ver historial de envíos

