# Instrucciones para App Store Connect - Resolver Rechazo de Apple

## Problema
Apple rechazó la app por falta de información requerida para suscripciones automáticas (Guideline 3.1.2).

## Solución Implementada

### ✅ 1. Documentos Legales Creados
- **Política de Privacidad:** `PRIVACY_POLICY.md`
- **Términos de Uso:** `TERMS_OF_USE.md`

### ✅ 2. UI de Suscripciones Actualizada
- Información completa de suscripción (título, duración, precio)
- Enlaces funcionales a política de privacidad y términos de uso
- Información sobre renovación automática y cancelación

### ✅ 3. Traducciones Completadas
- Español, inglés y portugués
- Todos los textos requeridos por Apple

## Pasos para App Store Connect

### 1. Subir Documentos Legales a tu Sitio Web
```
https://www.fitso.fitness/privacy.html
https://www.fitso.fitness/terms.html
```

### 2. Actualizar Metadatos en App Store Connect

#### A. Política de Privacidad
1. Ve a **App Store Connect** → Tu App → **App Information**
2. En el campo **Privacy Policy URL**, agrega:
   ```
   https://www.fitso.fitness/privacy.html
   ```

#### B. Términos de Uso (EULA)
1. En **App Information**, busca la sección **EULA**
2. Selecciona **Custom EULA** 
3. Sube el contenido de `TERMS_OF_USE.md` o agrega el enlace:
   ```
   https://www.fitso.fitness/terms.html
   ```

#### C. Descripción de la App
1. Ve a **App Store** → **App Information**
2. En la **App Description**, agrega al final:
   ```
   
   Términos de Uso: https://www.fitso.fitness/terms.html
   Política de Privacidad: https://www.fitso.fitness/privacy.html
   ```

### 3. Verificar Información de Suscripción

#### A. Productos de Suscripción
1. Ve a **App Store Connect** → **Features** → **In-App Purchases**
2. Verifica que tienes:
   - `Fitso_Premium_Monthly` - $2.99 USD
   - `Fitso_Premium_Yearly` - $19.99 USD

#### B. Información de Suscripción en la App
La app ahora muestra:
- ✅ Título de suscripción: "Fitso Premium"
- ✅ Duración: Mensual/Anual
- ✅ Precio: $2.99 USD / $19.99 USD
- ✅ Enlaces a política de privacidad y términos de uso
- ✅ Información sobre renovación automática
- ✅ Instrucciones de cancelación

### 4. Reenviar para Revisión

1. **Incrementa el build number** en `app.json`:
   ```json
   "buildNumber": "5"
   ```

2. **Sube la nueva versión** con todos los cambios

3. **Envía para revisión** con una nota explicativa:
   ```
   Hemos agregado toda la información requerida para suscripciones automáticas:
   - Política de privacidad funcional
   - Términos de uso (EULA) funcionales
   - Información completa de suscripción en la UI
   - Enlaces legales dentro de la aplicación
   ```

## Checklist Final

- [ ] Documentos legales subidos a tu sitio web
- [ ] URL de política de privacidad en App Store Connect
- [ ] URL de términos de uso en App Store Connect
- [ ] Descripción de app actualizada con enlaces legales
- [ ] Build number incrementado
- [ ] Nueva versión subida
- [ ] Enviada para revisión

## URLs Requeridas

**IMPORTANTE:** Las URLs ya están configuradas y funcionando:

- Política de Privacidad: `https://www.fitso.fitness/privacy.html`
- Términos de Uso: `https://www.fitso.fitness/terms.html`

## Notas Adicionales

1. **Dominio:** Si no tienes un sitio web, puedes usar GitHub Pages o cualquier servicio de hosting gratuito
2. **Enlaces:** Los enlaces deben ser funcionales y accesibles públicamente
3. **Contenido:** Los documentos deben estar en el idioma principal de tu app (español)
4. **Actualización:** Mantén estos documentos actualizados con cualquier cambio en tu app

---

**Una vez completados estos pasos, tu app debería pasar la revisión de Apple sin problemas.**
