// Importación condicional de react-native-purchases para evitar errores
let Purchases: any = null;

// Función para verificar si estamos en un entorno real (no simulador)
const isRealDevice = () => {
  return !__DEV__ || (typeof window !== 'undefined' && window.location?.hostname !== 'localhost');
};

// Función helper para verificar si Purchases está disponible
const isPurchasesAvailable = () => {
  return Purchases && typeof Purchases.configure === 'function';
};

try {
  if (isRealDevice()) {
    Purchases = require('react-native-purchases');
  } else {
    console.warn('⚠️ En modo desarrollo/simulador, usando modo simulación para RevenueCat');
  }
} catch (error) {
  console.warn('⚠️ react-native-purchases no disponible, usando modo simulación');
}

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

// IDs de productos de suscripción para RevenueCat
const SUBSCRIPTION_PRODUCTS = [
  'fitso_premium_monthly',
  'fitso_premium_yearly',
];

// Entitlement ID (esto lo configurarás en RevenueCat dashboard)
const PREMIUM_ENTITLEMENT = 'Premium';

// Claves de almacenamiento
const PREMIUM_STATUS_KEY = '@fitso_premium_status';
const DAILY_SCANS_KEY = '@fitso_daily_scans';

// API Keys de RevenueCat (las obtendrás del dashboard)
const REVENUECAT_API_KEY = {
  ios: 'sk_ORwbKeMvzBapPnHcbzlxbGeulgeAi', // API key de RevenueCat para iOS (producción)
  ios_sandbox: 'test_oHHhNQjFIioQxDmtSBjCJzqpRRT', // Sandbox API key para testing
  android: 'your_android_api_key_here', // Reemplazar con tu API key real cuando esté listo
};

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
      
      // Verificar si react-native-purchases está disponible
      if (!Purchases) {
        console.warn('⚠️ react-native-purchases no disponible, usando modo simulación');
        this.isInitialized = true;
        return;
      }

      // Configurar RevenueCat - usar API key de producción
      const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY.ios : REVENUECAT_API_KEY.android;
      
      if (apiKey === 'your_ios_api_key_here' || apiKey === 'your_android_api_key_here') {
        console.warn('⚠️ API keys de RevenueCat no configuradas, usando modo simulación');
        this.isInitialized = true;
        return;
      }

      // Configurar RevenueCat solo si está disponible
      if (isPurchasesAvailable()) {
        await Purchases.configure({ apiKey });
        console.log('✅ RevenueCat configurado correctamente');
      } else {
        console.warn('⚠️ RevenueCat no disponible, usando modo simulación');
        this.isInitialized = true;
        return;
      }

      // Obtener productos disponibles
      await this.loadProducts();

      this.isInitialized = true;
      console.log('✅ Servicio de suscripciones inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando servicio de suscripciones:', error);
      // En caso de error, marcar como inicializado para evitar bucles
      this.isInitialized = true;
    }
  }

  // RevenueCat maneja automáticamente los listeners, no necesitamos configurarlos manualmente

  private async loadProducts(): Promise<void> {
    try {
      if (!Purchases) {
        console.warn('⚠️ react-native-purchases no disponible, usando productos simulados');
        this.products = [
          {
            identifier: 'fitso_premium_monthly',
            price: 2.99,
            priceString: '$2.99',
            currencyCode: 'USD',
            title: 'Fitso Premium Mensual',
            description: 'Suscripción mensual a Fitso Premium'
          },
          {
            identifier: 'fitso_premium_yearly',
            price: 19.99,
            priceString: '$19.99',
            currencyCode: 'USD',
            title: 'Fitso Premium Anual',
            description: 'Suscripción anual a Fitso Premium'
          }
        ];
        return;
      }
      
      if (!isPurchasesAvailable()) {
        console.warn('⚠️ RevenueCat no disponible, usando productos simulados');
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
        throw new Error('No hay ofertas disponibles');
      }
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      // En caso de error, usar productos simulados
      this.products = [
        {
          identifier: 'fitso_premium_monthly',
          price: 2.99,
          priceString: '$2.99',
          currencyCode: 'USD',
          title: 'Fitso Premium Mensual',
          description: 'Suscripción mensual a Fitso Premium'
        },
        {
          identifier: 'fitso_premium_yearly',
          price: 19.99,
          priceString: '$19.99',
          currencyCode: 'USD',
          title: 'Fitso Premium Anual',
          description: 'Suscripción anual a Fitso Premium'
        }
      ];
    }
  }

  // RevenueCat maneja automáticamente el procesamiento de compras

  async getProducts(): Promise<Product[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.products;
  }

  async purchaseSubscription(productId: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('🛒 Iniciando compra de suscripción:', productId);
      
      // Verificar que el producto existe
      const product = this.products.find(p => p.identifier === productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      if (!Purchases) {
        console.warn('⚠️ react-native-purchases no disponible, simulando compra');
        // Simular compra exitosa
        const mockStatus: PremiumStatus = {
          isPremium: true,
          subscriptionType: productId === 'fitso_premium_monthly' ? 'monthly' : 'yearly',
          expiresAt: new Date(Date.now() + (productId === 'fitso_premium_monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
          dailyScansUsed: 0,
          lastScanDate: null,
        };
        await this.savePremiumStatus(mockStatus);
        return;
      }

      // Obtener ofertas de RevenueCat
      if (!isPurchasesAvailable()) {
        throw new Error('RevenueCat no disponible en el simulador');
      }
      
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
        await this.initialize();
      }

      console.log('🔄 Restaurando compras...');
      
      if (!Purchases) {
        console.warn('⚠️ react-native-purchases no disponible, no se pueden restaurar compras');
        return;
      }

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
      // Si RevenueCat está disponible, usar su información
      if (Purchases && this.isInitialized) {
        try {
          const customerInfo = await Purchases.getCustomerInfo();
          return this.parseCustomerInfoToPremiumStatus(customerInfo);
        } catch (error) {
          console.log('⚠️ Error obteniendo información de RevenueCat, usando estado local:', error.message);
        }
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
      
      if (activeSubscriptions.includes('fitso_premium_monthly')) {
        subscriptionType = 'monthly';
      } else if (activeSubscriptions.includes('fitso_premium_yearly')) {
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
      if (!Purchases) return;
      
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

  async cleanup(): Promise<void> {
    try {
      // RevenueCat no requiere limpieza manual como react-native-iap
      // Se encarga automáticamente de la gestión de conexiones
      
      this.isInitialized = false;
      console.log('🧹 Servicio de suscripciones limpiado');
    } catch (error) {
      console.error('❌ Error limpiando servicio de suscripciones:', error);
    }
  }
}

export default new SubscriptionService();
