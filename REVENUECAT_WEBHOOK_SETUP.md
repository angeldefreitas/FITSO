# 🔔 Configuración de Webhooks de RevenueCat

## 📋 **¿Por Qué Necesitas Este Webhook?**

Este webhook es **CRÍTICO** para tu sistema de afiliados. Sin él:
- ❌ Las comisiones NO se generarán automáticamente cuando usuarios compren
- ❌ Las comisiones NO se generarán cuando usuarios renueven
- ❌ No sabrás cuando usuarios cancelen (seguirías generando comisiones incorrectamente)

Con el webhook configurado:
- ✅ Comisión automática cuando usuario compra por primera vez
- ✅ Comisión recurrente cuando usuario renueva suscripción
- ✅ Detección automática de cancelaciones/expiraciones
- ✅ Tracking de problemas de pago

---

## 🚀 **PASO 1: Acceder al Dashboard de RevenueCat**

1. Ve a: [https://app.revenuecat.com](https://app.revenuecat.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto (Fitso)

---

## 🔧 **PASO 2: Configurar el Webhook**

### **2.1 Navegar a Webhooks:**

```
Dashboard → [Tu App] → Settings → Integrations → Webhooks
```

O busca "Webhooks" en el menú lateral.

### **2.2 Crear Nuevo Webhook:**

Haz clic en **"+ New"** o **"Add Webhook"**

### **2.3 Configuración del Webhook:**

**URL del Webhook:**
```
https://fitso.onrender.com/api/webhooks/revenuecat
```

**Eventos a Seleccionar:**

✅ **INITIAL_PURCHASE**
- Se dispara cuando un usuario compra por primera vez
- Genera la comisión inicial para el afiliado

✅ **RENEWAL**
- Se dispara cuando una suscripción se renueva automáticamente
- Genera comisión recurrente para el afiliado

✅ **CANCELLATION**
- Se dispara cuando un usuario cancela su suscripción
- Detiene la generación de comisiones futuras

✅ **EXPIRATION**
- Se dispara cuando una suscripción expira (por falta de pago)
- Detiene la generación de comisiones

✅ **BILLING_ISSUE**
- Se dispara cuando hay problemas de pago
- Pausa comisiones hasta que se resuelva

**Opcionales (pero recomendados):**

✅ **PRODUCT_CHANGE**
- Cuando usuario cambia de plan (ej: mensual a anual)
- Ajusta comisiones según nuevo plan

✅ **NON_RENEWING_PURCHASE**
- Compras únicas (no recurrentes)
- Para tracking, pero no genera comisiones recurrentes

### **2.4 Configuración Adicional:**

**Authorization Header (Opcional pero Recomendado):**
- Si RevenueCat lo permite, agrega un header de autorización
- Ejemplo: `Authorization: Bearer tu_secret_token_aqui`
- Esto lo puedes validar en tu backend para mayor seguridad

**API Version:**
- Usa la versión más reciente disponible

---

## ✅ **PASO 3: Guardar y Probar**

### **3.1 Guardar Configuración:**

Haz clic en **"Save"** o **"Create Webhook"**

### **3.2 Probar el Webhook:**

RevenueCat normalmente tiene una opción para enviar un evento de prueba:

1. Busca **"Send test"** o **"Test webhook"**
2. Selecciona evento: `INITIAL_PURCHASE`
3. Envía el test

### **3.3 Verificar en tus Logs:**

Después de enviar el test, verifica en los logs de Render:

```bash
# Deberías ver algo como:
📨 [REVENUECAT] Webhook recibido: INITIAL_PURCHASE
👤 [REVENUECAT] Usuario: test_user_id
📦 [REVENUECAT] Producto: Fitso_Premium_Monthly
💰 [REVENUECAT] Precio: 9.99 USD
```

---

## 🧪 **PASO 4: Probar Manualmente (Opcional)**

Puedes probar que tu endpoint está funcionando:

```bash
curl -X POST https://fitso.onrender.com/api/webhooks/revenuecat \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INITIAL_PURCHASE",
    "event": {
      "app_user_id": "test_user_123",
      "product_id": "Fitso_Premium_Monthly",
      "id": "test_transaction_456",
      "price": 9.99,
      "currency": "USD"
    }
  }'
```

O puedes visitar:
```
https://fitso.onrender.com/api/webhooks/revenuecat/test
```

Deberías ver:
```json
{
  "success": true,
  "message": "Webhook de RevenueCat funcionando correctamente",
  "timestamp": "2025-10-27T..."
}
```

---

## 📊 **ESTRUCTURA DEL WEBHOOK**

RevenueCat envía eventos en este formato:

```json
{
  "api_version": "1.0",
  "type": "INITIAL_PURCHASE",
  "event": {
    "app_user_id": "user_123",
    "original_app_user_id": "user_123",
    "product_id": "Fitso_Premium_Monthly",
    "id": "transaction_xyz",
    "purchased_at_ms": 1635456789000,
    "expiration_at_ms": 1638048789000,
    "price": 9.99,
    "price_in_purchased_currency": 9.99,
    "currency": "USD",
    "store": "app_store",
    "environment": "PRODUCTION",
    "entitlement_ids": ["premium"],
    "presented_offering_id": "default"
  }
}
```

---

## 🔍 **MONITOREO**

### **En RevenueCat Dashboard:**

Ve a **Webhooks → [Tu Webhook] → Delivery Log**

Aquí verás:
- ✅ Eventos enviados exitosamente (200 OK)
- ❌ Eventos fallidos (con el error)
- 🔄 Reintentos automáticos

### **En Render (Tu Backend):**

Ve a tu servicio en Render → Logs

Busca:
```
[REVENUECAT]
```

---

## 🚨 **SOLUCIÓN DE PROBLEMAS**

### **Problema: "Webhook failed (404)"**

**Causa:** La URL no es correcta o el servidor no está funcionando

**Solución:**
1. Verifica que la URL sea exactamente: `https://fitso.onrender.com/api/webhooks/revenuecat`
2. Verifica que tu servidor esté corriendo en Render
3. Prueba la URL de test: `https://fitso.onrender.com/api/webhooks/revenuecat/test`

### **Problema: "Webhook failed (500)"**

**Causa:** Error en tu código backend

**Solución:**
1. Revisa los logs en Render para ver el error específico
2. Verifica que la base de datos esté conectada
3. Verifica que las tablas de afiliados existan

### **Problema: "No se generan comisiones"**

**Causa:** Usuario no tiene código de referencia o código inválido

**Solución:**
1. Verifica que el usuario tenga un código de referencia en `user_referrals`
2. Verifica que el código exista en `affiliate_codes` y esté activo
3. Revisa los logs para ver el mensaje específico

### **Problema: "Eventos llegan pero no se procesan"**

**Causa:** Formato del evento diferente al esperado

**Solución:**
1. Revisa los logs para ver la estructura exacta del evento
2. Puede que RevenueCat haya cambiado el formato
3. Ajusta el código en `revenuecatWebhookController.js` según sea necesario

---

## 📝 **VARIABLES DE ENTORNO**

### **Opcional - Agregar Secret de RevenueCat:**

Si quieres validar que los webhooks realmente vienen de RevenueCat:

```env
# En tu .env
REVENUECAT_WEBHOOK_SECRET=tu_secret_aqui
```

Luego en el código puedes validar:
```javascript
if (req.headers['x-revenuecat-signature'] !== process.env.REVENUECAT_WEBHOOK_SECRET) {
  return res.status(401).json({ success: false, message: 'Unauthorized' });
}
```

---

## 🎯 **FLUJO COMPLETO**

```
Usuario compra en app
       ↓
Apple/Google procesa pago
       ↓
RevenueCat detecta compra
       ↓
RevenueCat envía webhook → https://fitso.onrender.com/api/webhooks/revenuecat
       ↓
Tu backend recibe evento
       ↓
Identifica tipo: INITIAL_PURCHASE o RENEWAL
       ↓
Busca si usuario tiene código de referencia
       ↓
Calcula comisión (precio × porcentaje)
       ↓
Guarda en affiliate_commissions
       ↓
✅ Afiliado puede ver la comisión en su dashboard
```

---

## ✅ **CHECKLIST FINAL**

Antes de considerar la configuración completa:

- [ ] Webhook creado en RevenueCat Dashboard
- [ ] URL configurada: `https://fitso.onrender.com/api/webhooks/revenuecat`
- [ ] Eventos seleccionados: INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, BILLING_ISSUE
- [ ] Webhook probado con "Send test"
- [ ] Test exitoso visible en logs de Render
- [ ] URL de test responde correctamente
- [ ] Código desplegado en Render (push a git + deploy)

---

## 🚀 **DESPLIEGUE**

**IMPORTANTE:** Los cambios que hicimos están en tu código local. Necesitas:

1. **Commitear cambios:**
```bash
git add .
git commit -m "Add RevenueCat webhook integration"
git push origin main
```

2. **Render detectará los cambios y redesplegará automáticamente**

3. **Verifica que el despliegue sea exitoso en Render Dashboard**

4. **Luego configura el webhook en RevenueCat**

---

## 📞 **SOPORTE**

- **RevenueCat Docs:** https://www.revenuecat.com/docs/webhooks
- **RevenueCat Support:** https://www.revenuecat.com/support
- **Render Logs:** https://dashboard.render.com

---

**¡Una vez configurado, tu sistema de afiliados estará 100% automatizado!** 🎉

