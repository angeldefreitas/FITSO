# 🔑 Guía: Cómo Obtener y Configurar REVENUECAT_WEBHOOK_SECRET

## 📍 Dónde está el Secret

El `REVENUECAT_WEBHOOK_SECRET` está en el campo **"Authorization header value"** de tu webhook en RevenueCat.

## 🔍 Paso a Paso para Obtenerlo

### 1. Ve a RevenueCat Dashboard
- URL: https://app.revenuecat.com
- Navega a: **Integrations** > **Webhooks Integration** > **FITSO Webhook**

### 2. Localiza el campo "Authorization header value"
- Es el campo que está debajo de "Webhook URL"
- Puede estar oculto (con un icono de ojo 🔒)

### 3. Ver el valor
- Si está oculto, haz clic en el **icono de ojo** 👁️ para mostrarlo
- Verás algo como: `Xz3aHxYNQFcdgRvb` (un string aleatorio)

### 4. Copiar el valor
- **IMPORTANTE:** Copia SOLO el secret, NO incluyas "Bearer "
- Si ves `e.g. Bearer Xz3aHxYNQFcdgRvb`, copia solo: `Xz3aHxYNQFcdgRvb`
- Si el campo solo muestra el secret directamente, copia ese valor

## ⚙️ Configurar en Render

### 1. Ve a Render Dashboard
- Ve a tu servicio backend (el que tiene la URL `fitso.onrender.com`)
- Haz clic en tu servicio

### 2. Ir a Environment Variables
- En el menú lateral, busca **"Environment"**
- O busca la sección de **"Environment Variables"**

### 3. Agregar la variable
- Haz clic en **"Add Environment Variable"** o **"Add"**
- **Key:** `REVENUECAT_WEBHOOK_SECRET`
- **Value:** (pega el secret que copiaste, SIN "Bearer ")
- Ejemplo: `Xz3aHxYNQFcdgRvb`

### 4. Guardar
- Haz clic en **"Save Changes"** o **"Save"**
- Render te pedirá hacer redeploy (esto es normal)

## ✅ Verificar que Funciona

### 1. Test del endpoint
```bash
curl https://fitso.onrender.com/api/webhooks/revenuecat/test
```

Deberías recibir:
```json
{
  "success": true,
  "message": "Webhook de RevenueCat funcionando correctamente",
  "timestamp": "2025-01-XX..."
}
```

### 2. Verificar en Logs de Render
- Ve a Render Dashboard > Tu servicio > **Logs**
- Busca mensajes como:
  - `✅ Base de datos ya inicializada`
  - El servidor debería estar corriendo sin errores

### 3. Probar webhook real
- Haz una compra de prueba en la app (TestFlight)
- Revisa los logs en Render
- Deberías ver: `📨 [REVENUECAT] Webhook recibido`

## 🔒 Seguridad

**IMPORTANTE:**
- Este secret es sensible - NO lo compartas públicamente
- NO lo subas a GitHub o repositorios públicos
- Solo debe estar en Render como variable de entorno

## 📝 Formato Correcto

El código espera que el secret sea solo el valor, sin "Bearer ":

```
En RevenueCat: Authorization header value = "Xz3aHxYNQFcdgRvb"
En Render:     REVENUECAT_WEBHOOK_SECRET = "Xz3aHxYNQFcdgRvb"
En el código:  Se forma automáticamente como "Bearer Xz3aHxYNQFcdgRvb"
```

## ❌ Errores Comunes

### Error: "Authorization inválida"
- Verifica que copiaste SOLO el secret, sin "Bearer "
- Verifica que no hay espacios al inicio o final
- Verifica que la variable está guardada en Render

### Error: "Webhook no responde"
- Verifica que tu servicio está desplegado y corriendo
- Verifica que la URL del webhook es correcta: `https://fitso.onrender.com/api/webhooks/revenuecat`
- Verifica los logs de Render para ver si hay errores

## 🎯 Resumen

1. ✅ Ve a RevenueCat > Integrations > Webhooks
2. ✅ Busca "Authorization header value"
3. ✅ Copia el valor (sin "Bearer ")
4. ✅ Agrega en Render como `REVENUECAT_WEBHOOK_SECRET`
5. ✅ Guarda y redeploy
6. ✅ Prueba con `curl` o una compra de prueba

