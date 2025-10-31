# 📋 Guía de Configuración de Render para RevenueCat

## ✅ Variables de Entorno que YA tienes configuradas

Estas variables están bien configuradas en Render:

- `APPLE_SHARED_SECRET` - ✅ Configurada
- `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`, `DB_USER` - ✅ Configuradas
- `FRONTEND_URL` - ✅ Configurada (`www.fitso.fitness`)
- `JWT_SECRET` - ✅ Configurada
- `NODE_ENV` - ✅ Configurada (`production`)

## ❌ Variables CRÍTICAS que FALTAN

### 1. `REVENUECAT_WEBHOOK_SECRET` ⚠️ **CRÍTICA**

**Por qué es importante:**
- Sin esta variable, los webhooks de RevenueCat NO funcionarán
- No podrás procesar comisiones de afiliados automáticamente
- Las compras no se registrarán correctamente en el backend

**Cómo obtenerla:**
1. Ve a RevenueCat Dashboard
2. Ve a: **Project settings** > **Integrations** > **Webhooks**
3. Si ya tienes un webhook configurado, verás el "Webhook secret"
4. Si no, crea un nuevo webhook:
   - URL: `https://tu-backend.render.com/api/webhooks/revenuecat`
   - Authorization: `Bearer {SECRET}` (el secret se genera aquí)
5. Copia el secret generado

**Cómo agregarla en Render:**
1. Ve a tu servicio en Render Dashboard
2. Ve a la sección **Environment**
3. Haz clic en **Add Environment Variable**
4. Key: `REVENUECAT_WEBHOOK_SECRET`
5. Value: (pega el secret de RevenueCat)
6. Haz clic en **Save Changes**

## 📍 Información de Base de Datos

Tu base de datos está correctamente configurada. Los valores que tienes son:
- **Hostname interno:** `dpg-d3q0de0gjchc73avc80g-a`
- **Database:** `fitso_db`
- **Usuario:** `fitso_user`
- **Puerto:** `5432` (estándar para PostgreSQL)

**Nota:** Render también puede proporcionar una variable `DATABASE_URL` que incluye todo esto en una sola URL. Puedes usar esa en lugar de las variables individuales si prefieres.

## 🌐 FRONTEND_URL

### ¿Qué es?
`FRONTEND_URL` es la URL donde está alojada tu aplicación móvil o web. En tu caso está configurada como `www.fitso.fitness`.

### ¿De dónde viene?
1. Si tienes un dominio personalizado para tu app web: ese es tu `FRONTEND_URL`
2. Si tu app móvil tiene una página web de soporte/landing: esa URL
3. Si no tienes web: puedes usar una URL placeholder o la URL de tu app en las stores

### ¿Para qué se usa?
- Configuración de CORS (permite que tu app móvil haga peticiones al backend)
- Generación de enlaces en emails (reset de contraseña, verificación, etc.)
- Redirecciones después de OAuth/login

**Recomendación:** Si solo tienes app móvil, `www.fitso.fitness` está bien, pero asegúrate de que tu backend permita requests desde esa URL (o desde tu app móvil si usa Expo/React Native).

## 🔧 Variables Opcionales (pero recomendadas)

### `JWT_EXPIRES_IN`
- **Default:** `7d` (si no está configurada)
- **Recomendación:** Configurarla explícitamente: `7d` o `30d`
- **Uso:** Define cuánto tiempo son válidos los tokens de autenticación

### `DATABASE_URL` (Alternativa a variables individuales)
- Render puede proporcionar esto automáticamente
- Formato: `postgresql://usuario:password@host:port/database`
- Si la configuras, puedes eliminar `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`, `DB_USER`

### Variables de Email (si usas recuperación de contraseña)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_de_gmail
```

### Variables de Stripe (si usas pagos de comisiones)
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## ✅ Checklist Final

- [ ] ✅ Base de datos configurada correctamente
- [ ] ✅ APPLE_SHARED_SECRET configurada
- [ ] ✅ JWT_SECRET configurada
- [ ] ✅ FRONTEND_URL configurada
- [ ] ❌ **REVENUECAT_WEBHOOK_SECRET - FALTA AGREGAR** ⚠️
- [ ] (Opcional) JWT_EXPIRES_IN configurada
- [ ] (Opcional) Variables de email si usas recuperación de contraseña

## 🚀 Próximos Pasos

1. **Agregar REVENUECAT_WEBHOOK_SECRET** (obligatorio)
2. Configurar el webhook en RevenueCat Dashboard apuntando a:
   - URL: `https://tu-backend.render.com/api/webhooks/revenuecat`
   - Authorization: `Bearer ${REVENUECAT_WEBHOOK_SECRET}`
3. Probar el webhook haciendo una compra de prueba
4. Verificar logs en Render para confirmar que los webhooks se reciben

## 🔍 Cómo Verificar que Todo Funciona

1. **Probar webhook:**
   ```bash
   curl https://tu-backend.render.com/api/webhooks/revenuecat/test
   ```
   Debería responder: `{"success": true, "message": "Webhook de RevenueCat funcionando correctamente"}`

2. **Probar conexión a BD:**
   - Ve a Render Dashboard > Logs
   - Busca mensajes como: `✅ Base de datos ya inicializada`

3. **Verificar webhook de RevenueCat:**
   - Haz una compra de prueba en la app (TestFlight)
   - Revisa los logs en Render
   - Deberías ver: `📨 [REVENUECAT] Webhook recibido`

