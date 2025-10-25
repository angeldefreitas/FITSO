# 🔗 Guía de Configuración de Webhooks de Stripe

## 📋 **PASOS PARA CONFIGURAR WEBHOOKS:**

### **1. 🌐 Acceder a Stripe Dashboard**
1. Ve a [dashboard.stripe.com](https://dashboard.stripe.com)
2. Inicia sesión con tu cuenta de Stripe
3. Ve a **"Developers"** → **"Webhooks"**

### **2. ➕ Crear Nuevo Webhook**
1. Toca **"Add endpoint"**
2. **URL del endpoint**: `https://fitso.onrender.com/api/affiliates/stripe-webhook`
3. **Descripción**: "Fitso Affiliate System Webhooks"

### **3. 🎯 Seleccionar Eventos**
Selecciona estos eventos específicos:
- `account.updated` - Actualizaciones de cuentas de afiliados
- `balance.available` - Cambios en el balance de Stripe
- `transfer.created` - Transferencias creadas
- `transfer.updated` - Transferencias actualizadas
- `transfer.paid` - Transferencias completadas
- `transfer.failed` - Transferencias fallidas

### **4. 🔑 Obtener Webhook Secret**
1. Después de crear el webhook, ve a **"Reveal"** en la sección **"Signing secret"**
2. Copia el secret que empiece con `whsec_...`
3. Guárdalo para configurar en Render

### **5. ⚙️ Configurar en Render**
1. Ve a tu dashboard de Render
2. Selecciona tu servicio backend
3. Ve a **"Environment"**
4. Agrega estas variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui
   ```

### **6. 🧪 Probar Webhook**
1. En Stripe Dashboard, ve a tu webhook
2. Toca **"Send test webhook"**
3. Selecciona un evento (ej: `balance.available`)
4. Verifica que llegue a tu servidor

## 📊 **EVENTOS CONFIGURADOS:**

| Evento | Descripción | Acción |
|--------|-------------|---------|
| `account.updated` | Cuenta de afiliado actualizada | Actualizar estado en BD |
| `balance.available` | Balance de Stripe disponible | Notificar cambio de balance |
| `transfer.created` | Transferencia creada | Registrar en BD |
| `transfer.paid` | Transferencia completada | Marcar como pagada |
| `transfer.failed` | Transferencia fallida | Marcar como fallida |

## 🔍 **VERIFICAR FUNCIONAMIENTO:**

### **Logs del Servidor:**
```bash
# Buscar estos logs en Render:
📨 [STRIPE] Webhook recibido: balance.available
✅ [WEBHOOK] Balance actualizado en Stripe
```

### **Dashboard de Stripe:**
- Ve a **"Webhooks"** → Tu webhook
- Revisa **"Recent deliveries"**
- Debe mostrar **"200"** como status

## ⚠️ **NOTAS IMPORTANTES:**

1. **Solo funciona en producción** - Los webhooks no funcionan en localhost
2. **HTTPS requerido** - Stripe solo envía a URLs HTTPS
3. **Respuesta rápida** - Stripe espera respuesta en < 30 segundos
4. **Idempotencia** - El mismo evento puede llegar múltiples veces

## 🚨 **SOLUCIÓN DE PROBLEMAS:**

### **Error 404:**
- Verifica que la URL sea correcta
- Asegúrate de que el servidor esté funcionando

### **Error 500:**
- Revisa los logs del servidor
- Verifica que las variables de entorno estén configuradas

### **Webhook no llega:**
- Verifica que el servidor esté en producción
- Revisa que la URL sea HTTPS
- Confirma que el webhook esté activo en Stripe

## ✅ **CHECKLIST FINAL:**

- [ ] Webhook creado en Stripe Dashboard
- [ ] URL configurada correctamente
- [ ] Eventos seleccionados
- [ ] Webhook secret copiado
- [ ] Variable configurada en Render
- [ ] Webhook probado exitosamente
- [ ] Logs verificados en servidor

---

**¡Una vez configurado, el sistema se actualizará automáticamente!** 🚀
