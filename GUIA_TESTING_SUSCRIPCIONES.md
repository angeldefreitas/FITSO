# Guía de Testing del Sistema de Suscripciones

## Paso 1: Preparar el Entorno

### A. Iniciar la aplicación en dispositivo nativo
**⚠️ IMPORTANTE:** Las compras in-app NO funcionan en Expo Go. Debes usar un build nativo.

#### Para iOS (simulador o dispositivo):
```bash
cd /Users/angeldefreitas/Projects/fit-mvp
npm run ios
```

#### Para Android:
```bash
npm run android
```

### B. Verificar que RevenueCat esté configurado
- Abre el navegador a `https://app.revenuecat.com`
- Verifica que el entitlement "Fitso Premium" (ID: `entl0b12b2e363`) esté configurado
- Verifica que los productos `Fitso_Premium_Monthly` y `Fitso_Premium_Yearly` estén configurados
- Verifica que el webhook apunte a: `https://fitso.onrender.com/api/webhooks/revenuecat`

## Paso 2: Crear Usuario de Prueba

### Opción A: Usar el usuario existente test1@gmail.com
Si el usuario ya existe, puedes simplemente iniciar sesión.

### Opción B: Crear un nuevo usuario de prueba
1. Abre la aplicación
2. Toca "Registrarse"
3. Completa el formulario con:
   - Nombre: Test User
   - Email: test1@gmail.com
   - Contraseña: 211299
4. Inicia sesión

## Paso 3: Abrir Pantalla Premium

1. En la pantalla principal, busca el botón de Premium/Premium (🚀 o similar)
2. Alternativamente, navega a la pantalla de perfil y busca la opción Premium
3. Esto abrirá el modal `PremiumScreen`

## Paso 4: Probar la Compra

### A. Seleccionar plan mensual
1. En el modal de Premium, verás dos opciones:
   - Plan Mensual: $2.99
   - Plan Anual: $19.99
2. Toca el **Plan Mensual** (debe estar seleccionado por defecto)

### B. Iniciar la compra
1. Toca el botón "Suscribirme Ahora" o similar
2. Se iniciará el flujo de compra nativo (Apple o Google)
3. En el simulador/dispositivo de prueba:
   - Si es iOS sandbox, verás un modal de prueba que dice "This is a Sandbox Environment"
   - Si es Android, verás el sistema de pagos de Google Play

### C. Completar la compra de prueba
**Para iOS (Sandbox):**
1. Usa un email de prueba de Apple Sandbox (puedes crear uno en `https://sandbox.itunes.apple.com`)
2. En el simulador iOS, no se puede completar una compra real
3. Para testing real en iOS, usa un dispositivo físico con una cuenta de iTunes de prueba

**Para Android:**
1. En Google Play Console, configura una cuenta de prueba
2. Usa una cuenta de Gmail para realizar la compra de prueba
3. La compra se procesará automáticamente

## Paso 5: Verificar la Compra

### A. Verificar en la app
Después de completar la compra:
1. La pantalla Premium debería cerrarse automáticamente
2. El estado de la app debería mostrar "Premium" activo
3. Los logs en la consola deberían mostrar:
   - `✅ Compra exitosa, usuario tiene acceso premium`
   - `✅ Backend notificado exitosamente`
   - `💰 Comisión de afiliado procesada`

### B. Verificar en RevenueCat Dashboard
1. Ve a `https://app.revenuecat.com`
2. Navega a "Customers"
3. Busca el usuario con el email `test1@gmail.com`
4. Deberías ver:
   - Un entitlement "Fitso Premium" activo
   - La información de la suscripción
   - La fecha de expiración

### C. Verificar en el Backend
1. Abre los logs del backend en Render
2. Busca logs que digan:
   - `📤 [PURCHASE] Compra recibida desde app`
   - `💰 [AFFILIATE] Comisión procesada`
   - `✅ [SUBSCRIPTION] Nueva suscripción creada`

## Paso 6: Probar Restaurar Compras

1. Cierra y vuelve a abrir la aplicación
2. Ve a la pantalla Premium nuevamente
3. Toca "Restaurar Compras"
4. Debería aparecer un mensaje de éxito confirmando que las compras fueron restauradas

## Problemas Comunes y Soluciones

### Error: "Producto no encontrado en RevenueCat"
**Causa:** Los IDs de productos/packages no coinciden
**Solución:** 
1. Verifica en RevenueCat Dashboard que los productos tengan exactamente los IDs:
   - `Fitso_Premium_Monthly`
   - `Fitso_Premium_Yearly`
2. Verifica que la offering tenga los packages `$rc_monthly` y `$rc_annual`

### Error: "RevenueCat no está disponible"
**Causa:** Estás usando Expo Go
**Solución:** Debes usar un build nativo (ver Paso 1)

### Error: "Las compras no están permitidas en este dispositivo"
**Causa:** Problemas de configuración de App Store Connect / Google Play Console
**Solución:** 
- iOS: Verifica que la app esté en modo Sandbox
- Android: Verifica que el usuario de prueba esté configurado en Google Play Console

### Compra exitosa pero no aparece en el dashboard de RevenueCat
**Causa:** El webhook no está configurado correctamente
**Solución:**
1. Ve a RevenueCat Dashboard > Project Settings > Webhooks
2. Verifica que el webhook apunte a: `https://fitso.onrender.com/api/webhooks/revenuecat`
3. Verifica que el secreto del webhook esté configurado en el backend

## Verificación Adicional

### Verificar Logs en la Consola
Al realizar una compra, deberías ver estos logs en orden:

```
🔄 Inicializando servicio de suscripciones con RevenueCat...
📱 Build nativo ios/android - usando API key de producción
✅ RevenueCat configurado correctamente
📦 Productos cargados desde RevenueCat: [...]
✅ Servicio de suscripciones inicializado correctamente
🛒 [PREMIUM SCREEN] Iniciando compra de: $rc_monthly
🛒 [PURCHASE] Iniciando compra de suscripción: $rc_monthly
📦 [PURCHASE] Comparando package: $rc_monthly con productId: $rc_monthly
✅ [PURCHASE] Match encontrado: $rc_monthly
✅ [PURCHASE] Paquete encontrado: $rc_monthly
✅ [PURCHASE] Producto encontrado: ...
✅ Compra exitosa, usuario tiene acceso premium
📤 [SUBSCRIPTION] Notificando al backend sobre la compra...
📊 [SUBSCRIPTION] Datos de compra: {...}
✅ [SUBSCRIPTION] Backend notificado exitosamente
💰 [SUBSCRIPTION] Comisión de afiliado procesada: {...}
✅ [PREMIUM SCREEN] Compra completada exitosamente
```

## Notas Importantes

1. **No uses Expo Go para testing:** RevenueCat requiere un build nativo
2. **Usa cuentas de prueba:** En iOS Sandbox y Google Play Console
3. **Verifica el webhook:** Debe estar configurado correctamente en RevenueCat
4. **Los precios son fijos:** $2.99 mensual, $19.99 anual (hardcodeados en PremiumScreen.tsx)
5. **El entitlement ID correcto es:** `entl0b12b2e363` (verificado en el código)

## Siguiente Paso

Después de verificar que todo funciona correctamente, puedes proceder a:
1. Probar en dispositivos físicos reales
2. Preparar para TestFlight (iOS) o Internal Testing (Android)
3. Configurar las compras de producción en App Store Connect / Google Play Console


