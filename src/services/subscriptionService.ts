// Importación de react-native-purchases
import Purchases from 'react-native-purchases';

// Tipos para RevenueCat
interface Product {
  identifier: string;
  description: string;
  title: string;
  price: number;
  priceString: string;
  currencyCode: string;
}

interface CustomerInfo {
  activeSubscriptions: string[];
  allPurchaseDates: { [key: string]: string };
  nonSubscriptionTransactions: any[];
  firstSeen: string;
  originalAppUserId: string;
  managementURL: string | null;
  originalApplicationVersion: string | null;
  originalPurchaseDate: string | null;
  allExpirationDates: { [key: string]: string | null };
  entitlements: {
    all: { [key: string]: any };
    active: { [key: string]: any };
  };
}

interface PurchaseError {
  code: string;
  message: string;
  underlyingErrorMessage?: string;
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { isExpoGo } from '../config/expoGoConfig';
import { isAdminEmail } from '../config/adminConfig';

/**
 * Detecta si la app está corriendo en TestFlight
 * 
 * IMPORTANTE sobre TestFlight y compras:
 * - TestFlight es un entorno de testing de Apple
 * - Las compras pueden ir a sandbox O producción dependiendo del tipo de cuenta:
 *   * Si el usuario usa una cuenta Sandbox Tester → compra en sandbox
 *   * Si el usuario usa una cuenta real → compra en producción (puede generar cargo real)
 * 
 * Para RevenueCat:
 * - Si usamos sandbox API key → las compras aparecen en RevenueCat sandbox dashboard
 * - Si usamos production API key → las compras aparecen en RevenueCat production dashboard
 * 
 * Recomendación: Usar sandbox API key en TestFlight para testing sin cargos reales
 */
const isTestFlight = (): boolean => {
  try {
    const executionEnvironment = Constants.executionEnvironment;
    
    // TestFlight tiene executionEnvironment === 'storeClient'
    // También podemos verificar otras señales
    if (executionEnvironment === 'storeClient') {
      return true;
    }
    
    // Detección alternativa: standalone build sin __DEV__ en iOS
    // (esto podría incluir TestFlight o App Store, pero es mejor asumir TestFlight)
    if (Platform.OS === 'ios' && !__DEV__) {
      const appOwnership = Constants.appOwnership;
      // Verificar si es standalone (puede ser 'standalone' como string o un enum)
      if (appOwnership && String(appOwnership) === 'standalone') {
        // Podríamos verificar también por bundle identifier o build number
        // pero por seguridad, asumimos que es TestFlight si no es __DEV__
        // NOTA: Esto podría detectar App Store también, considera usar una variable de entorno
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.log('⚠️ Error detectando TestFlight:', error);
    return false;
  }
};

// IDs de productos de suscripción para RevenueCat
// Estos son los IDs que configuraste en RevenueCat dashboard
const SUBSCRIPTION_PRODUCTS = [
  'Fitso_Premium_Monthly',  // Producto mensual
  'Fitso_Premium_Yearly',   // Producto anual
];

// Entitlement ID (configurado en RevenueCat dashboard)
const PREMIUM_ENTITLEMENT = 'entl0b12b2e363'; // ID real del entitlement "Fitso Premium"

// Claves de almacenamiento
const PREMIUM_STATUS_KEY = '@fitso_premium_status';
const DAILY_SCANS_KEY = '@fitso_daily_scans';

// API Keys de RevenueCat (obtenidas del dashboard de RevenueCat)
// IMPORTANTE: Para testing en sandbox, usa la Public API Key (no la Secret API Key)
// La Public API Key para Test Store se encuentra en: RevenueCat Dashboard > API keys > SDK API keys > Test Store
const REVENUECAT_API_KEY = {
  ios: 'sk_ORwbKeMvzBapPnHcbzlxbGeulgeAi', // Secret API key de RevenueCat para iOS (producción) - NO USAR EN SDK
  ios_public: 'appl_TRTJqwjPGgmElgtUPfEOMesnIlk', // Public API key para iOS (producción)
  ios_sandbox: 'test_oHHhNQjFIioQxDmtSBjCJzqpRRT', // Sandbox API key para testing (Test Store)
  android: 'sk_ORwbKeMvzBapPnHcbzlxbGeulgeAi', // Secret API key de RevenueCat para Android (producción) - NO USAR EN SDK
  android_public: 'appl_TRTJqwjPGgmElgtUPfEOMesnIlk', // Public API key para Android (producción)
  // Para Expo Go, usar la API key de sandbox
  expo_go: 'test_oHHhNQjFIioQxDmtSBjCJzqpRRT', // API key para Expo Go
};

// NOTA: 
// - Para testing en sandbox, usar la Public API Key del Test Store
// - Las Secret API Keys (sk_*) solo se usan en el backend, NO en el SDK
// - El SDK usa Public API Keys (appl_* para producción, test_* para sandbox)

export interface PremiumStatus {
  isPremium: boolean;
  subscriptionType: 'monthly' | 'yearly' | null;
  expiresAt: string | null;
  dailyScansUsed: number;
  lastScanDate: string | null;
}

class SubscriptionService {
  private isInitialized = false;
  private products: Product[] = [];

  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      console.log('🔄 Inicializando servicio de suscripciones con RevenueCat...');
      
      // Verificar si estamos en Expo Go
      if (isExpoGo()) {
        console.log('📱 Expo Go detectado - RevenueCat no disponible');
        console.log('⚠️ Las compras in-app no están disponibles en Expo Go');
        this.isInitialized = false;
        return;
      }
      
      // Determinar si usar sandbox o producción
      // IMPORTANTE: Sandbox es correcto para TestFlight, pero las compras se procesan como reales
      const isTF = isTestFlight();
      const useSandbox = __DEV__ || isTF;
      const environment = useSandbox ? 'SANDBOX' : 'PRODUCCIÓN';
      
      if (isTF) {
        console.log('🧪 TestFlight detectado - usando SANDBOX (las compras se procesan correctamente)');
      } else if (__DEV__) {
        console.log('🧪 Modo desarrollo - usando SANDBOX');
      } else {
        console.log('🏭 Modo PRODUCCIÓN - usando API keys de producción');
      }
      
      // Seleccionar API key apropiada
      // IMPORTANTE: Usar Public API Keys para el SDK, NO Secret API Keys
      let apiKey: string;
      
      if (useSandbox) {
        // En sandbox, usar la Test Store public API key
        apiKey = REVENUECAT_API_KEY.ios_sandbox;
        console.log(`🧪 Modo SANDBOX activado - las compras aparecerán en sandbox de RevenueCat`);
      } else {
        // En producción, usar la public API key correspondiente
        if (Platform.OS === 'ios') {
          apiKey = REVENUECAT_API_KEY.ios_public;
        } else {
          apiKey = REVENUECAT_API_KEY.android_public;
        }
      }
      
      if (!apiKey || apiKey === 'your_android_api_key_here') {
        throw new Error('API key de RevenueCat no configurada correctamente');
      }

      console.log(`📱 Build nativo ${Platform.OS} - usando API key de ${environment}`);
      console.log(`🔑 API Key: ${apiKey.substring(0, 20)}...`);

      // Configurar RevenueCat
      await Purchases.configure({ apiKey });
      console.log('✅ RevenueCat configurado correctamente');

      // Configurar App User ID para identificar al usuario en RevenueCat
      // IMPORTANTE: Debe hacerse ANTES de cualquier compra para evitar transferencias de purchases
      // Esto permite rastrear las compras en el dashboard de RevenueCat
      try {
        const userId = await this.getCurrentUserId();
        if (userId) {
          console.log(`👤 Configurando App User ID durante inicialización: ${userId}`);
          
          // Verificar el App User ID actual antes de cambiarlo
          const currentCustomerInfo = await Purchases.getCustomerInfo();
          const currentAppUserId = currentCustomerInfo.originalAppUserId;
          
          if (currentAppUserId && currentAppUserId !== userId) {
            console.warn(`⚠️ [INIT] App User ID actual (${currentAppUserId}) diferente al esperado (${userId})`);
            console.warn(`⚠️ [INIT] Esto puede causar transferencias de purchases si hay compras previas`);
          }
          
          await Purchases.logIn(userId);
          
          // Verificar que se configuró correctamente
          const verifyCustomerInfo = await Purchases.getCustomerInfo();
          if (verifyCustomerInfo.originalAppUserId !== userId) {
            console.error(`❌ [INIT] Error: App User ID no se configuró correctamente`);
            console.error(`  - Esperado: ${userId}`);
            console.error(`  - Obtenido: ${verifyCustomerInfo.originalAppUserId}`);
          } else {
            console.log('✅ [INIT] App User ID configurado correctamente en RevenueCat');
          }
        } else {
          console.log('⚠️ No se pudo obtener User ID, RevenueCat usará un ID anónimo');
          console.log('⚠️ NOTA: Si el usuario hace compra sin App User ID, las compras pueden no asociarse correctamente');
        }
      } catch (userIdError) {
        console.log('⚠️ Usuario no autenticado aún, RevenueCat usará un ID anónimo');
        console.log('ℹ️ El App User ID se configurará automáticamente cuando el usuario inicie sesión');
      }

      // Obtener productos disponibles
      await this.loadProducts();

      this.isInitialized = true;
      console.log('✅ Servicio de suscripciones inicializado correctamente');
      
      if (useSandbox) {
        console.log('🧪 NOTA: Estás en modo SANDBOX. Las compras de prueba aparecerán en RevenueCat sandbox.');
      }
    } catch (error) {
      console.error('❌ Error inicializando servicio de suscripciones:', error);
      // En lugar de lanzar error, continuar sin RevenueCat
      console.log('⚠️ Continuando sin RevenueCat - funcionalidad premium limitada');
      this.isInitialized = false;
    }
  }

  // RevenueCat maneja automáticamente los listeners, no necesitamos configurarlos manualmente

  /**
   * Configurar el App User ID en RevenueCat después de que el usuario se autentique
   * Esto permite rastrear las compras del usuario en el dashboard de RevenueCat
   */
  async setAppUserId(userId: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        console.log('⚠️ RevenueCat no inicializado aún, inicializando primero...');
        await this.initialize();
      }

      if (!this.isInitialized) {
        console.log('⚠️ RevenueCat no pudo inicializarse, no se configurará App User ID');
        return;
      }

      console.log(`👤 Configurando App User ID en RevenueCat: ${userId}`);
      await Purchases.logIn(userId);
      console.log('✅ App User ID configurado exitosamente en RevenueCat');
    } catch (error) {
      console.error('❌ Error configurando App User ID:', error);
      // No lanzar error para no romper el flujo de la app
    }
  }

  private async loadProducts(): Promise<void> {
    try {
      if (!this.isInitialized) {
        console.log('⚠️ RevenueCat no inicializado, saltando carga de productos');
        return;
      }

      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        this.products = offerings.current.availablePackages.map(pkg => ({
          identifier: pkg.identifier,
          price: pkg.product.price,
          priceString: pkg.product.priceString,
          currencyCode: pkg.product.currencyCode,
          title: pkg.product.title,
          description: pkg.product.description,
        }));
        console.log('📦 Productos cargados desde RevenueCat:', this.products);
      } else {
        console.log('⚠️ No hay ofertas disponibles en RevenueCat');
        this.products = []; // Inicializar como array vacío
      }
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      this.products = []; // En caso de error, usar array vacío
      // No lanzar error para evitar romper la inicialización
    }
  }

  // RevenueCat maneja automáticamente el procesamiento de compras

  async getProducts(): Promise<Product[]> {
    if (!this.isInitialized) {
      try {
        await this.initialize();
      } catch (error) {
        console.log('⚠️ No se pudo inicializar RevenueCat, retornando productos vacíos');
        return [];
      }
    }
    return this.products || [];
  }

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

      console.log('👤 [PURCHASE] Configurando App User ID antes de la compra:', userId);
      await Purchases.logIn(userId);
      console.log('✅ [PURCHASE] App User ID configurado correctamente');

      // Verificar que el App User ID se configuró correctamente
      const verifyCustomerInfo = await Purchases.getCustomerInfo();
      console.log('👤 [PURCHASE] App User ID verificado en RevenueCat:', verifyCustomerInfo.originalAppUserId);
      
      if (verifyCustomerInfo.originalAppUserId !== userId) {
        console.warn('⚠️ [PURCHASE] App User ID no coincide, forzando actualización...');
        await Purchases.logIn(userId);
        const reVerifyInfo = await Purchases.getCustomerInfo();
        console.log('✅ [PURCHASE] App User ID actualizado:', reVerifyInfo.originalAppUserId);
      }

      console.log('🛒 [PURCHASE] Iniciando compra de suscripción:', productId);
      console.log('📦 [PURCHASE] Productos disponibles en lista cargada:', this.products.map(p => p.identifier));
      
      // Obtener ofertas de RevenueCat primero
      // Los productIds pueden ser package IDs de RevenueCat ($rc_monthly, $rc_annual)
      // o product IDs de Apple (Fitso_Premium_Monthly, etc.)
      console.log('🔄 [PURCHASE] Obteniendo ofertas de RevenueCat...');
      const offerings = await Purchases.getOfferings();
      if (!offerings.current) {
        console.error('❌ [PURCHASE] No hay ofertas disponibles');
        console.error('❌ [PURCHASE] Esto puede deberse a:');
        console.error('   1. RevenueCat no está configurado correctamente');
        console.error('   2. Los productos no están configurados en RevenueCat');
        console.error('   3. No hay conexión a internet');
        throw new Error('No pudimos procesar tu compra. Por favor, verifica tu conexión e inténtalo de nuevo.');
      }
      console.log('✅ [PURCHASE] Ofertas encontradas:', offerings.current.availablePackages.map(p => ({
        packageId: p.identifier,
        productId: p.product.identifier
      })));

      // Verificar que el producto existe en la lista cargada (opcional, solo para logging)
      // Nota: Si productId es un package ID ($rc_monthly), no estará en this.products
      const product = this.products.find(p => 
        p.identifier === productId || 
        p.identifier.toLowerCase() === productId.toLowerCase()
      );
      
      if (product) {
        console.log('✅ [PURCHASE] Producto encontrado en lista cargada:', product.title);
      } else {
        console.log('ℹ️ [PURCHASE] Producto no en lista cargada, pero esto está bien si usamos package IDs directamente');
      }

      // Encontrar el paquete correspondiente
      // El productId puede ser:
      // - Un product ID de Apple (Fitso_Premium_Monthly, Fitso_Premium_Yearly)
      // - Un product ID de Test Store (Fitso_Premium_Monthly_Test, Yearly_Test)
      // - Un package ID de RevenueCat ($rc_monthly, $rc_annual, etc.)
      console.log('📦 [PURCHASE] Buscando paquete para:', productId);
      console.log('📦 [PURCHASE] Paquetes disponibles:', offerings.current.availablePackages.map(p => ({
        packageId: p.identifier,
        productId: p.product.identifier,
        productTitle: p.product.title
      })));
      
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

      // Realizar la compra
      console.log('💳 [PURCHASE] Iniciando compra con RevenueCat...');
      const { customerInfo: purchaseCustomerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      console.log('📦 [PURCHASE] Customer Info después de compra:');
      console.log('  - App User ID:', purchaseCustomerInfo.originalAppUserId);
      console.log('  - Active Subscriptions:', purchaseCustomerInfo.activeSubscriptions);
      console.log('  - All Entitlements:', Object.keys(purchaseCustomerInfo.entitlements.all || {}));
      console.log('  - Active Entitlements:', Object.keys(purchaseCustomerInfo.entitlements.active || {}));
      console.log('  - Buscando entitlement:', PREMIUM_ENTITLEMENT);
      
      // Verificar que el App User ID sigue siendo el correcto después de la compra
      if (purchaseCustomerInfo.originalAppUserId !== userId) {
        console.error('⚠️ [PURCHASE] ADVERTENCIA: App User ID cambió después de la compra!');
        console.error('  - Esperado:', userId);
        console.error('  - Obtenido:', purchaseCustomerInfo.originalAppUserId);
        console.error('  - Esto puede causar que las compras se transfieran a otro usuario');
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
      const premiumEntitlement = finalCustomerInfo.entitlements.active[PREMIUM_ENTITLEMENT];
      if (premiumEntitlement) {
        console.log('✅ [PURCHASE] Compra exitosa, usuario tiene acceso premium');
        console.log('📦 [PURCHASE] Premium entitlement activo:');
        console.log('  - Identifier:', premiumEntitlement.identifier);
        console.log('  - Expiration Date:', premiumEntitlement.expirationDate);
        console.log('  - Is Active:', premiumEntitlement.isActive);
        
        // Actualizar estado premium desde RevenueCat inmediatamente
        await this.refreshPremiumStatusFromRevenueCat();
        
        // Forzar otra actualización después de un pequeño delay para asegurar que se sincroniza
        setTimeout(async () => {
          console.log('🔄 [PURCHASE] Re-verificando estado premium después de compra...');
          await this.refreshPremiumStatusFromRevenueCat();
        }, 2000);
        
        // Notificar al backend sobre la compra (para comisiones de afiliados)
        await this.notifyBackendAboutPurchase(productId, finalCustomerInfo);
      } else {
        console.error('❌ [PURCHASE] Compra exitosa pero NO hay entitlement activo');
        console.error('❌ [PURCHASE] Entitlements disponibles:', Object.keys(finalCustomerInfo.entitlements.all || {}));
        console.error('❌ [PURCHASE] Entitlements activos:', Object.keys(finalCustomerInfo.entitlements.active || {}));
        console.error('❌ [PURCHASE] Buscando entitlement:', PREMIUM_ENTITLEMENT);
        console.error('❌ [PURCHASE] Customer Info completo:', JSON.stringify(finalCustomerInfo, null, 2));
        
        // Intentar restaurar compras por si hay un problema de sincronización
        console.log('🔄 [PURCHASE] Intentando restaurar compras...');
        try {
          const restoredCustomerInfo = await Purchases.restorePurchases();
          console.log('📦 [PURCHASE] Customer Info después de restaurar:');
          console.log('  - Active Entitlements:', Object.keys(restoredCustomerInfo.entitlements.active || {}));
          
          if (restoredCustomerInfo.entitlements.active[PREMIUM_ENTITLEMENT]) {
            console.log('✅ [PURCHASE] Entitlement encontrado después de restaurar!');
            await this.refreshPremiumStatusFromRevenueCat();
            return; // Salir sin error
          }
        } catch (restoreError) {
          console.error('❌ [PURCHASE] Error restaurando compras:', restoreError);
        }
        
        // Aún así intentar actualizar el estado por si acaso
        await this.refreshPremiumStatusFromRevenueCat();
        
        throw new Error('Compra exitosa pero sin acceso premium. Por favor, cierra y reabre la app o contacta al soporte.');
      }
      
    } catch (error) {
      console.error('❌ [PURCHASE] Error en compra:', error);
      
      // Proporcionar mensajes de error más específicos
      if (error instanceof Error) {
        const errorMessage = error.message;
        const errorString = error.toString();
        
        console.error('❌ [PURCHASE] Tipo de error:', errorString);
        console.error('❌ [PURCHASE] Mensaje de error:', errorMessage);
        
        // Manejar errores específicos de RevenueCat
        if (errorMessage.includes('UserCancelledError') || errorMessage.includes('Cancelled') || errorString.includes('UserCancelledError')) {
          throw new Error('Compra cancelada');
        } else if (errorMessage.includes('NetworkError') || errorMessage.includes('network') || errorString.includes('NetworkError')) {
          throw new Error('Error de conexión. Verifica tu conexión a internet.');
        } else if (errorMessage.includes('ProductNotAvailableError') || errorMessage.includes('Product not available') || errorString.includes('ProductNotAvailableError')) {
          throw new Error('Producto no disponible en este momento.');
        } else if (errorMessage.includes('StoreProductNotAvailableError') || errorString.includes('StoreProductNotAvailableError')) {
          throw new Error('El producto no está disponible en la tienda.');
        } else if (errorMessage.includes('PurchaseNotAllowedError') || errorMessage.includes('Purchase not allowed') || errorString.includes('PurchaseNotAllowedError')) {
          throw new Error('Las compras no están permitidas en este dispositivo.');
        } else if (errorMessage.includes('ReceiptAlreadyInUseError') || errorString.includes('ReceiptAlreadyInUseError')) {
          throw new Error('Este recibo ya está siendo usado por otra cuenta.');
        } else if (errorMessage.includes('InvalidReceiptError') || errorString.includes('InvalidReceiptError')) {
          throw new Error('Recibo inválido. Por favor, contacta al soporte.');
        } else if (errorMessage.includes('MissingReceiptFileError') || errorString.includes('MissingReceiptFileError')) {
          throw new Error('No se pudo encontrar el recibo de compra.');
        } else if (errorMessage.includes('InvalidAppUserIdError') || errorString.includes('InvalidAppUserIdError')) {
          throw new Error('Error de autenticación. Por favor, cierra y reabre la app.');
        } else if (errorMessage.includes('AlreadyPurchasedError') || errorString.includes('AlreadyPurchasedError')) {
          throw new Error('Ya tienes esta suscripción activa.');
        } else if (errorMessage.includes('InvalidCredentialsError') || errorString.includes('InvalidCredentialsError')) {
          throw new Error('Credenciales inválidas. Por favor, contacta al soporte.');
        } else if (errorMessage.includes('Package not found') || errorMessage.includes('No pudimos encontrar')) {
          // Este es nuestro error personalizado
          throw error;
        } else {
          // Para otros errores, proporcionar mensaje más útil
          console.error('❌ [PURCHASE] Error no reconocido, detalles completos:', {
            message: errorMessage,
            stack: error.stack,
            name: error.name
          });
          throw new Error(errorMessage || 'No pudimos procesar tu compra. Por favor, inténtalo de nuevo.');
        }
      } else {
        console.error('❌ [PURCHASE] Error no es instancia de Error:', error);
        throw new Error('Error desconocido al procesar la compra.');
      }
    }
  }

  async restorePurchases(): Promise<void> {
    try {
      if (!this.isInitialized) {
        try {
          await this.initialize();
        } catch (error) {
          throw new Error('RevenueCat no está disponible. Por favor, usa la versión nativa de la app para restaurar compras.');
        }
      }

      console.log('🔄 Restaurando compras...');
      
      // Restaurar compras con RevenueCat
      const customerInfo = await Purchases.restorePurchases();
      console.log('📦 Información del cliente restaurada:', customerInfo);

      // Verificar si el usuario tiene acceso premium
      if (customerInfo.entitlements.active[PREMIUM_ENTITLEMENT]) {
        console.log('✅ Compras restauradas exitosamente, usuario tiene acceso premium');
        await this.refreshPremiumStatusFromRevenueCat();
      } else {
        console.log('ℹ️ No se encontraron compras premium para restaurar');
      }
    } catch (error) {
      console.error('❌ Error restaurando compras:', error);
      throw error;
    }
  }

  async getPremiumStatus(): Promise<PremiumStatus> {
    try {
      // Verificar si el usuario es admin o afiliado
      const isAdminOrAffiliate = await this.isUserAdminOrAffiliate();
      if (isAdminOrAffiliate) {
        console.log('✅ Usuario admin/afiliado - estado premium automático');
        return {
          isPremium: true,
          subscriptionType: 'yearly', // Simular suscripción anual
          expiresAt: null, // Sin expiración
          dailyScansUsed: 0,
          lastScanDate: null,
        };
      }

      // Usar información de RevenueCat solo si está inicializado
      if (this.isInitialized) {
        try {
          const customerInfo = await Purchases.getCustomerInfo();
          return this.parseCustomerInfoToPremiumStatus(customerInfo);
        } catch (error) {
          console.log('⚠️ Error obteniendo información de RevenueCat, usando estado local:', error.message);
        }
      } else {
        console.log('⚠️ RevenueCat no inicializado, usando estado local');
      }

      // Fallback al estado local
      const statusJson = await AsyncStorage.getItem(PREMIUM_STATUS_KEY);
      
      if (!statusJson) {
        // Estado por defecto para usuarios no premium
        const defaultStatus: PremiumStatus = {
          isPremium: false,
          subscriptionType: null,
          expiresAt: null,
          dailyScansUsed: 0,
          lastScanDate: null,
        };
        await this.savePremiumStatus(defaultStatus);
        return defaultStatus;
      }

      const status: PremiumStatus = JSON.parse(statusJson);
      
      // IMPORTANTE: Si el usuario tiene isPremium: true en caché pero NO es admin/afiliado,
      // limpiar el caché para evitar el bug de premium automático
      // Verificar nuevamente si es admin/afiliado antes de usar el caché
      const isAdminOrAffiliateCheck = await this.isUserAdminOrAffiliate();
      if (status.isPremium && !isAdminOrAffiliateCheck) {
        console.log('⚠️ Usuario tiene isPremium: true en caché pero NO es admin/afiliado - limpiando caché');
        const correctedStatus: PremiumStatus = {
          isPremium: false,
          subscriptionType: null,
          expiresAt: null,
          dailyScansUsed: 0,
          lastScanDate: null,
        };
        await this.savePremiumStatus(correctedStatus);
        return correctedStatus;
      }
      
      // Verificar si la suscripción ha expirado
      if (status.isPremium && status.expiresAt) {
        const now = new Date();
        const expiresAt = new Date(status.expiresAt);
        
        if (now > expiresAt) {
          // Suscripción expirada
          const expiredStatus: PremiumStatus = {
            isPremium: false,
            subscriptionType: null,
            expiresAt: null,
            dailyScansUsed: 0,
            lastScanDate: null,
          };
          await this.savePremiumStatus(expiredStatus);
          return expiredStatus;
        }
      }

      return status;
    } catch (error) {
      console.error('❌ Error obteniendo estado premium:', error);
      // Retornar estado por defecto en caso de error
      return {
        isPremium: false,
        subscriptionType: null,
        expiresAt: null,
        dailyScansUsed: 0,
        lastScanDate: null,
      };
    }
  }

  async canUseAIScan(): Promise<boolean> {
    try {
      // Verificar si el usuario es admin o afiliado
      const isAdminOrAffiliate = await this.isUserAdminOrAffiliate();
      if (isAdminOrAffiliate) {
        console.log('✅ Usuario admin/afiliado - acceso ilimitado a escaneo con IA');
        return true;
      }

      const status = await this.getPremiumStatus();
      
      // Usuarios premium pueden usar IA ilimitadamente
      if (status.isPremium) {
        return true;
      }

      // Para usuarios no premium, verificar límite diario
      const today = new Date().toDateString();
      const lastScanDate = status.lastScanDate ? new Date(status.lastScanDate).toDateString() : null;

      // Si es un nuevo día, resetear contador
      if (lastScanDate !== today) {
        const updatedStatus: PremiumStatus = {
          ...status,
          dailyScansUsed: 0,
          lastScanDate: today,
        };
        await this.savePremiumStatus(updatedStatus);
        return true; // Puede usar el primer escaneo del día
      }

      // Verificar si ya usó el límite diario
      return status.dailyScansUsed < 1;
    } catch (error) {
      console.error('❌ Error verificando límite de IA:', error);
      return false; // En caso de error, no permitir escaneo
    }
  }

  async recordAIScan(): Promise<void> {
    try {
      // Verificar si el usuario es admin o afiliado
      const isAdminOrAffiliate = await this.isUserAdminOrAffiliate();
      if (isAdminOrAffiliate) {
        console.log('✅ Usuario admin/afiliado - no se registra escaneo');
        return;
      }

      const status = await this.getPremiumStatus();
      
      // Solo registrar si no es premium
      if (!status.isPremium) {
        const today = new Date().toDateString();
        const lastScanDate = status.lastScanDate ? new Date(status.lastScanDate).toDateString() : null;

        let updatedStatus: PremiumStatus;
        
        if (lastScanDate !== today) {
          // Nuevo día, resetear contador
          updatedStatus = {
            ...status,
            dailyScansUsed: 1,
            lastScanDate: today,
          };
        } else {
          // Mismo día, incrementar contador
          updatedStatus = {
            ...status,
            dailyScansUsed: status.dailyScansUsed + 1,
          };
        }

        await this.savePremiumStatus(updatedStatus);
        console.log('📊 Escaneo con IA registrado:', updatedStatus);
      }
    } catch (error) {
      console.error('❌ Error registrando escaneo con IA:', error);
    }
  }

  private async savePremiumStatus(status: PremiumStatus): Promise<void> {
    try {
      await AsyncStorage.setItem(PREMIUM_STATUS_KEY, JSON.stringify(status));
      console.log('💾 Estado premium guardado:', status);
    } catch (error) {
      console.error('❌ Error guardando estado premium:', error);
      throw error;
    }
  }

  // Métodos auxiliares para RevenueCat
  private parseCustomerInfoToPremiumStatus(customerInfo: CustomerInfo): PremiumStatus {
    const premiumEntitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT];
    
    if (premiumEntitlement) {
      // Determinar tipo de suscripción basado en los productos activos
      const activeSubscriptions = customerInfo.activeSubscriptions;
      let subscriptionType: 'monthly' | 'yearly' | null = null;
      
      if (activeSubscriptions.includes('Fitso_Premium_Monthly')) {
        subscriptionType = 'monthly';
      } else if (activeSubscriptions.includes('Fitso_Premium_Yearly')) {
        subscriptionType = 'yearly';
      }

      return {
        isPremium: true,
        subscriptionType,
        expiresAt: premiumEntitlement.expirationDate,
        dailyScansUsed: 0,
        lastScanDate: null,
      };
    }

    return {
      isPremium: false,
      subscriptionType: null,
      expiresAt: null,
      dailyScansUsed: 0,
      lastScanDate: null,
    };
  }

  private async refreshPremiumStatusFromRevenueCat(): Promise<void> {
    try {
      if (!this.isInitialized) {
        console.log('⚠️ RevenueCat no inicializado, saltando actualización desde RevenueCat');
        return;
      }

      console.log('🔄 [REFRESH] Obteniendo información del cliente de RevenueCat...');
      const customerInfo = await Purchases.getCustomerInfo();
      
      console.log('📦 [REFRESH] Customer Info recibido:');
      console.log('  - App User ID:', customerInfo.originalAppUserId);
      console.log('  - Active Subscriptions:', customerInfo.activeSubscriptions);
      console.log('  - All Entitlements:', Object.keys(customerInfo.entitlements.all || {}));
      console.log('  - Active Entitlements:', Object.keys(customerInfo.entitlements.active || {}));
      
      // Verificar el entitlement buscado
      console.log('🔍 [REFRESH] Buscando entitlement:', PREMIUM_ENTITLEMENT);
      
      const premiumEntitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT];
      if (premiumEntitlement) {
        console.log('✅ [REFRESH] Premium entitlement encontrado:', {
          identifier: premiumEntitlement.identifier,
          expirationDate: premiumEntitlement.expirationDate,
          isActive: premiumEntitlement.isActive,
          willRenew: premiumEntitlement.willRenew,
          productIdentifier: premiumEntitlement.productIdentifier
        });
      } else {
        console.log('⚠️ [REFRESH] Premium entitlement NO encontrado en activos');
        console.log('  - Buscando entitlement ID:', PREMIUM_ENTITLEMENT);
        console.log('  - Entitlements disponibles (all):', Object.keys(customerInfo.entitlements.all || {}));
        console.log('  - Entitlements activos:', Object.keys(customerInfo.entitlements.active || {}));
        
        // Si hay entitlements en "all" pero no en "active", puede ser que estén expirados
        if (customerInfo.entitlements.all && Object.keys(customerInfo.entitlements.all).length > 0) {
          console.log('⚠️ [REFRESH] Hay entitlements en "all" pero no están activos (pueden estar expirados)');
          Object.keys(customerInfo.entitlements.all).forEach(entId => {
            const ent = customerInfo.entitlements.all[entId];
            console.log(`  - ${entId}: activo=${ent.isActive}, expira=${ent.expirationDate}`);
          });
        }
      }
      
      const status = this.parseCustomerInfoToPremiumStatus(customerInfo);
      console.log('💾 [REFRESH] Estado premium parseado:', status);
      
      await this.savePremiumStatus(status);
      console.log('✅ [REFRESH] Estado premium guardado en local storage');
      console.log('✅ [REFRESH] Usuario es premium:', status.isPremium);
    } catch (error) {
      console.error('❌ [REFRESH] Error refrescando estado desde RevenueCat:', error);
      console.error('❌ [REFRESH] Stack:', error.stack);
    }
  }

  private async getPremiumStatusFromBackend(): Promise<PremiumStatus | null> {
    try {
      const { default: apiService } = await import('./apiService');
      const userId = await this.getCurrentUserId();
      
      const response = await apiService.get(`/subscriptions/status/${userId}`);
      
      if (!response.success || !response.data) {
        return null;
      }

      const backendStatus = response.data as any;
      
      // Convertir formato del backend al formato local
      return {
        isPremium: backendStatus.isPremium,
        subscriptionType: backendStatus.subscriptionType,
        expiresAt: backendStatus.expiresAt,
        dailyScansUsed: 0, // No se maneja en el backend por ahora
        lastScanDate: null, // No se maneja en el backend por ahora
      };
    } catch (error) {
      // Si es error de autenticación, no mostrar error en consola
      if (error.message?.includes('Usuario no autenticado')) {
        console.log('ℹ️ Usuario no autenticado, usando estado local');
        return null;
      }
      console.error('❌ Error obteniendo estado del backend:', error);
      return null;
    }
  }

  private async refreshPremiumStatusFromBackend(): Promise<void> {
    try {
      const backendStatus = await this.getPremiumStatusFromBackend();
      if (backendStatus) {
        await this.savePremiumStatus(backendStatus);
        console.log('✅ Estado premium sincronizado con el backend');
      }
    } catch (error) {
      console.error('❌ Error refrescando estado del backend:', error);
    }
  }

  private async getCurrentUserId(): Promise<string> {
    try {
      // Obtener el ID del usuario desde AsyncStorage (donde se guarda en AuthContext)
      const cachedUserData = await AsyncStorage.getItem('cached_user_data');
      if (!cachedUserData) {
        throw new Error('Usuario no autenticado');
      }
      
      const userData = JSON.parse(cachedUserData);
      if (!userData || !userData.id) {
        throw new Error('Datos de usuario inválidos');
      }
      
      return userData.id;
    } catch (error) {
      console.error('❌ Error obteniendo ID de usuario:', error);
      throw error;
    }
  }

  private async getCurrentUser(): Promise<any> {
    try {
      // Obtener los datos del usuario desde AsyncStorage
      const cachedUserData = await AsyncStorage.getItem('cached_user_data');
      if (!cachedUserData) {
        throw new Error('Usuario no autenticado');
      }
      
      const userData = JSON.parse(cachedUserData);
      if (!userData) {
        throw new Error('Datos de usuario inválidos');
      }
      
      return userData;
    } catch (error) {
      console.error('❌ Error obteniendo datos de usuario:', error);
      throw error;
    }
  }

  private async isUserAdminOrAffiliate(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      
      console.log('🔍 Verificando rol de usuario:', { 
        email: user.email, 
        is_affiliate: user.is_affiliate,
        id: user.id 
      });
      
      // 1. Verificar si es admin por email
      if (user.email && isAdminEmail(user.email)) {
        console.log('👑 Usuario es admin por email:', user.email);
        return true;
      }
      
      // 2. Verificar si el usuario tiene el campo is_affiliate = true 
      // SOLO usuarios creados desde el admin panel con is_affiliate = true
      // pueden tener acceso premium gratuito
      if (user.is_affiliate === true) {
        console.log('✅ Usuario es afiliado (is_affiliate = true) - tiene acceso premium');
        return true;
      }
      
      console.log('ℹ️ Usuario NO es admin ni afiliado (is_affiliate = false)');
      return false;
    } catch (error) {
      console.error('❌ Error verificando rol de usuario:', error);
      return false;
    }
  }
  
  private async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return token;
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  }

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

  async cleanup(): Promise<void> {
    try {
      // RevenueCat no requiere limpieza manual
      // Se encarga automáticamente de la gestión de conexiones
      
      this.isInitialized = false;
      console.log('🧹 Servicio de suscripciones limpiado');
    } catch (error) {
      console.error('❌ Error limpiando servicio de suscripciones:', error);
    }
  }
}

export default new SubscriptionService();
