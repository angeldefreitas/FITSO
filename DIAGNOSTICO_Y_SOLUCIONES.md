# 🔍 Diagnóstico Completo y Soluciones

## ❌ PROBLEMAS ENCONTRADOS

### 1. **Errores de Base de Datos** ✅ SOLUCIONADO

#### Error A: `column ur.affiliate_code_id does not exist`
- **Causa:** Los queries usaban `ur.affiliate_code_id` 
- **Realidad:** La columna es `ur.affiliate_code` (tipo TEXT, no FK)
- **Archivos afectados:**
  - `backend/src/monetization/models/AffiliateCode.js`
  - `backend/src/monetization/controllers/simpleAffiliateDashboardController.js`

**Solución aplicada:**
```javascript
// ANTES (❌ Incorrecto)
LEFT JOIN user_referrals ur ON ac.id = ur.affiliate_code_id

// DESPUÉS (✅ Correcto)
LEFT JOIN user_referrals ur ON ac.code = ur.affiliate_code
```

#### Error B: `column ac.status does not exist`
- **Causa:** Los queries usaban `ac.status = 'paid'`
- **Realidad:** La columna es `ac.is_paid` (tipo BOOLEAN)
- **Archivo afectado:**
  - `backend/src/monetization/models/AffiliateCommission.js`

**Solución aplicada:**
```javascript
// ANTES (❌ Incorrecto)
SUM(CASE WHEN ac.status = 'paid' THEN ac.commission_amount ELSE 0 END)

// DESPUÉS (✅ Correcto)
SUM(CASE WHEN ac.is_paid = true THEN ac.commission_amount ELSE 0 END)
```

---

### 2. **Código de Referencia No Se Guarda** ❌ PENDIENTE DE TESTING

#### Problema
1. El código `ANGELUCHI` se **valida correctamente** ✅
2. Pero **NO se registra** en `user_referrals` ❌
3. Por eso el usuario ve "No tienes código de referencia"

#### Causa Raíz
El componente `ReferralCodeInput.tsx` solo **valida** el código, pero no lo **registra**. El flujo actual es:

```
1. Usuario ingresa "ANGELUCHI"
2. ReferralCodeInput valida el código ✅
3. ReferralCodeScreen debería registrarlo
4. Pero hay un error y no se registra ❌
```

#### Solución Implementada

**Nuevo componente:** `ReferralCodeScreenV2.tsx`

**Flujo mejorado:**
```javascript
1. Usuario ingresa código
2. Validar código (endpoint público): /api/affiliates/validate/:code ✅
3. Si válido, registrar código (endpoint autenticado): POST /api/affiliates/referral ✅
4. Guardar en user_referrals con user_id ✅
```

**Código clave:**
```typescript
// 1. Validar primero
const validationResponse = await affiliateApiService.validateAffiliateCode(code);

// 2. Si válido, registrar
if (validationResponse.success) {
  await affiliateApiService.registerReferralCode(code);
  // Ahora SÍ se guarda en la base de datos
}
```

---

## ✅ SOLUCIONES DESPLEGADAS

### 1. **Corrección de Queries de Base de Datos**
- **Commit:** `Fix database column references in affiliate queries`
- **Estado:** ✅ Desplegado en Render
- **Archivos modificados:**
  - `AffiliateCode.js`
  - `AffiliateCommission.js`
  - `simpleAffiliateDashboardController.js`

### 2. **Nuevo Componente de Registro**
- **Archivo:** `src/components/affiliates/screens/ReferralCodeScreenV2.tsx`
- **Estado:** ✅ Creado, pendiente de despliegue
- **Características:**
  - Valida el código primero
  - Luego lo registra en la BD
  - Manejo completo de errores
  - UI/UX mejorado

---

## 🔄 PRÓXIMOS PASOS

### Paso 1: Desplegar los Cambios Frontend (5 min)
```bash
git add .
git commit -m "Add ReferralCodeScreenV2 with proper registration flow"
git push origin main
```

### Paso 2: Probar con Usuario Real
1. **Crear un nuevo usuario** (no usar test2@gmail.com)
2. **Ingresar código:** ANGELUCHI
3. **Verificar en Render logs:**
   ```
   ✅ [REVENUECAT] Código validado: ANGELUCHI
   ✅ [AFFILIATES] Código registrado en user_referrals
   ```

### Paso 3: Verificar en Base de Datos
```sql
-- Ver referidos del afiliado
SELECT 
  ur.*,
  u.email as referido_email
FROM user_referrals ur
JOIN users u ON ur.user_id = u.id
WHERE ur.affiliate_code = 'ANGELUCHI';
```

### Paso 4: Dashboard de Angeluchi Ahora Funciona
- **Login:** angeluchi@gmail.com
- **Ver dashboard:** Debería mostrar 1+ referidos
- **Sin errores:** Los queries ahora usan las columnas correctas

---

## 📊 ESQUEMA DE BASE DE DATOS CORRECTO

### Tabla `user_referrals`
```sql
CREATE TABLE user_referrals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  affiliate_code TEXT,  -- ⚠️ Es TEXT, no UUID
  created_at TIMESTAMP,
  is_premium BOOLEAN
);
```

### Tabla `affiliate_commissions`
```sql
CREATE TABLE affiliate_commissions (
  id UUID PRIMARY KEY,
  affiliate_id UUID,
  affiliate_code TEXT,  -- ⚠️ Es TEXT, no UUID
  user_id UUID,
  commission_amount DECIMAL,
  commission_percentage INT,
  is_paid BOOLEAN,      -- ⚠️ Es BOOLEAN, no 'status'
  created_at TIMESTAMP
);
```

### Tabla `affiliate_codes`
```sql
CREATE TABLE affiliate_codes (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE,
  affiliate_name TEXT,
  commission_percentage INT,
  is_active BOOLEAN,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP
);
```

---

## 🧪 TESTING COMPLETO

### Test 1: Dashboard de Angeluchi
```bash
# Login
POST https://fitso.onrender.com/api/auth/login
{
  "email": "angeluchi@gmail.com",
  "password": "211299"
}

# Dashboard (ahora debería funcionar)
GET https://fitso.onrender.com/api/affiliates/simple-dashboard
Authorization: Bearer <token>
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "total_referrals": 0,
    "premium_referrals": 0,
    "total_commissions": 0,
    "conversion_rate": 0,
    "affiliate_code": "ANGELUCHI"
  }
}
```

### Test 2: Registro de Código
```bash
# Registrar código ANGELUCHI
POST https://fitso.onrender.com/api/affiliates/referral
Authorization: Bearer <token_usuario_nuevo>
{
  "referral_code": "ANGELUCHI"
}
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Código de referencia registrado correctamente"
}
```

### Test 3: Verificar Referido
```bash
# Ver mi referido
GET https://fitso.onrender.com/api/affiliates/my-referral
Authorization: Bearer <token_usuario_nuevo>
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "affiliate_code": "ANGELUCHI",
    "affiliate_name": "Angeluchi",
    "registered_at": "2025-10-27T..."
  }
}
```

---

## 🎯 RESUMEN

### ✅ Problemas Solucionados
1. **Queries con columnas incorrectas** → Corregido
2. **Dashboard fallando** → Debería funcionar ahora
3. **Códigos no se guardan** → Nuevo flujo implementado

### ⏳ Pendiente
1. **Desplegar** los cambios del frontend
2. **Probar** con un usuario nuevo
3. **Verificar** que el código se guarde en `user_referrals`

### 🚀 Siguiente Fase
Una vez que esto funcione, podemos probar:
1. **Compra de suscripción** con RevenueCat
2. **Generación de comisión** automática
3. **Pagos a afiliados** con Stripe

---

## 📞 SOPORTE

Si encuentras más errores:
1. Revisa los logs de Render
2. Verifica las columnas en la base de datos
3. Comprueba que el token de autenticación sea válido
4. Asegúrate de usar endpoints correctos (`/api/affiliates/*`)

