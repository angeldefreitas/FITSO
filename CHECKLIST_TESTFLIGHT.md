# ✅ Checklist Pre-TestFlight: Sistema de Afiliados + Compras

## 🎯 **OBJETIVO**
Verificar que todo esté listo para probar el flujo completo de compras en TestFlight.

---

## ✅ **1. BACKEND - LISTO**

### Sistema de Afiliados
- [x] ✅ Tablas creadas (`affiliate_codes`, `user_referrals`, `affiliate_commissions`)
- [x] ✅ Código ANGELUCHI activo (80% comisión)
- [x] ✅ Columna `subscription_id` corregida (UUID → TEXT)
- [x] ✅ API endpoints funcionando:
  - `/api/affiliates/validate/:code` → Validar código
  - `/api/affiliates/referral` → Registrar referido
  - `/api/affiliates/simple-dashboard` → Dashboard del afiliado
  - `/api/affiliates/commissions/:code` → Ver comisiones

### Webhooks y Compras
- [x] ✅ Webhook de RevenueCat configurado:
  - URL: `https://fitso.onrender.com/api/webhooks/revenuecat`
  - Secret: `WCucJsCMfue0GFPfXZcCmercF0EdgGOqXnjguERFkCQ=`
- [x] ✅ Endpoint `/api/subscriptions/purchase` creado (notificación directa)
- [x] ✅ Lógica de comisiones probada (test5 y test7)
- [x] ✅ Dashboard actualiza correctamente

---

## ✅ **2. FRONTEND - LISTO**

### Flujo de Registro con Código
- [x] ✅ `ReferralCodeInput` validando códigos
- [x] ✅ Registro de códigos en `user_referrals`
- [x] ✅ Onboarding funcionando

### Pantalla Premium
- [x] ✅ `PremiumScreen` con planes Monthly ($2.99) y Yearly ($19.99)
- [x] ✅ Integración con RevenueCat
- [x] ✅ Notificación al backend después de compra
- [x] ✅ Productos configurados en código:
  - `Fitso_Premium_Monthly`
  - `Fitso_Premium_Yearly`

### Configuración
- [x] ✅ `eas.json` configurado para builds
- [x] ✅ `subscriptionService.ts` con lógica completa
- [x] ✅ Entitlement ID: `entl0b12b2e363`

---

## ⚠️ **3. REVENUECAT DASHBOARD - REQUIERE VERIFICACIÓN**

### Lo que necesitas configurar en RevenueCat:

**Dashboard:** https://app.revenuecat.com

#### **a) Productos**
Ve a **Products** y verifica que existan:

| Product ID | Store Product ID | Precio | Duración |
|------------|------------------|--------|----------|
| `Fitso_Premium_Monthly` | (el que creaste en App Store) | $2.99 | 1 mes |
| `Fitso_Premium_Yearly` | (el que creaste en App Store) | $19.99 | 1 año |

#### **b) Entitlements**
Ve a **Entitlements** y verifica:
- [ ] Existe un entitlement llamado **"premium"** o similar
- [ ] Su ID es: `entl0b12b2e363` (el que está en tu código)
- [ ] Está asociado a los productos Monthly y Yearly

#### **c) Offerings**
Ve a **Offerings**:
- [ ] Existe un offering "default" o "current"
- [ ] Contiene los paquetes Monthly y Yearly

#### **d) Webhook**
Ve a **Integrations** → **Webhooks**:
- [x] ✅ URL: `https://fitso.onrender.com/api/webhooks/revenuecat`
- [x] ✅ Authorization: `Bearer WCucJsCMfue0GFPfXZcCmercF0EdgGOqXnjguERFkCQ=`
- [x] ✅ Eventos seleccionados: `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, etc.

---

## ⚠️ **4. APP STORE CONNECT - REQUIERE VERIFICACIÓN**

### Lo que necesitas configurar en App Store Connect:

**Dashboard:** https://appstoreconnect.apple.com

#### **a) In-App Purchases**
Ve a tu app → **Features** → **In-App Purchases**:

Crea 2 productos (si no existen):

**Producto 1: Monthly**
- [ ] Product ID: `fitso_premium_monthly` (o el que uses)
- [ ] Type: Auto-Renewable Subscription
- [ ] Subscription Group: "Fitso Premium"
- [ ] Duration: 1 Month
- [ ] Price: $2.99 USD

**Producto 2: Yearly**
- [ ] Product ID: `fitso_premium_yearly` (o el que uses)
- [ ] Type: Auto-Renewable Subscription
- [ ] Subscription Group: "Fitso Premium"
- [ ] Duration: 1 Year
- [ ] Price: $19.99 USD

#### **b) Sync con RevenueCat**
En RevenueCat Dashboard:
- [ ] Ve a **App Settings** → **Apple App Store**
- [ ] Verifica que esté conectado a tu App Store Connect
- [ ] Los productos deben aparecer automáticamente

#### **c) Sandbox Testers**
En App Store Connect → **Users and Access** → **Sandbox Testers**:
- [ ] Crea un usuario de prueba (ej: `test.fitso@icloud.com`)
- [ ] Este usuario podrá hacer compras gratis en TestFlight

---

## 🚀 **5. BUILD Y DEPLOY**

### Pasos para subir a TestFlight:

```bash
# 1. Login en EAS
eas login

# 2. Configurar credenciales de Apple (si no lo has hecho)
eas credentials

# 3. Crear build de producción
eas build --profile production --platform ios

# 4. Esperar a que termine el build (~15-20 min)
# EAS automáticamente lo subirá a TestFlight

# 5. Aprobar el build en App Store Connect
# Ve a TestFlight → Builds → Aprobar para testing
```

---

## 🧪 **6. TESTING EN TESTFLIGHT**

### Flujo de Prueba:

1. **Instalar app desde TestFlight**
   - Abre TestFlight en tu iPhone
   - Instala la última versión de Fitso

2. **Configurar Sandbox**
   - Settings → App Store → Cerrar sesión de tu Apple ID
   - NO inicies sesión, espera a que la app lo pida

3. **Crear usuario con código de afiliado**
   - Abre la app
   - Registro: `testflight1@gmail.com` / `211299`
   - En el onboarding, ingresa código: `ANGELUCHI`
   - Completa el perfil

4. **Abrir PremiumScreen**
   - Tap en el logo FITSO (arriba)
   - Deberías ver los planes Monthly ($2.99) y Yearly ($19.99)

5. **Hacer compra (Sandbox)**
   - Selecciona "Monthly"
   - Tap en "Subscribe Now"
   - La app te pedirá tu Apple ID → Usa el Sandbox Tester
   - Confirma la compra (gratis, no se cobra)

6. **Verificar Premium**
   - El logo FITSO debería cambiar (mostrar premium)
   - Deberías poder usar escaneo ilimitado

7. **Verificar Comisión**
   - Logout de `testflight1@gmail.com`
   - Login como: `angeluchi@gmail.com` / `211299`
   - Ir a perfil → Dashboard de afiliado
   - Deberías ver:
     - Premium Referrals: +1
     - Pending Commissions: +$2.39

---

## ⚠️ **PROBLEMAS COMUNES**

### "Producto no encontrado"
**Causa:** Los Product IDs en el código no coinciden con App Store Connect.

**Solución:**
1. Verifica los IDs en App Store Connect
2. Actualiza `subscriptionService.ts` si es necesario:
```typescript
const SUBSCRIPTION_PRODUCTS = [
  'fitso_premium_monthly',  // ← debe coincidir EXACTAMENTE
  'fitso_premium_yearly',
];
```

### "No entitlement active"
**Causa:** El Entitlement ID en el código no coincide con RevenueCat.

**Solución:**
1. Ve a RevenueCat → Entitlements
2. Copia el ID exacto
3. Actualiza `subscriptionService.ts`:
```typescript
const PREMIUM_ENTITLEMENT = 'tu_entitlement_id_aqui';
```

### "Webhook no se ejecuta"
**Causa:** El webhook puede tardar 30 segundos en procesarse.

**Solución:**
- Espera un momento después de la compra
- Si no funciona, revisa los logs de Render
- El endpoint `/subscriptions/purchase` debería funcionar instantáneamente

---

## 📊 **RESUMEN DEL CHECKLIST**

### ✅ LISTO PARA TESTFLIGHT:
- [x] Backend completo
- [x] Frontend completo
- [x] Webhooks configurados
- [x] Sistema de comisiones probado

### ⚠️ REQUIERE VERIFICACIÓN:
- [ ] Productos en RevenueCat Dashboard
- [ ] Entitlement ID correcto
- [ ] Productos en App Store Connect
- [ ] IDs coinciden entre código, RevenueCat y App Store
- [ ] Sandbox Tester creado

### 🚀 SIGUIENTE PASO:
1. Verifica los puntos en RevenueCat y App Store Connect
2. Crea el build: `eas build --profile production --platform ios`
3. Prueba en TestFlight con Sandbox Tester

---

## 💡 **CONCLUSIÓN**

**El código está 100% listo.** 

Solo necesitas verificar la configuración en RevenueCat Dashboard y App Store Connect para asegurarte de que:
- Los Product IDs coinciden
- El Entitlement ID es correcto
- Los productos están creados en ambos lugares

**¿Necesitas ayuda verificando alguno de estos puntos?**

