# 🔍 Análisis: POST 404 en Raíz `/`

## 📊 Observación Crítica:

**Cada vez que intentas hacer una compra, aparece:**
```
POST / → 404
User-Agent: Apache-HttpClient/4.5.14 (Java/21.0.8)
IP: 17.58.253.7 (Apple/RevenueCat)
```

Esto ocurre **exactamente cuando intentas la compra**, NO aparece en otros momentos.

## 🔍 Análisis:

### 1. **User-Agent Identifica a RevenueCat**
- `Apache-HttpClient/4.5.14 (Java/21.0.8)` es el User-Agent que usa RevenueCat
- Los IPs `17.58.253.7` y `17.58.253.23` son de Apple/RevenueCat

### 2. **¿Por qué POST a `/` y no a `/api/webhooks/revenuecat`?**

**Posibles causas:**

#### A. **URL del Webhook Mal Configurada en RevenueCat** ⚠️ (Más Probable)

Si en RevenueCat dashboard el webhook está configurado como:
- ❌ `https://fitso.onrender.com` (sin `/api/webhooks/revenuecat`)
- Entonces RevenueCat intenta verificar `/` primero

**Verificación necesaria:**
- En RevenueCat: **Integrations** → **Webhooks**
- Verificar que la URL sea EXACTAMENTE: `https://fitso.onrender.com/api/webhooks/revenuecat`

#### B. **RevenueCat Hace Health Check Antes del Webhook**

RevenueCat podría estar:
1. Haciendo un health check a `/` antes de enviar el webhook
2. Si el health check falla (404), no envía el webhook real
3. Esto explicaría por qué nunca llega el webhook a `/api/webhooks/revenuecat`

#### C. **Problema de Configuración de Base URL**

Si el webhook está configurado con una base URL incorrecta o incompleta.

## ✅ Solución Propuesta:

### **Paso 1: Verificar URL del Webhook en RevenueCat**

1. Ve a: https://app.revenuecat.com
2. **Integrations** → **Webhooks**
3. Verifica que la URL sea EXACTAMENTE:
   ```
   https://fitso.onrender.com/api/webhooks/revenuecat
   ```
   NO:
   - `https://fitso.onrender.com`
   - `https://fitso.onrender.com/`
   - `https://fitso.onrender.com/api/webhooks` (sin `/revenuecat`)

### **Paso 2: Crear Endpoint de Health Check para RevenueCat**

Agregar un endpoint específico que RevenueCat pueda usar para verificar:

```javascript
// En server.js
app.get('/', (req, res) => {
  // Si viene de RevenueCat (health check), responder OK
  if (req.headers['user-agent']?.includes('Apache-HttpClient')) {
    res.status(200).json({
      success: true,
      message: 'Server OK',
      webhookEndpoint: '/api/webhooks/revenuecat'
    });
  } else {
    // Para otros requests, mostrar info normal
    res.json({
      success: true,
      message: 'API de Fitso MVP',
      // ...
    });
  }
});
```

### **Paso 3: Verificar Historial de Webhooks en RevenueCat**

En RevenueCat dashboard:
1. **Integrations** → **Webhooks**
2. Ver el **historial de webhooks enviados**
3. Verificar:
   - ¿Se intentó enviar algún webhook?
   - ¿Cuál fue el resultado? (200, 404, timeout, etc.)
   - ¿A qué URL se envió?

## 🎯 Próximos Pasos:

1. **Verificar URL en RevenueCat** (más importante)
2. **Revisar historial de webhooks** en RevenueCat dashboard
3. **Agregar endpoint de health check** si es necesario
4. **Probar nuevamente** después de verificar la configuración

