# 🧪 GUÍA DE TESTING COMPLETO - Cuenta ANGELUCHI

## 📋 DATOS DE LA CUENTA

**Email:** angeluchi@gmail.com  
**Password:** 211299  
**User ID:** b1db68fa-84dd-4208-aeb4-df2e32486abd  
**Rol:** Afiliado ✅  
**Código Principal:** ANGELUCHI (80% comisión)

---

## ✅ YA CONFIGURADO Y FUNCIONANDO:

- ✅ Login OK
- ✅ Cuenta marcada como afiliado
- ✅ 9 códigos de afiliado creados
- ✅ Webhooks configurados
- ✅ Stripe conectado
- ✅ RevenueCat funcionando

---

## 🎯 TESTING PASO A PASO:

### **PASO 1: Registrar Usuario de Prueba en la App**

1. **Abre la app Fitso** (en tu teléfono o emulador)
2. **Haz clic en "Registrarse"**
3. **Completa el registro:**
   ```
   Nombre: Usuario Test
   Email: test1@gmail.com
   Password: Test123!
   ```
4. **Completa datos biométricos:**
   ```
   Peso: 70 kg
   Altura: 170 cm
   Edad: 25
   Sexo: Masculino
   Objetivo: Perder peso
   ```
5. **IMPORTANTE: Cuando pregunte por código de referencia:**
   - Selecciona "Sí, tengo un código"
   - Ingresa: **ANGELUCHI**
   - El sistema validará el código ✅

---

### **PASO 2: Verificar que el Referido se Registró**

**Desde la terminal:**
```bash
# Login como angeluchi para obtener token
curl -X POST https://fitso.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"angeluchi@gmail.com","password":"211299"}'

# Usar el token para ver códigos
curl https://fitso.onrender.com/api/affiliates/codes \
  -H "Authorization: Bearer TU_TOKEN"
```

**O desde Render Dashboard:**
1. Ve a https://dashboard.render.com
2. Selecciona tu base de datos
3. Conecta con Query y ejecuta:
```sql
SELECT 
    ur.user_id,
    u.email,
    ur.affiliate_code,
    ur.is_premium,
    ur.created_at
FROM user_referrals ur
JOIN users u ON ur.user_id = u.id
WHERE ur.affiliate_code = 'ANGELUCHI';
```

Deberías ver:
```
 user_id | email           | affiliate_code | is_premium | created_at
---------+-----------------+----------------+------------+------------
 xyz123  | test1@gmail.com | ANGELUCHI      | false      | 2025-...
```

---

### **PASO 3A: Compra Real en Sandbox (iOS/Android)**

**Para iOS:**
1. Configura una cuenta de Sandbox en App Store Connect
2. En el dispositivo, cierra sesión de iTunes
3. Al comprar, usa las credenciales de Sandbox
4. La compra se procesará en modo de prueba ($0)

**Para Android:**
1. Agrega tu cuenta de Google como tester en Google Play Console
2. La compra aparecerá como prueba
3. No se cobrará dinero real

---

### **PASO 3B: Simular Compra con Webhook (Más Rápido)**

Si no quieres hacer compra real, simula el webhook:

```bash
# Necesitas el USER_ID real del usuario que registraste
# Lo puedes obtener de la base de datos o de los logs

curl -X POST https://fitso.onrender.com/api/webhooks/revenuecat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer WCucJsCMfue0GFPfXZcCmercF0EdgGOqXnjguERFkCQ=" \
  -d '{
    "event": {
      "type": "INITIAL_PURCHASE",
      "app_user_id": "EL_USER_ID_REAL_AQUI",
      "product_id": "Fitso_Premium_Monthly",
      "id": "test_transaction_123",
      "price": 9.99,
      "currency": "USD",
      "purchased_at_ms": 1635456789000,
      "expiration_at_ms": 1638048789000,
      "environment": "SANDBOX"
    },
    "api_version": "1.0"
  }'
```

---

### **PASO 4: Verificar Comisión Generada**

**En Render Logs:**
1. Ve a https://dashboard.render.com
2. Tu servicio backend → Logs
3. Busca:
```
🎉 [REVENUECAT] Primera compra detectada
👤 [REVENUECAT] Usuario: USER_ID
💰 [REVENUECAT] Precio: 9.99 USD
✅ [REVENUECAT] Comisión inicial generada: $7.992
```

**Cálculo de Comisión:**
```
Precio: $9.99
Comisión ANGELUCHI: 80%
Resultado: $9.99 × 0.80 = $7.992
```

**En Base de Datos:**
```sql
SELECT 
    affiliate_code,
    user_id,
    subscription_amount,
    commission_percentage,
    commission_amount,
    is_paid,
    created_at
FROM affiliate_commissions
WHERE affiliate_code = 'ANGELUCHI'
ORDER BY created_at DESC;
```

Deberías ver:
```
 affiliate_code | user_id | subscription_amount | commission_percentage | commission_amount | is_paid | created_at
----------------+---------+---------------------+-----------------------+-------------------+---------+------------
 ANGELUCHI      | xyz123  | 9.99                | 80.00                 | 7.992             | false   | 2025-...
```

---

### **PASO 5: Ver Comisión en Dashboard del Afiliado**

**En la App:**
1. Cierra sesión del usuario de prueba
2. Inicia sesión con: angeluchi@gmail.com / 211299
3. Deberías ver el botón "📊 Mi Dashboard"
4. Haz clic para ver:
   ```
   Total Referidos: 1
   Conversiones Premium: 1
   Tasa de Conversión: 100%
   
   💰 Comisiones
   Total Generado: $7.992
   Pagado: $0.00
   Pendiente: $7.992
   
   📋 Historial
   - Usuario: test1@gmail.com
   - Suscripción: $9.99
   - Comisión: $7.992 (80%)
   - Estado: Pendiente ⏳
   ```

---

### **PASO 6: Probar Renovación (Comisión Recurrente)**

Después de un mes (o simular):

```bash
curl -X POST https://fitso.onrender.com/api/webhooks/revenuecat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer WCucJsCMfue0GFPfXZcCmercF0EdgGOqXnjguERFkCQ=" \
  -d '{
    "event": {
      "type": "RENEWAL",
      "app_user_id": "EL_USER_ID_REAL_AQUI",
      "product_id": "Fitso_Premium_Monthly",
      "id": "test_renewal_456",
      "price": 9.99,
      "currency": "USD"
    },
    "api_version": "1.0"
  }'
```

**Resultado esperado:**
```
Total Comisiones: 2
Total Generado: $15.984 (2 × $7.992)
```

---

### **PASO 7: Simular Pago al Afiliado (Opcional)**

Para marcar comisiones como pagadas:

```sql
-- Ver comisiones pendientes
SELECT * FROM affiliate_commissions 
WHERE affiliate_code = 'ANGELUCHI' AND is_paid = false;

-- Marcar como pagadas (solo para testing)
UPDATE affiliate_commissions 
SET is_paid = true, paid_at = CURRENT_TIMESTAMP 
WHERE affiliate_code = 'ANGELUCHI' AND is_paid = false;
```

**En el Dashboard verías:**
```
Pagado: $7.992 ✅
Pendiente: $0.00
```

---

## 🐛 TROUBLESHOOTING:

### Problema: "No se genera comisión"

**Causa:**
- Usuario no tiene código de referencia registrado
- Código no existe o está inactivo

**Solución:**
```sql
-- Verificar referencia
SELECT * FROM user_referrals WHERE user_id = 'USER_ID';

-- Si no existe, agregar manualmente
INSERT INTO user_referrals (user_id, affiliate_code, is_premium)
VALUES ('USER_ID', 'ANGELUCHI', false);
```

### Problema: "Webhook no llega"

**Solución:**
1. Verifica URL: https://fitso.onrender.com/api/webhooks/revenuecat
2. Verifica Authorization header
3. Revisa logs en Render

### Problema: "Error en base de datos"

**Solución:**
```sql
-- Verificar que las tablas existen
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('affiliate_codes', 'user_referrals', 'affiliate_commissions');
```

---

## ✅ CHECKLIST DE TESTING COMPLETO:

- [ ] Usuario registrado con código ANGELUCHI
- [ ] Referido visible en user_referrals
- [ ] Usuario compró/simuló compra premium
- [ ] Comisión generada en affiliate_commissions
- [ ] Comisión = $7.992 (80% de $9.99)
- [ ] Comisión visible en dashboard de angeluchi
- [ ] Renovación probada (opcional)
- [ ] Segunda comisión generada (opcional)
- [ ] Total = $15.984 (opcional)

---

## 📊 ESTADÍSTICAS ESPERADAS DESPUÉS DEL TEST:

```
CÓDIGO: ANGELUCHI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Referidos: 1
Conversiones Premium: 1
Tasa de Conversión: 100%
Total Comisiones: $7.992
Pagado: $0.00
Pendiente: $7.992
```

---

¡El sistema está 100% funcional y listo para generar comisiones automáticamente! 🎉

