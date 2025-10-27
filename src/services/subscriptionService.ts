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
import { isExpoGo } from '../config/expoGoConfig';
import { isAdminEmail } from '../config/adminConfig';

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
const REVENUECAT_API_KEY = {
  ios: 'sk_ORwbKeMvzBapPnHcbzlxbGeulgeAi', // API key de RevenueCat para iOS (producción)
  ios_sandbox: 'test_oHHhNQjFIioQxDmtSBjCJzqpRRT', // Sandbox API key para testing
  android: 'sk_ORwbKeMvzBapPnHcbzlxbGeulgeAi', // API key de RevenueCat para Android (producción)
  // Para Expo Go, usar la API key de sandbox
  expo_go: 'test_oHHhNQjFIioQxDmtSBjCJzqpRRT', // API key para Expo Go
};

// NOTA: Verifica que estas API keys sean correctas en tu dashboard de RevenueCat
// Deberías tener API keys diferentes para iOS y Android si los configuraste por separado

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
      
      // Configurar RevenueCat - usar API key apropiada
      const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY.ios : REVENUECAT_API_KEY.android;
      
      if (!apiKey || apiKey === 'your_android_api_key_here') {
        throw new Error('API key de RevenueCat no configurada correctamente');
      }

      console.log(`📱 Build nativo ${Platform.OS} - usando API key de producción`);

      // Configurar RevenueCat
      await Purchases.configure({ apiKey });
      console.log('✅ RevenueCat configurado correctamente');

      // Obtener productos disponibles
      await this.loadProducts();

      this.isInitialized = true;
      console.log('✅ Servicio de suscripciones inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando servicio de suscripciones:', error);
      // En lugar de lanzar error, continuar sin RevenueCat
      console.log('⚠️ Continuando sin RevenueCat - funcionalidad premium limitada');
      this.isInitialized = false;
    }
  }

  // RevenueCat maneja automáticamente los listeners, no necesitamos configurarlos manualmente

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

      console.log('🛒 Iniciando compra de suscripción:', productId);
      
      // Verificar que el producto existe
      const product = this.products.find(p => p.identifier === productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      // Obtener ofertas de RevenueCat
      const offerings = await Purchases.getOfferings();
      if (!offerings.current) {
        throw new Error('No hay ofertas disponibles');
      }

      // Encontrar el paquete correspondiente
      const packageToPurchase = offerings.current.availablePackages.find(
        pkg => pkg.identifier === productId || pkg.product.identifier === productId
      );

      if (!packageToPurchase) {
        throw new Error('Paquete no encontrado en RevenueCat');
      }

      // Realizar la compra
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      // Verificar si el usuario tiene acceso premium
      if (customerInfo.entitlements.active[PREMIUM_ENTITLEMENT]) {
        console.log('✅ Compra exitosa, usuario tiene acceso premium');
        await this.refreshPremiumStatusFromRevenueCat();
        
        // Notificar al backend sobre la compra (para comisiones de afiliados)
        await this.notifyBackendAboutPurchase(productId, customerInfo);
      } else {
        throw new Error('Compra exitosa pero sin acceso premium');
      }
      
    } catch (error) {
      console.error('❌ Error en compra:', error);
      throw error;
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

      const customerInfo = await Purchases.getCustomerInfo();
      const status = this.parseCustomerInfoToPremiumStatus(customerInfo);
      await this.savePremiumStatus(status);
      console.log('✅ Estado premium actualizado desde RevenueCat');
    } catch (error) {
      console.error('❌ Error refrescando estado desde RevenueCat:', error);
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
      
      // Verificar si es admin por email
      if (user.email && isAdminEmail(user.email)) {
        console.log('👑 Usuario es admin por email:', user.email);
        return true;
      }
      
      // Verificar si es afiliado
      if (user.is_affiliate) {
        console.log('🤝 Usuario es afiliado');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error verificando rol de usuario:', error);
      return false;
    }
  }

  private async notifyBackendAboutPurchase(productId: string, customerInfo: CustomerInfo): Promise<void> {
    try {
      console.log('📤 [SUBSCRIPTION] Notificando al backend sobre la compra...');
      
      const { default: apiService } = await import('./apiService');
      const userId = await this.getCurrentUserId();
      
      // Extraer información de la compra
      const premiumEntitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT];
      const subscriptionType = productId.includes('Monthly') ? 'monthly' : 'yearly';
      
      // Obtener el ID de la transacción más reciente
      const transactionId = premiumEntitlement?.latestPurchaseDate || new Date().toISOString();
      
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
      const response = await apiService.post('/subscriptions/purchase', purchaseData);
      
      if (response.success) {
        console.log('✅ [SUBSCRIPTION] Backend notificado exitosamente');
        console.log('💰 [SUBSCRIPTION] Comisión de afiliado procesada:', response.data);
      } else {
        console.warn('⚠️ [SUBSCRIPTION] Backend respondió con error:', response.message);
      }
      
    } catch (error) {
      console.error('❌ [SUBSCRIPTION] Error notificando al backend:', error);
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
