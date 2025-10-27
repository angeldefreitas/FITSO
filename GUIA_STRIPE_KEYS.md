# 🔐 Guía para Obtener API Keys de Stripe

## 📋 **Paso 1: Acceder al Dashboard de Stripe**

1. Ve a: [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Inicia sesión con tu cuenta
3. Si no tienes cuenta, créala en: [https://stripe.com/register](https://stripe.com/register)

---

## 🔑 **Paso 2: Obtener las API Keys (Secret y Publishable)**

### **Ubicación en el Dashboard:**

```
Dashboard → Developers (menú izquierdo) → API keys
```

### **Keys que Necesitas:**

#### **Para Desarrollo (Test Mode):**
1. Activa el toggle **"Test mode"** (esquina superior derecha)
2. Copia estas keys:
   - **Secret key**: `sk_test_XXXXXXXXXXXXXXXXXXXXX`
   - **Publishable key**: `pk_test_XXXXXXXXXXXXXXXXXXXXX`

#### **Para Producción (Live Mode):**
1. Desactiva el toggle **"Test mode"**
2. Copia estas keys:
   - **Secret key**: `sk_live_XXXXXXXXXXXXXXXXXXXXX` ⚠️ **NO COMPARTIR**
   - **Publishable key**: `pk_live_XXXXXXXXXXXXXXXXXXXXX`

---

## 🔔 **Paso 3: Obtener el Webhook Secret**

### **3.1 Crear el Webhook:**

1. En el Dashboard, ve a: **Developers → Webhooks**
2. Haz clic en **"Add endpoint"** (Agregar endpoint)
3. Configuración:
   - **URL del endpoint**: `https://fitso.onrender.com/api/affiliates/stripe-webhook`
   - **Descripción**: `Fitso Affiliate System Webhooks`
   - **Versión de API**: Dejar la más reciente

### **3.2 Seleccionar Eventos:**

Marca estos eventos (necesarios para el sistema de afiliados):

- ✅ `account.updated` - Actualizaciones de cuentas conectadas
- ✅ `balance.available` - Cambios en el balance
- ✅ `transfer.created` - Transferencias creadas
- ✅ `transfer.updated` - Transferencias actualizadas
- ✅ `transfer.paid` - Transferencias completadas
- ✅ `transfer.failed` - Transferencias fallidas

### **3.3 Obtener el Webhook Secret:**

1. Después de crear el webhook, verás una sección **"Signing secret"**
2. Haz clic en **"Reveal"** (Revelar)
3. Copia el secret que comienza con: `whsec_XXXXXXXXXXXXXXXXXXXXX`

---

## 📝 **Paso 4: Configurar en tu Backend**

### **Crear archivo .env (si no existe):**

En la carpeta `/backend`, crea o edita el archivo `.env`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXX
STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXX
```

⚠️ **IMPORTANTE**: 
- Usa **test keys** (`sk_test_`, `pk_test_`) para desarrollo
- Usa **live keys** (`sk_live_`, `pk_live_`) solo en producción

---

## 🚀 **Paso 5: Configurar en Render (Producción)**

Si tu backend está en Render:

1. Ve a tu dashboard de Render: [https://dashboard.render.com](https://dashboard.render.com)
2. Selecciona tu servicio backend
3. Ve a **"Environment"** (en el menú lateral)
4. Haz clic en **"Add Environment Variable"**
5. Agrega cada variable:

```
Name: STRIPE_SECRET_KEY
Value: sk_live_XXXXXXXXXXXXXXXXXXXXX  (usa la LIVE key para producción)

Name: STRIPE_PUBLISHABLE_KEY
Value: pk_live_XXXXXXXXXXXXXXXXXXXXX

Name: STRIPE_WEBHOOK_SECRET
Value: whsec_XXXXXXXXXXXXXXXXXXXXX
```

6. Haz clic en **"Save Changes"**
7. El servicio se reiniciará automáticamente

---

## 🧪 **Paso 6: Probar la Configuración**

### **Verificar que Stripe está Configurado:**

1. Inicia tu backend localmente:
   ```bash
   cd backend
   npm run dev
   ```

2. Busca en los logs:
   ```
   ✅ [STRIPE] Configurado correctamente
   ```

3. Si ves este mensaje, significa que hay un problema:
   ```
   ⚠️ [STRIPE] API key no configurada - Stripe deshabilitado
   ```

### **Probar el Webhook:**

1. En Stripe Dashboard, ve a tu webhook
2. Haz clic en **"Send test webhook"**
3. Selecciona evento: `balance.available`
4. Haz clic en **"Send test webhook"**
5. Verifica que el status sea **200 OK**

---

## 🔒 **Seguridad - MUY IMPORTANTE**

### **✅ LO QUE DEBES HACER:**

1. ✅ **NUNCA** subas el archivo `.env` a Git
2. ✅ Verifica que `.env` esté en `.gitignore`
3. ✅ Usa **test keys** para desarrollo local
4. ✅ Usa **live keys** solo en producción
5. ✅ Guarda las keys en un lugar seguro (como 1Password, LastPass, etc.)

### **❌ LO QUE NUNCA DEBES HACER:**

1. ❌ **NUNCA** compartas tu Secret Key públicamente
2. ❌ **NUNCA** subas las keys a GitHub
3. ❌ **NUNCA** incluyas las keys en el código fuente
4. ❌ **NUNCA** uses live keys en desarrollo local

---

## 📊 **Resumen de Keys Necesarias:**

| Key | Tipo | Ejemplo | Ubicación |
|-----|------|---------|-----------|
| Secret Key | Servidor | `sk_test_...` | Backend .env |
| Publishable Key | Cliente | `pk_test_...` | Backend .env |
| Webhook Secret | Servidor | `whsec_...` | Backend .env |

---

## 🆘 **Solución de Problemas**

### **Problema: "Stripe no está configurado"**

**Solución:**
1. Verifica que el archivo `.env` existe en `/backend`
2. Verifica que las variables estén escritas correctamente
3. Reinicia el servidor backend
4. Verifica que no haya espacios extras en las keys

### **Problema: "Webhook failed"**

**Solución:**
1. Verifica que la URL del webhook sea correcta
2. Verifica que el webhook secret sea el correcto
3. Verifica que tu servidor esté en HTTPS (Render usa HTTPS automáticamente)
4. Revisa los logs en Render para ver el error específico

### **Problema: "Invalid API key"**

**Solución:**
1. Verifica que estés usando la key correcta (test vs live)
2. Verifica que no haya caracteres extra al copiar la key
3. Regenera la key en el dashboard de Stripe si es necesario

---

## 📞 **Soporte**

Si tienes problemas:
- **Documentación de Stripe**: [https://stripe.com/docs](https://stripe.com/docs)
- **Soporte de Stripe**: [https://support.stripe.com](https://support.stripe.com)
- **Status de Stripe**: [https://status.stripe.com](https://status.stripe.com)

---

## ✅ **Checklist Final**

Antes de continuar, verifica que hayas completado:

- [ ] Cuenta de Stripe creada
- [ ] Secret key obtenida (test y/o live)
- [ ] Publishable key obtenida (test y/o live)
- [ ] Webhook creado en Stripe
- [ ] Eventos del webhook configurados
- [ ] Webhook secret obtenido
- [ ] Variables agregadas al archivo `.env` local
- [ ] Variables agregadas a Render (para producción)
- [ ] Servidor backend reiniciado
- [ ] Webhook probado con "Send test webhook"
- [ ] Archivo `.env` agregado a `.gitignore`

---

¡Listo! Tu sistema de afiliados ahora podrá procesar pagos de comisiones correctamente. 🎉

