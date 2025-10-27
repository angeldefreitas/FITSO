# 🧪 Guía Completa de Testing - Sistema de Afiliados

## 📋 **OBJETIVO:**
Probar el flujo completo desde que un influencer recibe un código hasta que recibe su pago.

---

## 🎯 **FASE 1: CONFIGURACIÓN INICIAL**

### **Paso 1.1: Verificar que el Backend está Corriendo**

```bash
curl https://fitso.onrender.com/api/health
```

Deberías ver:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### **Paso 1.2: Preparar Credenciales de Admin**

Necesitas ser admin para crear códigos de afiliado. Tu email debe estar en la lista de admins.

**Verificar en el código:**
`src/config/adminConfig.ts`

Debería incluir tu email, por ejemplo:
```typescript
const adminEmails = [
  'admin@fitso.com',
  'tu-email@gmail.com',  // ← Tu email aquí
];
```

---

## 🎯 **FASE 2: CREAR CÓDIGO DE AFILIADO**

### **Opción A: Usar el Panel de Admin (Recomendado)**

1. **Abre tu app Fitso**
2. **Inicia sesión con tu cuenta de admin**
3. **Deberías ver un botón "⚙️ Admin Panel"** en la pantalla principal
4. **Haz clic en "Admin Panel"**
5. **Ve a la sección de Afiliados**
6. **Haz clic en "Crear Nuevo Afiliado"**

**Datos a ingresar:**
```
Nombre del Afiliado: FITNESS_INFLUENCER
Email (opcional): influencer@test.com
Porcentaje de Comisión: 30
```

7. **El sistema generará automáticamente un código único**
8. **Copia el código generado** (ej: "FITNESS_INFLUENCER")

### **Opción B: Usar API Directamente**

```bash
# Primero, obtén tu token de autenticación
# (después de iniciar sesión en la app)

curl -X POST https://fitso.onrender.com/api/affiliates/codes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_JWT_TOKEN_AQUI" \
  -d '{
    "affiliate_name": "FITNESS_INFLUENCER",
    "email": "influencer@test.com",
    "commission_percentage": 30
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "affiliate": {
    "id": "...",
    "code": "FITNESS_INFLUENCER",
    "affiliate_name": "FITNESS_INFLUENCER",
    "email": "influencer@test.com",
    "commission_percentage": 30,
    "is_active": true
  }
}
```

### **Paso 2.2: Verificar que el Código Existe**

```bash
curl https://fitso.onrender.com/api/affiliates/codes \
  -H "Authorization: Bearer TU_JWT_TOKEN"
```

Deberías ver tu código en la lista.

---

## 🎯 **FASE 3: REGISTRAR USUARIO CON CÓDIGO DE REFERENCIA**

### **Paso 3.1: Crear Nueva Cuenta de Usuario**

1. **Cierra sesión de tu cuenta admin** (o usa otro dispositivo)
2. **Abre la app Fitso**
3. **Haz clic en "Registrarse" o "Sign Up"**
4. **Completa el registro:**
   ```
   Nombre: Usuario Test
   Email: usuario.test@gmail.com
   Contraseña: Test123456!
   ```
5. **Completa los datos biométricos:**
   ```
   Peso: 70 kg
   Altura: 170 cm
   Edad: 25 años
   Sexo: Masculino
   Objetivo: Perder peso
   ```

### **Paso 3.2: Ingresar Código de Referencia**

Después de completar los datos biométricos, la app te preguntará:

**"¿Tienes un código de referencia?"**

1. **Selecciona "Sí"**
2. **Ingresa el código:** `FITNESS_INFLUENCER`
3. **Haz clic en "Validar"**
4. **Deberías ver un mensaje:** "✅ Código válido"
5. **Haz clic en "Continuar"**

### **Paso 3.3: Verificar que el Referido se Registró**

**Desde el backend:**
```bash
curl https://fitso.onrender.com/api/affiliates/stats/FITNESS_INFLUENCER \
  -H "Authorization: Bearer TOKEN_DEL_INFLUENCER"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "stats": {
    "total_referrals": 1,  // ← Debe ser 1
    "premium_referrals": 0,
    "total_commissions": 0,
    "pending_commissions": 0,
    "paid_commissions": 0
  }
}
```

---

## 🎯 **FASE 4: COMPRAR SUSCRIPCIÓN (MODO SANDBOX)**

### **Paso 4.1: Acceder a la Pantalla de Premium**

1. **En la app, ve al perfil o configuración**
2. **Busca "Hacerse Premium" o "Upgrade to Premium"**
3. **Deberías ver las opciones de suscripción:**
   ```
   - Mensual: $9.99/mes
   - Anual: $99.99/año
   ```

### **Paso 4.2: Realizar Compra en Sandbox**

**Para iOS (Sandbox):**
1. Asegúrate de tener una cuenta de Sandbox de Apple configurada
2. Ve a Ajustes → iTunes y App Store → Cerrar sesión
3. Al comprar, te pedirá credenciales
4. Usa tu cuenta de Sandbox de Apple

**Para Android (Sandbox):**
1. Asegúrate de estar usando una cuenta de prueba de Google Play
2. La compra se procesará en modo de prueba

**Para Testing sin Store (Bypass de RevenueCat):**
Si quieres probar sin hacer una compra real, puedes simular el webhook:

```bash
curl -X POST https://fitso.onrender.com/api/webhooks/revenuecat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer WCucJsCMfue0GFPfXZcCmercF0EdgGOqXnjguERFkCQ=" \
  -d '{
    "event": {
      "type": "INITIAL_PURCHASE",
      "app_user_id": "USUARIO_TEST_ID",
      "product_id": "Fitso_Premium_Monthly",
      "id": "test_transaction_123",
      "price": 9.99,
      "currency": "USD",
      "purchased_at_ms": 1635456789000,
      "expiration_at_ms": 1638048789000
    },
    "api_version": "1.0"
  }'
```

**IMPORTANTE:** Reemplaza `USUARIO_TEST_ID` con el ID real del usuario de prueba.

---

## 🎯 **FASE 5: VERIFICAR QUE SE GENERÓ LA COMISIÓN**

### **Paso 5.1: Ver en los Logs de Render**

Ve a Render Dashboard → Tu servicio → Logs

Busca:
```
🎉 [REVENUECAT] Primera compra detectada
👤 [REVENUECAT] Usuario: USUARIO_TEST_ID
📦 [REVENUECAT] Producto: Fitso_Premium_Monthly
💰 [REVENUECAT] Precio: 9.99 USD
✅ [REVENUECAT] Comisión inicial generada: $2.997
```

### **Paso 5.2: Verificar en la Base de Datos**

**Conectar a PostgreSQL:**
```bash
# Obtén la URL de conexión de Render
psql postgresql://fitso_user_8x0j:PASSWORD@dpg-d0j8v8h8s0s738f8a8pg-a.oregon-postgres.render.com/fitso_db_8x0j
```

**Consultar comisiones:**
```sql
-- Ver todas las comisiones
SELECT * FROM affiliate_commissions ORDER BY created_at DESC LIMIT 5;

-- Ver comisiones del código específico
SELECT 
  ac.code,
  ac.affiliate_name,
  afc.user_id,
  afc.subscription_amount,
  afc.commission_amount,
  afc.is_paid,
  afc.created_at
FROM affiliate_commissions afc
JOIN affiliate_codes ac ON afc.affiliate_code = ac.code
WHERE ac.code = 'FITNESS_INFLUENCER';
```

**Resultado esperado:**
```
 code              | affiliate_name     | user_id | subscription_amount | commission_amount | is_paid | created_at
-------------------+--------------------+---------+---------------------+-------------------+---------+------------
 FITNESS_INFLUENCER| FITNESS_INFLUENCER | user123 | 9.99                | 2.997             | false   | 2025-10-27...
```

### **Paso 5.3: Verificar Estadísticas del Afiliado**

```bash
curl https://fitso.onrender.com/api/affiliates/stats/FITNESS_INFLUENCER \
  -H "Authorization: Bearer TOKEN_DEL_INFLUENCER"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "stats": {
    "total_referrals": 1,
    "premium_referrals": 1,  // ← Ahora debe ser 1
    "total_commissions": 2.997,  // ← $2.997
    "pending_commissions": 2.997,
    "paid_commissions": 0,
    "conversion_rate": 100.0
  }
}
```

---

## 🎯 **FASE 6: VER COMISIÓN EN DASHBOARD DEL AFILIADO**

### **Paso 6.1: Marcar Usuario como Afiliado**

Primero, el influencer necesita tener una cuenta y estar marcado como afiliado.

**Opción A: Desde el backend (script):**
```bash
cd /Users/angeldefreitas/Projects/fit-mvp/backend
node scripts/make-user-affiliate.js influencer@test.com
```

**Opción B: Directamente en la base de datos:**
```sql
UPDATE users 
SET is_affiliate = true 
WHERE email = 'influencer@test.com';
```

### **Paso 6.2: Iniciar Sesión como Afiliado**

1. **Abre la app Fitso**
2. **Inicia sesión con:** `influencer@test.com`
3. **Deberías ver un botón "📊 Mi Dashboard"** en la pantalla principal
4. **Haz clic en "Mi Dashboard"**

### **Paso 6.3: Ver las Comisiones en el Dashboard**

En el dashboard deberías ver:

```
┌─────────────────────────────────────────┐
│  DASHBOARD DE AFILIADO                  │
├─────────────────────────────────────────┤
│                                         │
│  Total Referidos: 1                     │
│  Conversiones Premium: 1                │
│  Tasa de Conversión: 100%               │
│                                         │
│  💰 Comisiones                          │
│  Total Generado: $2.997                 │
│  Pagado: $0.00                          │
│  Pendiente: $2.997                      │
│                                         │
│  📋 Historial de Comisiones             │
│  ┌───────────────────────────────────┐ │
│  │ Usuario: usuario.test@gmail.com   │ │
│  │ Suscripción: $9.99                │ │
│  │ Comisión: $2.997 (30%)            │ │
│  │ Estado: Pendiente                 │ │
│  │ Fecha: 27 Oct 2025                │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🎯 **FASE 7: PROBAR RENOVACIÓN (COMISIÓN RECURRENTE)**

### **Paso 7.1: Simular Renovación**

Después de un mes (o para testing, simulamos):

```bash
curl -X POST https://fitso.onrender.com/api/webhooks/revenuecat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer WCucJsCMfue0GFPfXZcCmercF0EdgGOqXnjguERFkCQ=" \
  -d '{
    "event": {
      "type": "RENEWAL",
      "app_user_id": "USUARIO_TEST_ID",
      "product_id": "Fitso_Premium_Monthly",
      "id": "test_renewal_456",
      "price": 9.99,
      "currency": "USD",
      "purchased_at_ms": 1638048789000,
      "expiration_at_ms": 1640640789000
    },
    "api_version": "1.0"
  }'
```

### **Paso 7.2: Verificar Nueva Comisión**

**En logs:**
```
🔄 [REVENUECAT] Renovación detectada
✅ [REVENUECAT] Comisión recurrente generada: $2.997
```

**En base de datos:**
```sql
SELECT COUNT(*) as total_comisiones 
FROM affiliate_commissions 
WHERE affiliate_code = 'FITNESS_INFLUENCER';
```

Debería mostrar: `2` (inicial + renovación)

**En dashboard del afiliado:**
```
Total Generado: $5.994  (2 x $2.997)
Pendiente: $5.994
```

---

## 🎯 **FASE 8: PAGAR AL AFILIADO (STRIPE)**

### **Paso 8.1: Ver Comisiones Pendientes (Como Admin)**

1. **Inicia sesión como admin**
2. **Ve al Admin Panel**
3. **Ve a "Pagos Pendientes" o "Comisiones Pendientes"**

Deberías ver:
```
┌─────────────────────────────────────────┐
│  COMISIONES PENDIENTES DE PAGO          │
├─────────────────────────────────────────┤
│                                         │
│  Afiliado: FITNESS_INFLUENCER           │
│  Email: influencer@test.com             │
│  Total Pendiente: $5.994                │
│  Comisiones: 2                          │
│  [Procesar Pago]                        │
│                                         │
└─────────────────────────────────────────┘
```

### **Paso 8.2: Configurar Cuenta de Stripe del Afiliado**

Antes de poder pagar, el afiliado necesita conectar su cuenta de Stripe.

**Opción A: Desde el Dashboard del Afiliado**
1. El afiliado inicia sesión
2. Ve a su dashboard
3. Haz clic en "Conectar Cuenta de Stripe"
4. Sigue el proceso de Stripe Connect

**Opción B: Simular sin Stripe (para testing)**
```sql
-- Marcar comisiones como pagadas manualmente (solo para testing)
UPDATE affiliate_commissions 
SET is_paid = true, 
    paid_at = CURRENT_TIMESTAMP 
WHERE affiliate_code = 'FITNESS_INFLUENCER' 
AND is_paid = false;
```

### **Paso 8.3: Procesar Pago Real con Stripe**

**Desde el Admin Panel:**
1. Selecciona el afiliado
2. Haz clic en "Procesar Pago"
3. Confirma el monto: $5.994
4. El sistema creará una transferencia en Stripe

**Desde la API:**
```bash
curl -X POST https://fitso.onrender.com/api/affiliates/process-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "affiliate_code": "FITNESS_INFLUENCER",
    "amount": 5.994
  }'
```

### **Paso 8.4: Stripe Procesa el Pago**

1. Stripe crea la transferencia
2. Envía webhook a tu servidor
3. Tu servidor actualiza el estado:

```
📨 [STRIPE] Webhook recibido: transfer.created
💰 [STRIPE] Transferencia creada: $5.994
✅ [WEBHOOK] Estado de pago actualizado
```

### **Paso 8.5: Verificar Pago en Dashboard**

El afiliado debería ver:
```
Total Generado: $5.994
Pagado: $5.994  ✅
Pendiente: $0.00
```

---

## 🎯 **FASE 9: PROBAR CANCELACIÓN**

### **Paso 9.1: Usuario Cancela Suscripción**

```bash
curl -X POST https://fitso.onrender.com/api/webhooks/revenuecat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer WCucJsCMfue0GFPfXZcCmercF0EdgGOqXnjguERFkCQ=" \
  -d '{
    "event": {
      "type": "CANCELLATION",
      "app_user_id": "USUARIO_TEST_ID",
      "product_id": "Fitso_Premium_Monthly",
      "id": "test_cancellation_789"
    },
    "api_version": "1.0"
  }'
```

### **Paso 9.2: Verificar que NO se Generan Más Comisiones**

**En logs:**
```
❌ [REVENUECAT] Cancelación detectada
ℹ️ [REVENUECAT] Usuario USUARIO_TEST_ID canceló suscripción
ℹ️ [REVENUECAT] No se generarán más comisiones automáticamente
```

Si el usuario renueva después de esto, NO debería generar nueva comisión hasta que vuelva a suscribirse.

---

## 📊 **FASE 10: VERIFICACIÓN COMPLETA**

### **Checklist Final:**

```
✅ Código de afiliado creado
✅ Usuario registrado con código
✅ Referido aparece en estadísticas (total_referrals = 1)
✅ Usuario compró suscripción
✅ Comisión inicial generada ($2.997)
✅ Conversión registrada (premium_referrals = 1)
✅ Comisión visible en dashboard del afiliado
✅ Renovación procesada correctamente
✅ Segunda comisión generada ($2.997)
✅ Total de comisiones = $5.994
✅ Pago procesado vía Stripe
✅ Comisiones marcadas como pagadas
✅ Dashboard actualizado (pagado = $5.994)
✅ Cancelación detectada
✅ No más comisiones después de cancelación
```

---

## 🛠️ **COMANDOS ÚTILES PARA DEBUGGING**

### **Ver Estado del Usuario:**
```sql
SELECT u.id, u.email, u.is_affiliate, u.is_admin,
       ur.affiliate_code, ur.is_premium
FROM users u
LEFT JOIN user_referrals ur ON u.id = ur.user_id
WHERE u.email = 'usuario.test@gmail.com';
```

### **Ver Todas las Comisiones:**
```sql
SELECT ac.code, ac.affiliate_name,
       COUNT(afc.id) as total_comisiones,
       SUM(afc.commission_amount) as total_amount,
       SUM(CASE WHEN afc.is_paid THEN afc.commission_amount ELSE 0 END) as paid_amount
FROM affiliate_codes ac
LEFT JOIN affiliate_commissions afc ON ac.code = afc.affiliate_code
GROUP BY ac.code, ac.affiliate_name;
```

### **Ver Referidos de un Afiliado:**
```sql
SELECT ur.user_id, u.email, ur.is_premium, ur.created_at
FROM user_referrals ur
JOIN users u ON ur.user_id = u.id
WHERE ur.affiliate_code = 'FITNESS_INFLUENCER';
```

### **Resetear Comisiones (para re-testing):**
```sql
-- ⚠️ SOLO PARA TESTING - ESTO BORRA DATOS
DELETE FROM affiliate_commissions WHERE affiliate_code = 'FITNESS_INFLUENCER';
UPDATE user_referrals SET is_premium = false WHERE affiliate_code = 'FITNESS_INFLUENCER';
```

---

## 🎯 **ESCENARIOS DE TESTING ADICIONALES**

### **Escenario 1: Usuario SIN Código de Referencia**
1. Registra usuario sin código
2. Usuario compra premium
3. Verifica que NO se genere comisión

### **Escenario 2: Código Inválido**
1. Usuario intenta usar código "FAKE_CODE"
2. Sistema debe rechazar: "Código inválido"
3. Usuario NO puede continuar con código inválido

### **Escenario 3: Usuario Ya Premium**
1. Usuario con código se hace premium
2. Usuario cancela
3. Usuario vuelve a suscribirse
4. Verifica que se genere nueva comisión

### **Escenario 4: Múltiples Referidos**
1. Crea 5 usuarios con el mismo código
2. 3 se hacen premium
3. Verifica: total_referrals = 5, premium_referrals = 3, tasa = 60%

### **Escenario 5: Diferentes Porcentajes**
1. Crea afiliado con 25% de comisión
2. Usuario compra $9.99
3. Verifica comisión = $2.4975

---

## 🚨 **PROBLEMAS COMUNES Y SOLUCIONES**

### **Problema 1: "No se genera comisión"**
**Causas:**
- Usuario no tiene código de referencia en `user_referrals`
- Código no existe en `affiliate_codes`
- Código está inactivo

**Solución:**
```sql
-- Verificar referencia
SELECT * FROM user_referrals WHERE user_id = 'USER_ID';

-- Verificar código
SELECT * FROM affiliate_codes WHERE code = 'FITNESS_INFLUENCER';
```

### **Problema 2: "Webhook no llega"**
**Causas:**
- URL incorrecta en RevenueCat
- Authorization header incorrecto
- Servidor no está corriendo

**Solución:**
- Verifica URL: `https://fitso.onrender.com/api/webhooks/revenuecat`
- Verifica logs en Render
- Prueba endpoint de test: `/api/webhooks/revenuecat/test`

### **Problema 3: "Dashboard no muestra comisiones"**
**Causas:**
- Usuario no está marcado como afiliado
- Token de autenticación inválido
- Código de afiliado no coincide con usuario

**Solución:**
```sql
-- Marcar como afiliado
UPDATE users SET is_affiliate = true WHERE email = 'influencer@test.com';

-- Vincular código con usuario
-- (esto debería hacerse automáticamente cuando crean su cuenta)
```

---

## 📞 **SOPORTE**

Si encuentras problemas durante el testing:

1. **Revisa logs de Render** - La mayoría de errores están ahí
2. **Verifica base de datos** - Usa las queries de arriba
3. **Prueba endpoints individualmente** - Aísla el problema
4. **Verifica variables de entorno** - Especialmente los secrets

---

**¡Listo para empezar el testing!** 🚀

Empieza por la Fase 2 (Crear Código de Afiliado) y sigue paso a paso.

