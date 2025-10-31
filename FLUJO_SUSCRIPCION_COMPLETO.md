# Flujo Completo de Suscripción - Fitso MVP

Este documento explica paso a paso qué ocurre cuando un usuario selecciona un plan de suscripción y realiza una compra.

## 📱 1. FLUJO EN LA APP (React Native)

### 1.1. Usuario Selecciona un Plan
**Archivo:** `src/screens/PremiumScreen.tsx`

- El usuario ve dos opciones de planes:
  - **Monthly**: $2.99/mes
  - **Yearly**: $19.99/año
- Selecciona uno de los planes (mensual o anual)
- Presiona el botón "Suscribirse ahora"

### 1.2. Inicio de la Compra
**Función:** `handleSubscribe()` en `PremiumScreen.tsx`

```74:100:src/screens/PremiumScreen.tsx
  const handleSubscribe = async () => {
    try {
      // Usar los product IDs reales de RevenueCat
      // Estos deben coincidir con los productos configurados en RevenueCat dashboard
      const productId = selectedPlan === 'monthly' ? 'Fitso_Premium_Monthly' : 'Fitso_Premium_Yearly';
      console.log('🛒 [PREMIUM SCREEN] Iniciando compra de:', productId);
      await purchaseSubscription(productId);
      console.log('✅ [PREMIUM SCREEN] Compra completada exitosamente');
      
      // CRÍTICO: Esperar un momento adicional antes de cerrar para asegurar que el estado se actualice
      // El PremiumContext está haciendo múltiples intentos, pero necesitamos dar tiempo
      console.log('🔄 [PREMIUM SCREEN] Esperando actualización del estado premium...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Forzar un último refresh del estado premium antes de cerrar
      console.log('🔄 [PREMIUM SCREEN] Forzando último refresh del estado premium...');
      try {
        await refreshPremiumStatus();
        console.log('✅ [PREMIUM SCREEN] Estado premium refrescado antes de cerrar');
      } catch (refreshError) {
        console.warn('⚠️ [PREMIUM SCREEN] Error refrescando estado premium:', refreshError);
        // Continuar con el cierre aunque haya error
      }
      
      // Cerrar la pantalla después de la compra exitosa
      console.log('✅ [PREMIUM SCREEN] Cerrando pantalla - el estado premium debería estar actualizado');
      onClose();
    } catch (error) {
```

**Acciones:**
1. Determina el `productId` basado en el plan seleccionado:
   - `'Fitso_Premium_Monthly'` para plan mensual
   - `'Fitso_Premium_Yearly'` para plan anual
2. Llama a `purchaseSubscription(productId)` del `PremiumContext`

### 1.3. PremiumContext Procesa la Compra
**Archivo:** `src/contexts/PremiumContext.tsx`

```68:134:src/contexts/PremiumContext.tsx
  const purchaseSubscription = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      console.log('🛒 [PREMIUM CONTEXT] Iniciando compra de suscripción:', productId);
      
      await subscriptionService.purchaseSubscription(productId);
      
      // CRÍTICO: Forzar actualización completa del estado premium después de la compra
      console.log('🔄 [PREMIUM CONTEXT] Forzando actualización completa del estado premium después de compra...');
      
      // Múltiples intentos para asegurar que el estado se actualice
      let attempts = 0;
      const maxAttempts = 5;
      let freshStatus: PremiumStatus | null = null;
      
      while (attempts < maxAttempts) {
        attempts++;
        
        // Esperar con delay incremental: 0.5s, 1s, 1.5s, 2s, 2.5s
        if (attempts > 1) {
          const delay = (attempts - 1) * 500;
          console.log(`🔄 [PREMIUM CONTEXT] Intento ${attempts}/${maxAttempts} - esperando ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        // Forzar refresh desde RevenueCat
        try {
          await subscriptionService.refreshPremiumStatusFromRevenueCat();
          console.log('✅ [PREMIUM CONTEXT] Estado refrescado desde RevenueCat');
        } catch (refreshError) {
          console.warn('⚠️ [PREMIUM CONTEXT] Error refrescando desde RevenueCat:', refreshError);
        }
        
        // Obtener estado fresco directamente desde RevenueCat
        freshStatus = await subscriptionService.getPremiumStatus();
        console.log(`📦 [PREMIUM CONTEXT] Intento ${attempts}/${maxAttempts} - Estado premium:`, freshStatus);
        
        // Si el estado premium está activo, salir del loop
        if (freshStatus.isPremium) {
          console.log('✅ [PREMIUM CONTEXT] ¡Estado premium detectado como activo!');
          break;
        } else {
          console.log(`⚠️ [PREMIUM CONTEXT] Estado premium aún no activo en intento ${attempts}/${maxAttempts}`);
        }
      }
      
      // Actualizar estado del contexto con el último estado obtenido
      if (freshStatus) {
        setPremiumStatus(freshStatus);
        console.log('✅ [PREMIUM CONTEXT] Estado premium actualizado en contexto:', freshStatus);
        
        if (!freshStatus.isPremium) {
          console.warn('⚠️ [PREMIUM CONTEXT] Estado premium NO activo después de', maxAttempts, 'intentos');
          console.warn('⚠️ [PREMIUM CONTEXT] El webhook puede tardar unos momentos más en procesar');
          console.warn('⚠️ [PREMIUM CONTEXT] El estado se actualizará automáticamente cuando el usuario vuelva a la app');
        }
      }
      
      console.log('✅ [PREMIUM CONTEXT] Compra de suscripción completada y estado actualizado');
    } catch (error) {
      console.error('❌ [PREMIUM CONTEXT] Error en compra de suscripción:', error);
      // NO mostrar Alert.alert aquí - el error será manejado por PremiumScreen con el modal bonito
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
```

**Acciones:**
1. Llama a `subscriptionService.purchaseSubscription(productId)`
2. Realiza múltiples intentos (hasta 5) para verificar que el estado premium se actualice
3. Actualiza el estado del contexto con el nuevo estado premium

### 1.4. SubscriptionService Realiza la Compra
**Archivo:** `src/services/subscriptionService.ts`

**Pasos críticos en `purchaseSubscription()`:**

1. **Configurar App User ID:**
   ```310:381:src/services/subscriptionService.ts
  async purchaseSubscription(productId: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        try {
          await this.initialize();
        } catch (error) {
          throw new Error('RevenueCat no está disponible. Por favor, usa la versión nativa de la app para realizar compras.');
        }
      }

      // CRÍTICO: Configurar App User ID ANTES de la compra
      // Si no está configurado, RevenueCat usará un ID anónimo y los webhooks no llegarán correctamente
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('Debes estar autenticado para realizar compras. Por favor, inicia sesión e intenta de nuevo.');
      }

      // CRÍTICO: Obtener el App User ID actual ANTES de configurarlo
      // Si hay un usuario diferente, hacer logout primero
      let currentCustomerInfo = await Purchases.getCustomerInfo();
      const currentAppUserId = currentCustomerInfo.originalAppUserId;
      
      console.log('🔍 [PURCHASE] Estado ANTES de configurar App User ID:');
      console.log('  - Usuario esperado (de app):', userId);
      console.log('  - App User ID actual (RevenueCat):', currentAppUserId);
      
      // Si hay un usuario diferente configurado, cerrar sesión primero
      if (currentAppUserId && currentAppUserId !== userId) {
        console.warn('⚠️ [PURCHASE] CRÍTICO: Detectado usuario diferente en RevenueCat!');
        console.warn('  - Usuario anterior:', currentAppUserId);
        console.warn('  - Usuario nuevo:', userId);
        console.warn('🔄 [PURCHASE] Cerrando sesión del usuario anterior para evitar mezclar compras...');
        
        await Purchases.logOut();
        console.log('✅ [PURCHASE] Sesión anterior cerrada');
        
        // Esperar un momento para que RevenueCat procese el logout
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('👤 [PURCHASE] Configurando App User ID antes de la compra:', userId);
      await Purchases.logIn(userId);
      console.log('✅ [PURCHASE] App User ID configurado');

      // Verificar que el App User ID se configuró correctamente
      currentCustomerInfo = await Purchases.getCustomerInfo();
      const verifiedAppUserId = currentCustomerInfo.originalAppUserId;
      console.log('👤 [PURCHASE] App User ID verificado en RevenueCat:', verifiedAppUserId);
      
      if (verifiedAppUserId !== userId) {
        console.error('❌ [PURCHASE] CRÍTICO: App User ID NO coincide después de configurar!');
        console.error('  - Esperado:', userId);
        console.error('  - Obtenido:', verifiedAppUserId);
        console.warn('⚠️ [PURCHASE] Intentando forzar actualización...');
        
        // Intentar de nuevo con logout/login
        await Purchases.logOut();
        await new Promise(resolve => setTimeout(resolve, 500));
        await Purchases.logIn(userId);
        
        const reVerifyInfo = await Purchases.getCustomerInfo();
        const reVerifiedAppUserId = reVerifyInfo.originalAppUserId;
        console.log('✅ [PURCHASE] App User ID después de forzar:', reVerifiedAppUserId);
        
        if (reVerifiedAppUserId !== userId) {
          console.error('❌ [PURCHASE] CRÍTICO: App User ID AÚN no coincide después de forzar!');
          console.error('❌ [PURCHASE] La compra puede asociarse al usuario incorrecto!');
          // No lanzar error para permitir que la compra continúe, pero registrar el problema
        }
      } else {
        console.log('✅ [PURCHASE] App User ID verificado correctamente - la compra se asociará al usuario correcto');
      }
```

2. **Encontrar el paquete en RevenueCat:**
   ```429:503:src/services/subscriptionService.ts
      const packageToPurchase = offerings.current.availablePackages.find(
        pkg => {
          // Normalizar IDs para comparación
          const packageIdLower = pkg.identifier.toLowerCase();
          const packageIdNoPrefix = packageIdLower.replace(/^\$rc_/, 'rc_');
          const productIdLower = productId.toLowerCase();
          const productIdNoPrefix = productIdLower.replace(/^\$rc_/, 'rc_');
          const pkgProductIdLower = pkg.product.identifier.toLowerCase();
          
          // 1. Comparación exacta de package ID (si productId es un package ID)
          const exactPackageMatch = pkg.identifier === productId;
          
          // 2. Comparación exacta de product ID (PRIMERA PRIORIDAD - más confiable)
          const exactProductMatch = pkg.product.identifier === productId;
          
          // 3. Comparación sin case sensitivity de product ID
          const caseInsensitiveProductMatch = pkgProductIdLower === productIdLower;
          
          // 4. Comparación sin prefijo $ en package ID
          const noPrefixMatch = packageIdNoPrefix === productIdNoPrefix;
          
          // 5. Comparación sin case sensitivity de package ID
          const caseInsensitivePackageMatch = packageIdLower === productIdLower;
          
          // 6. Match por contenido (monthly/annual/yearly) - ÚTIL para sandbox vs producción
          // En sandbox, los productos pueden tener sufijo _Test, pero contienen "monthly" o "yearly"
          // Esto permite que Fitso_Premium_Monthly coincida con Fitso_Premium_Monthly_Test
          const productBaseMatch = 
            (productIdLower.includes('monthly') && pkgProductIdLower.includes('monthly')) ||
            ((productIdLower.includes('annual') || productIdLower.includes('yearly')) && 
             (pkgProductIdLower.includes('annual') || pkgProductIdLower.includes('yearly')));
          
          // También buscar por package ID si contiene el tipo
          const packageContentMatch = 
            (productIdLower.includes('monthly') && packageIdLower.includes('monthly')) ||
            ((productIdLower.includes('annual') || productIdLower.includes('yearly')) && 
             (packageIdLower.includes('annual') || packageIdLower.includes('yearly')));
          
          const contentMatch = productBaseMatch || packageContentMatch;
          
          // Priorizar matches exactos sobre matches por contenido
          const matches = exactProductMatch || exactPackageMatch || caseInsensitiveProductMatch || 
                         caseInsensitivePackageMatch || noPrefixMatch || contentMatch;
          
          if (matches) {
            console.log(`✅ [PURCHASE] Match encontrado:`);
            console.log(`   Package ID: ${pkg.identifier}`);
            console.log(`   Product ID: ${pkg.product.identifier}`);
            console.log(`   Product Title: ${pkg.product.title}`);
            console.log(`   Match type: ${exactProductMatch ? 'exact product' : 
                         exactPackageMatch ? 'exact package' :
                         caseInsensitiveProductMatch ? 'case-insensitive product' :
                         caseInsensitivePackageMatch ? 'case-insensitive package' :
                         noPrefixMatch ? 'no prefix' : 'content'}`);
          }
          
          return matches;
        }
      );

      if (!packageToPurchase) {
        console.error('❌ [PURCHASE] Paquete no encontrado en RevenueCat');
        console.error('❌ [PURCHASE] ProductId buscado:', productId);
        console.error('❌ [PURCHASE] Paquetes disponibles:', offerings.current.availablePackages.map(p => ({ 
          packageId: p.identifier, 
          productId: p.product.identifier,
          productTitle: p.product.title
        })));
        console.error('❌ [PURCHASE] Esto puede deberse a:');
        console.error('   1. El package ID no coincide con los configurados en RevenueCat');
        console.error('   2. Los productos no están correctamente vinculados en RevenueCat');
        console.error('   3. El productId usado es incorrecto');
        throw new Error('No pudimos encontrar el producto. Por favor, verifica tu conexión e inténtalo de nuevo.');
      }
      console.log('✅ [PURCHASE] Paquete encontrado:', packageToPurchase.identifier);
```

3. **Realizar la compra con RevenueCat:**
   ```505:593:src/services/subscriptionService.ts
      // Realizar la compra
      console.log('💳 [PURCHASE] Iniciando compra con RevenueCat...');
      const { customerInfo: purchaseCustomerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      console.log('📦 [PURCHASE] Customer Info después de compra:');
      console.log('  - App User ID:', purchaseCustomerInfo.originalAppUserId);
      console.log('  - Active Subscriptions:', purchaseCustomerInfo.activeSubscriptions);
      console.log('  - All Entitlements:', Object.keys(purchaseCustomerInfo.entitlements.all || {}));
      console.log('  - Active Entitlements:', Object.keys(purchaseCustomerInfo.entitlements.active || {}));
      console.log('  - Buscando entitlement:', PREMIUM_ENTITLEMENT);
      
      // CRÍTICO: Verificar que el App User ID sigue siendo el correcto después de la compra
      if (purchaseCustomerInfo.originalAppUserId !== userId) {
        console.error('❌ [PURCHASE] CRÍTICO: App User ID cambió después de la compra!');
        console.error('  - Usuario esperado (de app):', userId);
        console.error('  - App User ID después de compra:', purchaseCustomerInfo.originalAppUserId);
        console.error('  - ⚠️ ESTO ES GRAVE: La compra puede asociarse al usuario incorrecto en RevenueCat!');
        console.error('  - ⚠️ Esto explica por qué solo ves un evento en RevenueCat dashboard');
        console.error('  - ⚠️ Todas las compras pueden estar asociándose al mismo usuario');
        
        // Intentar corregir el App User ID después de la compra
        console.warn('🔄 [PURCHASE] Intentando corregir App User ID después de la compra...');
        try {
          await Purchases.logIn(userId);
          const correctedInfo = await Purchases.getCustomerInfo();
          console.log('✅ [PURCHASE] App User ID corregido:', correctedInfo.originalAppUserId);
        } catch (correctError) {
          console.error('❌ [PURCHASE] No se pudo corregir App User ID:', correctError);
        }
      } else {
        console.log('✅ [PURCHASE] App User ID verificado correctamente después de la compra');
        console.log('✅ [PURCHASE] La compra se asociará al usuario correcto en RevenueCat');
      }
      
      // Obtener customerInfo fresco después de la compra para asegurar que esté sincronizado
      console.log('🔄 [PURCHASE] Obteniendo Customer Info fresco desde RevenueCat...');
      let finalCustomerInfo = purchaseCustomerInfo;
      try {
        // Esperar un momento para que RevenueCat procese la compra
        await new Promise(resolve => setTimeout(resolve, 500));
        finalCustomerInfo = await Purchases.getCustomerInfo();
        console.log('✅ [PURCHASE] Customer Info actualizado obtenido');
      } catch (error) {
        console.warn('⚠️ [PURCHASE] No se pudo obtener Customer Info fresco, usando el de la compra:', error);
      }
      
      // Verificar si el usuario tiene acceso premium
      // IMPORTANTE: A veces RevenueCat tarda unos segundos en activar el entitlement
      // Intentar varias veces con delays incrementales
      let premiumEntitlement = finalCustomerInfo.entitlements.active[PREMIUM_ENTITLEMENT];
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!premiumEntitlement && attempts < maxAttempts) {
        if (attempts > 0) {
          console.log(`🔄 [PURCHASE] Intentando verificar entitlement (intento ${attempts + 1}/${maxAttempts})...`);
          // Esperar con delay incremental: 1s, 2s, 3s
          await new Promise(resolve => setTimeout(resolve, attempts * 1000));
          finalCustomerInfo = await Purchases.getCustomerInfo();
        }
        
        premiumEntitlement = finalCustomerInfo.entitlements.active[PREMIUM_ENTITLEMENT];
        attempts++;
        
        if (premiumEntitlement) {
          console.log(`✅ [PURCHASE] Entitlement encontrado después de ${attempts} intento(s)`);
          break;
        }
      }
      
      if (premiumEntitlement) {
        console.log('✅ [PURCHASE] Compra exitosa, usuario tiene acceso premium');
        console.log('📦 [PURCHASE] Premium entitlement activo:');
        console.log('  - Identifier:', premiumEntitlement.identifier);
        console.log('  - Expiration Date:', premiumEntitlement.expirationDate);
        console.log('  - Is Active:', premiumEntitlement.isActive);
        console.log('  - Product Identifier:', premiumEntitlement.productIdentifier);
        
        // Actualizar estado premium desde RevenueCat inmediatamente
        await this.refreshPremiumStatusFromRevenueCat();
        
        // Forzar otra actualización después de un pequeño delay para asegurar que se sincroniza
        setTimeout(async () => {
          console.log('🔄 [PURCHASE] Re-verificando estado premium después de compra...');
          await this.refreshPremiumStatusFromRevenueCat();
        }, 2000);
        
        // Notificar al backend sobre la compra (para comisiones de afiliados)
        await this.notifyBackendAboutPurchase(productId, finalCustomerInfo);
```

4. **Notificar al backend (opcional):**
   ```1142:1213:src/services/subscriptionService.ts
  private async notifyBackendAboutPurchase(productId: string, customerInfo: CustomerInfo): Promise<void> {
    try {
      console.log('📤 [SUBSCRIPTION] Notificando al backend sobre la compra...');
      
      const { default: apiService } = await import('./apiService');
      const userId = await this.getCurrentUserId();
      
      // Extraer información de la compra
      const premiumEntitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT];
      
      // Determinar el tipo de suscripción basado en productId o package identifier
      let subscriptionType = 'monthly';
      if (productId.includes('Monthly') || productId.includes('monthly') || 
          productId === '$rc_monthly' || productId === 'rc_monthly') {
        subscriptionType = 'monthly';
      } else if (productId.includes('Yearly') || productId.includes('yearly') || 
                 productId.includes('Annual') || productId.includes('annual') ||
                 productId === '$rc_annual' || productId === 'rc_annual') {
        subscriptionType = 'yearly';
      }
      
      // Obtener el ID de la transacción más reciente
      // RevenueCat proporciona latestPurchaseDate, pero necesitamos un ID único
      // Usar el latestTransactionDate del entitlement o generar uno basado en la fecha
      const transactionId = premiumEntitlement?.latestPurchaseDate ? 
        `rc_${Date.parse(premiumEntitlement.latestPurchaseDate)}` : 
        `rc_${Date.now()}`;
      
      // Calcular precio basado en el plan
      const price = subscriptionType === 'monthly' ? 2.99 : 19.99;
      
      const purchaseData = {
        userId,
        productId,
        subscriptionType,
        transactionId,
        purchaseDate: new Date().toISOString(),
        expiresAt: premiumEntitlement?.expirationDate,
        price,
      };
      
      console.log('📊 [SUBSCRIPTION] Datos de compra:', purchaseData);
      
      // Enviar al backend
      try {
        const response = await apiService.post('/subscriptions/purchase', purchaseData);
        
        if (response.success) {
          console.log('✅ [SUBSCRIPTION] Backend notificado exitosamente');
          console.log('💰 [SUBSCRIPTION] Comisión de afiliado procesada:', response.data);
        } else {
          console.warn('⚠️ [SUBSCRIPTION] Backend respondió con error:', response.message);
          console.warn('ℹ️ [SUBSCRIPTION] La comisión será procesada por el webhook de RevenueCat');
        }
      } catch (apiError: any) {
        // El 404 u otros errores del backend no deben afectar el flujo de compra
        // El webhook de RevenueCat se encargará de procesar la comisión
        if (apiError?.message?.includes('404') || apiError?.message?.includes('not found')) {
          console.warn('⚠️ [SUBSCRIPTION] Endpoint no encontrado (404) - esto puede ser normal si el backend está en mantenimiento');
        } else {
          console.error('❌ [SUBSCRIPTION] Error notificando al backend:', apiError?.message || apiError);
        }
        console.log('ℹ️ [SUBSCRIPTION] La compra se completó exitosamente. La comisión será procesada por el webhook de RevenueCat.');
      }
      
    } catch (error) {
      console.error('❌ [SUBSCRIPTION] Error inesperado notificando al backend:', error);
      // No lanzar error para no afectar el flujo de compra
      // El webhook de RevenueCat se encargará de procesar la comisión
      console.log('ℹ️ [SUBSCRIPTION] La comisión será procesada por el webhook de RevenueCat');
    }
  }
```

**Resumen del flujo en la app:**
- ✅ Configura App User ID en RevenueCat
- ✅ Busca el paquete/producto en RevenueCat
- ✅ Realiza la compra usando `Purchases.purchasePackage()`
- ✅ Verifica que el entitlement premium esté activo
- ✅ Actualiza el estado premium localmente
- ✅ (Opcional) Notifica al backend sobre la compra

---

## 🌐 2. FLUJO EN REVENUECAT

### 2.1. Procesamiento de la Compra
Cuando RevenueCat recibe la solicitud de compra desde la app:

1. **Valida la compra con Apple/Google:**
   - Verifica que el producto existe en App Store/Play Store
   - Valida que el usuario puede realizar la compra
   - Procesa el pago con Apple/Google

2. **Activa el entitlement:**
   - Asigna el entitlement `'entl0b12b2e363'` (Fitso Premium) al usuario
   - Marca la suscripción como activa
   - Almacena información de la transacción

3. **Envía webhook al backend:**
   - Genera un evento de tipo `INITIAL_PURCHASE` (primera compra)
   - Envía POST request a: `https://[TU_DOMINIO_RENDER]/api/webhooks/revenuecat`
   - El payload incluye:
     - `event.type`: Tipo de evento (INITIAL_PURCHASE, RENEWAL, etc.)
     - `event.app_user_id`: ID del usuario (debe coincidir con el userId de la BD)
     - `event.product_id`: ID del producto comprado
     - `event.price`: Precio de la compra
     - `event.id`: ID de la transacción

---

## 🖥️ 3. FLUJO EN RENDER (Backend)

### 3.1. Recepción del Webhook
**Archivo:** `backend/src/server.js`

El servidor recibe el webhook en el endpoint `/api/webhooks/revenuecat` (configurado en `backend/src/routes/webhooks.js`).

### 3.2. Procesamiento del Webhook
**Archivo:** `backend/src/monetization/controllers/revenuecatWebhookController.js`

```9:154:backend/src/monetization/controllers/revenuecatWebhookController.js
  async handleWebhook(req, res) {
    try {
      // Validar secreto de RevenueCat para seguridad
      const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
      const authHeader = req.headers['authorization'] || req.headers['Authorization'];
      
      // Logging para debugging
      console.log('🔍 [REVENUECAT] Validando webhook...');
      console.log('🔑 [REVENUECAT] Webhook secret configurado:', webhookSecret ? 'Sí' : 'No');
      console.log('📨 [REVENUECAT] Authorization header recibido:', authHeader ? `${authHeader.substring(0, 20)}...` : 'No presente');
      
      if (webhookSecret && authHeader) {
        // Normalizar el header (quitar espacios extras, manejar mayúsculas/minúsculas)
        const normalizedHeader = authHeader.trim();
        const expectedAuth = `Bearer ${webhookSecret}`;
        
        // Comparar de forma flexible (sin importar mayúsculas/minúsculas en "Bearer")
        const headerParts = normalizedHeader.split(' ');
        const receivedSecret = headerParts.length > 1 ? headerParts.slice(1).join(' ') : normalizedHeader;
        
        // Comparar el secret (la parte después de "Bearer")
        if (receivedSecret.trim() !== webhookSecret.trim()) {
          console.error('❌ [REVENUECAT] Authorization inválida');
          console.error('❌ [REVENUECAT] Esperado:', `Bearer ${webhookSecret.substring(0, 10)}...`);
          console.error('❌ [REVENUECAT] Recibido:', `${authHeader.substring(0, 30)}...`);
          
          // IMPORTANTE: En desarrollo/sandbox, permitir continuar para debugging
          // En producción, debería rechazar
          const isDevelopment = process.env.NODE_ENV !== 'production';
          if (isDevelopment) {
            console.warn('⚠️ [REVENUECAT] Modo desarrollo: continuando sin validación estricta');
          } else {
            return res.status(401).json({
              success: false,
              message: 'Unauthorized'
            });
          }
        } else {
          console.log('✅ [REVENUECAT] Authorization válida');
        }
      } else if (webhookSecret && !authHeader) {
        console.warn('⚠️ [REVENUECAT] Webhook secret configurado pero no se recibió header Authorization');
        console.warn('⚠️ [REVENUECAT] Continuando sin validación (modo permisivo para testing)');
      }

      const payload = req.body;
      
      console.log('📨 [REVENUECAT] Webhook recibido');
      console.log('📋 [REVENUECAT] Payload:', JSON.stringify(payload, null, 2));

      // Validar que el evento tenga la estructura correcta
      if (!payload || !payload.event) {
        console.error('❌ [REVENUECAT] Payload inválido:', payload);
        return res.status(400).json({
          success: false,
          message: 'Payload inválido'
        });
      }

      // Extraer información del evento
      const eventData = payload.event;
      const eventType = eventData.type;
      
      // Información del usuario y suscripción
      const appUserId = eventData.app_user_id;
      const productId = eventData.product_id;
      const transactionId = eventData.id;
      const price = eventData.price || eventData.price_in_purchased_currency || 0;
      const currency = eventData.currency || 'USD';

      console.log(`📨 [REVENUECAT] Tipo de evento: ${eventType}`);
      console.log(`👤 [REVENUECAT] Usuario: ${appUserId}`);
      console.log(`📦 [REVENUECAT] Producto: ${productId}`);
      console.log(`💰 [REVENUECAT] Precio: ${price} ${currency}`);

      // Procesar según el tipo de evento
      switch (eventType) {
        case 'TEST':
          console.log('✅ [REVENUECAT] Evento de prueba recibido correctamente');
          console.log('ℹ️ [REVENUECAT] Los eventos TEST son de RevenueCat para verificar que el webhook funciona');
          console.log('ℹ️ [REVENUECAT] Este NO es un evento de compra real - no se procesará');
          break;

        case 'INITIAL_PURCHASE':
          console.log('🎉 [REVENUECAT] Compra inicial detectada - procesando...');
          await this.handleInitialPurchase(appUserId, transactionId, price, productId);
          break;
        
        case 'RENEWAL':
          await this.handleRenewal(appUserId, transactionId, price, productId);
          break;
        
        case 'CANCELLATION':
          await this.handleCancellation(appUserId, transactionId);
          break;
        
        case 'EXPIRATION':
          await this.handleExpiration(appUserId, transactionId);
          break;
        
        case 'BILLING_ISSUE':
          await this.handleBillingIssue(appUserId, transactionId);
          break;
        
        case 'NON_RENEWING_PURCHASE':
          console.log('ℹ️ [REVENUECAT] Compra no renovable, no se genera comisión recurrente');
          break;
        
        case 'DID_CHANGE_RENEWAL_PREF':
          // Este evento ocurre cuando el usuario cambia su preferencia de renovación (ej: mensual a anual)
          // Aunque no es una compra inicial, puede indicar un upgrade/downgrade
          console.log('🔄 [REVENUECAT] Cambio de preferencia de renovación detectado');
          console.log('ℹ️ [REVENUECAT] Este evento indica cambio de plan, pero no es una compra inicial');
          console.log('ℹ️ [REVENUECAT] Si hay app_user_id y product_id, verificaremos si es necesario procesar');
          
          // Si tenemos app_user_id y product_id, podríamos procesarlo como un cambio de suscripción
          // Por ahora solo logueamos, pero podríamos expandir esto si es necesario
          if (appUserId && productId) {
            console.log(`ℹ️ [REVENUECAT] Usuario ${appUserId} cambió a producto ${productId}`);
            // Nota: Este evento normalmente NO requiere procesar comisiones porque no es una conversión inicial
            // Pero si el usuario hizo un upgrade/downgrade, podría requerir lógica adicional
          }
          break;
        
        default:
          console.log(`⚠️ [REVENUECAT] Evento no manejado: ${eventType}`);
          console.log(`⚠️ [REVENUECAT] App User ID: ${appUserId || 'NO DISPONIBLE'}`);
          console.log(`⚠️ [REVENUECAT] Product ID: ${productId || 'NO DISPONIBLE'}`);
      }

      // Responder siempre con 200 para que RevenueCat no reintente
      res.status(200).json({
        success: true,
        message: 'Webhook procesado'
      });

    } catch (error) {
      console.error('❌ [REVENUECAT] Error procesando webhook:', error);
      
      // Aún así responder con 200 para evitar reintentos innecesarios
      res.status(200).json({
        success: false,
        message: 'Error procesado internamente'
      });
    }
  }
```

### 3.3. Manejo de Compra Inicial
**Archivo:** `backend/src/monetization/controllers/revenuecatWebhookController.js`

```156:210:backend/src/monetization/controllers/revenuecatWebhookController.js
  async handleInitialPurchase(appUserId, transactionId, price, productId) {
    try {
      console.log('🎉 [REVENUECAT] Primera compra detectada');
      console.log('👤 [REVENUECAT] App User ID:', appUserId);
      console.log('📦 [REVENUECAT] Product ID:', productId);
      console.log('💰 [REVENUECAT] Price:', price);
      
      // IMPORTANTE: El appUserId que viene de RevenueCat es el ID del usuario en nuestra BD
      // Buscar el usuario por su ID (que debería coincidir con el app_user_id configurado)
      const userQuery = 'SELECT id, email, name FROM users WHERE id = $1';
      const userResult = await query(userQuery, [appUserId]);
      
      if (userResult.rows.length === 0) {
        console.error('❌ [REVENUECAT] Usuario no encontrado en BD con App User ID:', appUserId);
        console.log('ℹ️ [REVENUECAT] Esto puede ocurrir si el App User ID no coincide con el ID del usuario en la BD');
        console.log('ℹ️ [REVENUECAT] El webhook se procesará pero no se actualizará el usuario');
        return;
      }
      
      const user = userResult.rows[0];
      console.log('✅ [REVENUECAT] Usuario encontrado:', user.email, user.name);
      
      // Determinar tipo de suscripción
      const subscriptionType = productId.toLowerCase().includes('monthly') ? 'monthly' : 'yearly';
      
      // Procesar comisión de conversión
      const commission = await AffiliateService.processPremiumConversion(
        appUserId,
        transactionId,
        price,
        subscriptionType
      );

      if (commission) {
        console.log(`✅ [REVENUECAT] Comisión inicial generada: $${commission.commission_amount}`);
      } else {
        console.log('ℹ️ [REVENUECAT] Usuario sin código de referencia o código inválido');
      }
      
      // El estado premium se maneja automáticamente por:
      // 1. RevenueCat SDK en la app (actualiza el estado local)
      // 2. La tabla subscriptions (si existe una suscripción activa, el usuario es premium)
      // 3. is_affiliate o is_admin en users (otorgan premium automático)
      
      console.log('✅ [REVENUECAT] Compra inicial procesada correctamente');
      console.log('ℹ️ [REVENUECAT] El estado premium se actualizará automáticamente en la app cuando verifique con RevenueCat');

    } catch (error) {
      console.error('❌ [REVENUECAT] Error en handleInitialPurchase:', error);
      throw error;
    }
  }
```

**Acciones en el backend:**
1. Valida el webhook (verifica el secret)
2. Extrae información del evento (`app_user_id`, `product_id`, `price`, etc.)
3. Busca el usuario en la base de datos usando el `app_user_id`
4. Determina el tipo de suscripción (monthly/yearly)
5. Procesa comisión de afiliado (si el usuario tiene código de referencia)

### 3.4. Procesamiento de Comisión de Afiliado
**Archivo:** `backend/src/monetization/services/affiliateService.js`

Cuando el usuario tiene un código de referencia, el sistema:
1. Busca la referencia del usuario en `user_referrals`
2. Obtiene información del código de afiliado
3. Calcula la comisión según el porcentaje configurado
4. Crea un registro en `affiliate_commissions`

---

## 📊 RESUMEN DEL FLUJO COMPLETO

```
┌─────────────────────────────────────────────────────────────────┐
│                      FLUJO DE SUSCRIPCIÓN                        │
└─────────────────────────────────────────────────────────────────┘

1. APP (PremiumScreen.tsx)
   │
   ├─► Usuario selecciona plan (monthly/yearly)
   │
   ├─► Llama purchaseSubscription(productId)
   │
   └─► PremiumContext procesa la compra
       │
       └─► SubscriptionService.purchaseSubscription()
           │
           ├─► Configura App User ID en RevenueCat
           ├─► Busca el paquete/producto
           ├─► Realiza compra: Purchases.purchasePackage()
           ├─► Verifica entitlement premium activo
           ├─► Actualiza estado premium local
           └─► (Opcional) Notifica backend vía POST /subscriptions/purchase

2. REVENUECAT
   │
   ├─► Valida compra con Apple/Google
   ├─► Procesa el pago
   ├─► Activa entitlement premium
   └─► Envía webhook al backend:
       │
       └─► POST https://[RENDER]/api/webhooks/revenuecat
           │
           └─► Evento: INITIAL_PURCHASE (o RENEWAL)

3. BACKEND (Render)
   │
   ├─► Recibe webhook en /api/webhooks/revenuecat
   │
   ├─► Valida autenticación (webhook secret)
   │
   ├─► Extrae datos del evento:
   │   ├─ app_user_id
   │   ├─ product_id
   │   ├─ price
   │   └─ transaction_id
   │
   ├─► Busca usuario en BD
   │
   ├─► Procesa comisión de afiliado (si aplica):
   │   ├─ Busca código de referencia del usuario
   │   ├─ Calcula comisión
   │   └─ Crea registro en affiliate_commissions
   │
   └─► Responde 200 OK a RevenueCat

4. APP (Actualización del Estado)
   │
   ├─► SubscriptionService verifica estado premium
   ├─► Actualiza PremiumContext
   └─► Usuario ve estado premium activo
```

---

## ⚠️ PUNTOS CRÍTICOS

### 1. App User ID - Múltiples Usuarios
**IMPORTANTE:** No hay un solo `app_user_id`. Cada usuario tiene su propio `app_user_id` único.

**Cómo funciona:**

1. **Cada usuario tiene su propio `app_user_id`:**
   - El `app_user_id` = `user.id` (ID del usuario en la base de datos)
   - Ejemplo: Usuario A con `id: "123"` → `app_user_id: "123"`
   - Ejemplo: Usuario B con `id: "456"` → `app_user_id: "456"`

2. **Configuración cuando un usuario se autentica:**
   ```typescript
   // En PremiumContext.tsx
   await subscriptionService.setAppUserId(user.id); // Configura el app_user_id del usuario actual
   ```

3. **Cambio de usuario (logout/login):**
   ```typescript
   // En AuthContext.tsx - cuando un usuario hace logout
   await Purchases.logOut(); // Cierra sesión del usuario anterior
   
   // Cuando un nuevo usuario se autentica
   await Purchases.logIn(newUser.id); // Configura el app_user_id del nuevo usuario
   ```

4. **Detección de cambio de usuario:**
   ```typescript
   // El código verifica si hay un usuario diferente configurado
   const currentAppUserId = currentCustomerInfo.originalAppUserId;
   if (currentAppUserId && currentAppUserId !== user.id) {
     // Hay un usuario diferente → hacer logout primero
     await Purchases.logOut();
     // Luego configurar el nuevo usuario
     await Purchases.logIn(user.id);
   }
   ```

**CRÍTICO:** 
- El `app_user_id` configurado en RevenueCat debe coincidir exactamente con el `id` del usuario en la base de datos
- Si no coincide, el webhook no podrá encontrar al usuario y no se procesará la comisión
- Cada usuario debe tener su propio `app_user_id` configurado ANTES de hacer cualquier compra

### 2. Endpoint del Webhook
- **URL:** `https://[TU_DOMINIO_RENDER]/api/webhooks/revenuecat`
- Debe estar configurado en el dashboard de RevenueCat
- Debe ser accesible públicamente

### 3. Webhook Secret
- Debe estar configurado en:
  - **RevenueCat Dashboard:** Configuración del webhook
  - **Render:** Variable de entorno `REVENUECAT_WEBHOOK_SECRET`
- Se usa para validar que el webhook viene realmente de RevenueCat

### 4. Timing
- El estado premium puede tardar unos segundos en activarse
- La app realiza múltiples intentos (hasta 5) para verificar el estado
- El webhook puede llegar antes o después de que la app actualice el estado

---

## 🔍 DEBUGGING

### Verificar en la App:
- Logs de consola con prefijos:
  - `[PREMIUM SCREEN]`
  - `[PREMIUM CONTEXT]`
  - `[PURCHASE]`
  - `[REFRESH]`

### Verificar en RevenueCat:
- Dashboard → Customers → Buscar por App User ID
- Verificar que el entitlement esté activo
- Verificar eventos de webhook (si están disponibles)

### Verificar en Render:
- Logs del servidor con prefijos:
  - `[REVENUECAT]`
  - `[PURCHASE]`
  - `[AFFILIATE]`

### Problemas Comunes:

1. **Webhook no llega:**
   - Verificar URL del webhook en RevenueCat dashboard
   - Verificar que Render esté corriendo y accesible
   - Verificar logs en Render

2. **Usuario no encontrado:**
   - Verificar que `app_user_id` en RevenueCat coincida con `id` en BD
   - Verificar logs en Render para ver qué `app_user_id` recibió

3. **Comisión no se genera:**
   - Verificar que el usuario tenga código de referencia en `user_referrals`
   - Verificar que el código exista en `affiliate_codes`
   - Verificar logs de `AffiliateService`

---

## 📝 NOTAS ADICIONALES

- El endpoint `/api/subscriptions/purchase` es **opcional** - la app lo intenta llamar pero si falla, el webhook se encargará de procesar la comisión
- El estado premium se verifica principalmente desde RevenueCat SDK, no desde el backend
- Las renovaciones automáticas también generan webhooks de tipo `RENEWAL`
- Las cancelaciones generan eventos de tipo `CANCELLATION`

