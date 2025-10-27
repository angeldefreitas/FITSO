# 🚨 MIGRACIÓN URGENTE: Corregir Tipo de Columna

## ❌ **PROBLEMA ACTUAL**

```
Error: invalid input syntax for type uuid: "test7_purchase_1761587406"
```

La columna `subscription_id` en `affiliate_commissions` está definida como **UUID** pero debería ser **TEXT** porque los `transaction_id` de RevenueCat son strings, no UUIDs.

---

## 🔧 **SOLUCIÓN: Ejecutar SQL desde Render**

### **Paso 1: Acceder a la Base de Datos**

1. Ve a: https://dashboard.render.com
2. Busca tu servicio de PostgreSQL
3. Click en **"Connect"** o **"Shell"**

### **Paso 2: Ejecutar este SQL**

Copia y pega este comando completo:

```sql
-- Cambiar subscription_id de UUID a TEXT
BEGIN;

ALTER TABLE affiliate_commissions 
ALTER COLUMN subscription_id TYPE TEXT USING subscription_id::TEXT;

-- Verificar el cambio
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'affiliate_commissions' 
  AND column_name = 'subscription_id';

COMMIT;
```

### **Paso 3: Verificar que Funcionó**

Deberías ver algo como:

```
 column_name      | data_type | is_nullable
------------------+-----------+-------------
 subscription_id  | text      | NO

COMMIT
```

---

## ✅ **DESPUÉS DE LA MIGRACIÓN**

Vuelve a probar la compra simulada:

```bash
cd /Users/angeldefreitas/Projects/fit-mvp

curl -X POST https://fitso.onrender.com/api/webhooks/revenuecat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer WCucJsCMfue0GFPfXZcCmercF0EdgGOqXnjguERFkCQ=" \
  -d @test7-purchase.json
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Webhook procesado"
}
```

---

## 📊 **VERIFICAR COMISIÓN GENERADA**

Desde Render (o con curl):

```bash
# Login como angeluchi
curl -s -X POST https://fitso.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "angeluchi@gmail.com", "password": "211299"}' \
  | jq -r '.data.token' > /tmp/token.txt

# Ver dashboard
curl -s -X GET https://fitso.onrender.com/api/affiliates/simple-dashboard \
  -H "Authorization: Bearer $(cat /tmp/token.txt)" \
  | jq '.data'
```

**Deberías ver:**
```json
{
  "total_referrals": 6,
  "premium_referrals": 2,  ⬅️ Aumentó
  "pending_commissions": 18.37  ⬅️ $15.98 + $2.39
}
```

---

## 🎯 **POR QUÉ ESTE ERROR**

RevenueCat envía `transaction_id` como strings:
- ✅ Correcto: `"test7_purchase_1761587406"` → TEXT
- ❌ Incorrecto: Intentar convertir a UUID → Error

El schema original asumía que serían UUIDs, pero RevenueCat usa strings arbitrarios.

---

## 📝 **ALTERNATIVA: SQL Directo (Sin Dashboard)**

Si no puedes acceder al dashboard, puedes usar `psql`:

```bash
# Desde tu terminal (necesitas la URL de conexión de Render)
psql "postgresql://fitso_db_user:PASSWORD@dpg-xxxxx.oregon-postgres.render.com/fitso_db" \
  -c "ALTER TABLE affiliate_commissions ALTER COLUMN subscription_id TYPE TEXT USING subscription_id::TEXT;"
```

Reemplaza `PASSWORD` y la URL completa con los datos de tu dashboard de Render.

---

## 🚀 **DESPUÉS DE ARREGLAR**

El flujo completo funcionará:

1. **Usuario se registra** con código ANGELUCHI ✅
2. **Usuario compra** plan premium ✅
3. **Backend genera comisión** automáticamente ✅
4. **Dashboard se actualiza** al instante ✅

**SOLO FALTA ESTE SQL** 👆

