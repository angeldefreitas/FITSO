// Importación condicional de react-native-iap para evitar errores
let iapModule: any = null;
try {
  iapModule = require('react-native-iap');
} catch (error) {
  console.warn('⚠️ react-native-iap no disponible, usando modo simulación');
}

// Tipos por defecto si el módulo no está disponible
interface Product {
  productId: string;
  price: string;
  currency: string;
  title: string;
  description: string;
}

interface Purchase {
  productId: string;
  transactionId: string;
  transactionDate: number;
  transactionReceipt: string;
}

interface PurchaseError {
  code: string;
  message: string;
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// IDs de productos de suscripción
const SUBSCRIPTION_PRODUCTS = [
  'fitso_premium_monthly',
  'fitso_premium_yearly',
];

// Claves de almacenamiento
const PREMIUM_STATUS_KEY = '@fitso_premium_status';
const DAILY_SCANS_KEY = '@fitso_daily_scans';

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
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;

  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      console.log('🔄 Inicializando servicio de suscripciones...');
      
      // Verificar si react-native-iap está disponible
      if (!iapModule) {
        console.warn('⚠️ react-native-iap no disponible, usando modo simulación');
        this.isInitialized = true;
        return;
      }
      
      // Inicializar conexión con la tienda
      const result = await iapModule.initConnection();
      console.log('✅ Conexión con tienda inicializada:', result);

      // Configurar listeners de compras
      this.setupPurchaseListeners();

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

  private setupPurchaseListeners(): void {
    if (!iapModule) return;
    
    // Listener para compras exitosas
    this.purchaseUpdateSubscription = iapModule.purchaseUpdatedListener(
      async (purchase: Purchase) => {
        console.log('🛒 Compra actualizada:', purchase);
        try {
          // Procesar la compra
          await this.processPurchase(purchase);
          
          // Finalizar la transacción
          await iapModule.finishTransaction({ purchase, isConsumable: false });
          
          console.log('✅ Compra procesada exitosamente');
        } catch (error) {
          console.error('❌ Error procesando compra:', error);
        }
      }
    );

    // Listener para errores de compra
    this.purchaseErrorSubscription = iapModule.purchaseErrorListener(
      (error: PurchaseError) => {
        console.error('❌ Error en compra:', error);
      }
    );
  }

  private async loadProducts(): Promise<void> {
    try {
      if (!iapModule) {
        console.warn('⚠️ react-native-iap no disponible, usando productos simulados');
        this.products = [
          {
            productId: 'fitso_premium_monthly',
            price: '2.99',
            currency: 'USD',
            title: 'Fitso Premium Mensual',
            description: 'Suscripción mensual a Fitso Premium'
          },
          {
            productId: 'fitso_premium_yearly',
            price: '19.99',
            currency: 'USD',
            title: 'Fitso Premium Anual',
            description: 'Suscripción anual a Fitso Premium'
          }
        ];
        return;
      }
      
      this.products = await iapModule.getProducts({ skus: SUBSCRIPTION_PRODUCTS });
      console.log('📦 Productos cargados:', this.products);
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      // En caso de error, usar productos simulados
      this.products = [
        {
          productId: 'fitso_premium_monthly',
          price: '2.99',
          currency: 'USD',
          title: 'Fitso Premium Mensual',
          description: 'Suscripción mensual a Fitso Premium'
        },
        {
          productId: 'fitso_premium_yearly',
          price: '19.99',
          currency: 'USD',
          title: 'Fitso Premium Anual',
          description: 'Suscripción anual a Fitso Premium'
        }
      ];
    }
  }

  private async processPurchase(purchase: Purchase): Promise<void> {
    try {
      // Determinar tipo de suscripción
      const subscriptionType = purchase.productId === 'fitso_premium_monthly' ? 'monthly' : 'yearly';
      
      // Verificar con el backend
      await this.verifyReceiptWithBackend(purchase);
      
      // Actualizar estado local
      await this.refreshPremiumStatusFromBackend();
      
      console.log('✅ Compra procesada y verificada con el backend');
    } catch (error) {
      console.error('❌ Error procesando compra:', error);
      throw error;
    }
  }

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
      const product = this.products.find(p => p.productId === productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      if (!iapModule) {
        console.warn('⚠️ react-native-iap no disponible, simulando compra');
        // Simular compra exitosa
        const mockPurchase: Purchase = {
          productId,
          transactionId: `mock_${Date.now()}`,
          transactionDate: Date.now(),
          transactionReceipt: 'mock_receipt'
        };
        await this.processPurchase(mockPurchase);
        return;
      }

      // Solicitar compra
      await iapModule.requestPurchase({ sku: productId });
      
      console.log('✅ Compra solicitada exitosamente');
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
      
      if (!iapModule) {
        console.warn('⚠️ react-native-iap no disponible, no se pueden restaurar compras');
        return;
      }

      // Obtener compras disponibles
      const purchases = await iapModule.getAvailablePurchases();
      console.log('📦 Compras encontradas:', purchases);

      if (purchases.length > 0) {
        // Procesar la compra más reciente
        const latestPurchase = purchases[0];
        await this.processPurchase(latestPurchase);
        console.log('✅ Compras restauradas exitosamente');
      } else {
        console.log('ℹ️ No se encontraron compras para restaurar');
      }
    } catch (error) {
      console.error('❌ Error restaurando compras:', error);
      throw error;
    }
  }

  async getPremiumStatus(): Promise<PremiumStatus> {
    try {
      // Primero intentar obtener del backend
      try {
        const backendStatus = await this.getPremiumStatusFromBackend();
        if (backendStatus) {
          // Sincronizar con estado local
          await this.savePremiumStatus(backendStatus);
          return backendStatus;
        }
      } catch (backendError) {
        console.log('⚠️ Error obteniendo estado del backend, usando estado local:', backendError.message);
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

  // Métodos para comunicación con el backend
  private async verifyReceiptWithBackend(purchase: Purchase): Promise<void> {
    try {
      const { default: apiService } = await import('./apiService');
      
      const response = await apiService.post('/subscriptions/verify-receipt', {
        userId: await this.getCurrentUserId(),
        receiptData: purchase.transactionReceipt
      });

      if (!response.success) {
        throw new Error(response.message || 'Error verificando recibo con el backend');
      }

      console.log('✅ Recibo verificado con el backend');
    } catch (error) {
      // Si es error de autenticación, no fallar la compra
      if (error.message?.includes('Usuario no autenticado')) {
        console.log('⚠️ Usuario no autenticado, saltando verificación con backend');
        return;
      }
      console.error('❌ Error verificando recibo con el backend:', error);
      throw error;
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
      if (this.purchaseUpdateSubscription) {
        this.purchaseUpdateSubscription.remove();
        this.purchaseUpdateSubscription = null;
      }
      
      if (this.purchaseErrorSubscription) {
        this.purchaseErrorSubscription.remove();
        this.purchaseErrorSubscription = null;
      }
      
      if (iapModule) {
        try {
          iapModule.endConnection();
        } catch (error) {
          console.warn('⚠️ Error cerrando conexión IAP:', error);
        }
      }
      
      this.isInitialized = false;
      console.log('🧹 Servicio de suscripciones limpiado');
    } catch (error) {
      console.error('❌ Error limpiando servicio de suscripciones:', error);
    }
  }
}

export default new SubscriptionService();
