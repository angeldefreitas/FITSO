# ✅ Estado de Configuración de Monetización - Fitso

**Fecha:** 27 de Octubre, 2025

---

## 🔐 **STRIPE - CONFIGURADO ✅**

### **Backend .env configurado con:**

```env
STRIPE_SECRET_KEY=sk_test_51JsQN2PE... ✅
STRIPE_PUBLISHABLE_KEY=pk_test_51JsQN2PE... ✅
STRIPE_WEBHOOK_SECRET=whsec_ZpYTP76SdhMQZIxQhWkRc2awMCu49Z8i ✅
```

### **Webhook configurado en Stripe:**

- **ID:** `we_1SMqEZPEeGtiiXFXVEsCjHaX`
- **URL:** `https://fitso.onrender.com/api/affiliates/stripe-webhook`
- **Estado:** `enabled` (Test Mode)
- **Eventos configurados:**
  - ✅ `account.updated`
  - ✅ `balance.available`
  - ✅ `transfer.created`
  - ✅ `transfer.updated`
  - ✅ `transfer.reversed`
  - ✅ `transfer.canceled`

### **Propósito:**
- Procesar pagos a afiliados
- Actualizar estado de transferencias en la base de datos
- Notificaciones de cambios en cuentas conectadas

---

## 📱 **REVENUECAT - CONFIGURADO EN CÓDIGO ✅**

### **API Keys (hardcoded en subscriptionService.ts):**

```typescript
ios: 'sk_ORwbKeMvzBapPnHcbzlxbGeulgeAi' ✅
ios_sandbox: 'test_oHHhNQjFIioQxDmtSBjCJzqpRRT' ✅
android: 'sk_ORwbKeMvzBapPnHcbzlxbGeulgeAi' ✅
```

### **Entitlement ID:**
- `entl0b12b2e363` (Fitso Premium)

### **Productos:**
- `Fitso_Premium_Monthly`
- `Fitso_Premium_Yearly`

### **⚠️ FALTA: Configurar Webhooks de RevenueCat**

**¿Por qué es importante?**
Para detectar automáticamente cuando:
- Usuario compra por primera vez → Generar comisión inicial
- Usuario renueva suscripción → Generar comisión recurrente
- Usuario cancela/deja de pagar → Dejar de generar comisiones

**Configuración pendiente:**
1. Ve a: [RevenueCat Dashboard](https://app.revenuecat.com)
2. Project Settings → Webhooks
3. Agrega URL: `https://fitso.onrender.com/api/webhooks/revenuecat`
4. Selecciona eventos:
   - `INITIAL_PURCHASE`
   - `RENEWAL`
   - `CANCELLATION`
   - `EXPIRATION`
   - `BILLING_ISSUE`

---

## 🤖 **CLAUDE AI - CONFIGURADO (FRONTEND) ✅**

### **API Key:**
- `EXPO_PUBLIC_CLAUDE_API_KEY` - Configurado en variables de entorno

### **Propósito:**
- Análisis de imágenes de comida con IA
- Detección nutricional automática

---

## 📧 **EMAIL - OPCIONAL ❌**

### **Variables faltantes en .env:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
```

### **Propósito:**
- Recuperación de contraseñas
- Notificaciones por email
- No crítico para funcionamiento básico

---

## 🍎 **APPLE STORE - OPCIONAL ❌**

### **Variable faltante en .env:**
```env
APPLE_SHARED_SECRET=tu_shared_secret_de_app_store_connect
```

### **Propósito:**
- Validación adicional de recibos de iOS
- RevenueCat ya maneja esto, pero es buena práctica tenerlo

### **Cómo obtenerlo:**
1. Ve a: [App Store Connect](https://appstoreconnect.apple.com)
2. My Apps → Tu app
3. App Information → App-Specific Shared Secret
4. Generate (si no existe)

---

## 📊 **GOOGLE MOBILE ADS - CONFIGURADO ✅**

### **App ID:**
- `ca-app-pub-2507387956943605~5314157036` ✅

### **Configurado en:**
- `app.json` ✅
- iOS Info.plist ✅
- Android config ✅

---

## 🎯 **SISTEMA DE AFILIADOS - ESTADO**

### **✅ Configurado:**
- Base de datos (tablas creadas)
- API endpoints (backend)
- Componentes frontend (dashboards)
- Integración con Stripe (pagos a afiliados)
- Sistema de códigos de referencia

### **⚠️ Pendiente:**
- Webhooks de RevenueCat (para comisiones automáticas)
- Testing end-to-end del flujo completo

---

## 🚀 **PRÓXIMOS PASOS**

### **1. CRÍTICO - Configurar Webhooks de RevenueCat:**
Sin esto, las comisiones NO se generarán automáticamente cuando usuarios compren/renueven.

### **2. IMPORTANTE - Testing:**
- Probar flujo completo de afiliado
- Simular compra de usuario con código de referencia
- Verificar que comisiones se generen correctamente

### **3. OPCIONAL:**
- Configurar APPLE_SHARED_SECRET
- Configurar EMAIL para recuperación de contraseñas
- Agregar suscripciones web con Stripe (evitar 30% de Apple)

---

## 📝 **VARIABLES DE ENTORNO - RESUMEN**

### **Backend (.env) - ESTADO ACTUAL:**

```env
# ✅ Configuradas
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
DB_HOST=dpg-d0j8v8h8s0s738f8a8pg-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=fitso_db_8x0j
DB_USER=fitso_user_8x0j
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRES_IN=7d
BACKEND_URL=https://fitso.onrender.com

# ⚠️ Pendientes
DB_PASSWORD=YOUR_PRODUCTION_PASSWORD  ← Necesitas la real
FRONTEND_URL=https://tu-frontend-url.com  ← Actualizar
EMAIL_HOST=smtp.gmail.com  ← Opcional
EMAIL_PORT=587  ← Opcional
EMAIL_USER=tu_email@gmail.com  ← Opcional
EMAIL_PASS=tu_app_password  ← Opcional
APPLE_SHARED_SECRET=tu_shared_secret  ← Opcional

# ❌ Falta configurar en backend (si quieres webhook de RevenueCat)
REVENUECAT_WEBHOOK_SECRET=tu_secret_aqui  ← Si RevenueCat lo usa
```

### **Frontend (Expo) - ESTADO:**

```env
# ✅ Configuradas
EXPO_PUBLIC_CLAUDE_API_KEY=...  (mencionaste que ya existe)
EXPO_PUBLIC_API_URL=https://fitso.onrender.com  (hardcoded en código)

# ✅ En código (no en .env)
RevenueCat API Keys - hardcoded en subscriptionService.ts
Google Ads ID - en app.json
```

---

## 🔒 **SEGURIDAD**

### **✅ Protegido:**
- `.env` en `.gitignore` ✅
- Keys no expuestas en código ✅
- Backup de .env creado (.env.backup) ✅

### **⚠️ IMPORTANTE:**
- Las keys actuales son de **TEST MODE** (sk_test_, pk_test_, whsec_...)
- Para producción, necesitarás las **LIVE keys** de Stripe
- Configura las LIVE keys en Render cuando vayas a producción

---

## 📞 **SOPORTE Y RECURSOS**

- **Stripe Dashboard:** https://dashboard.stripe.com
- **RevenueCat Dashboard:** https://app.revenuecat.com
- **App Store Connect:** https://appstoreconnect.apple.com
- **Backend en Render:** https://fitso.onrender.com

---

**Última actualización:** 27 de Octubre, 2025
**Estado general:** 🟡 Funcional pero requiere webhooks de RevenueCat para comisiones automáticas

