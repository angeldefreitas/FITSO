import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import subscriptionService, { PremiumStatus } from '../services/subscriptionService';
import { useAuth } from './AuthContext';

interface PremiumContextType {
  // Estado
  isPremium: boolean;
  subscriptionType: 'monthly' | 'yearly' | null;
  expiresAt: string | null;
  dailyScansUsed: number;
  lastScanDate: string | null;
  loading: boolean;
  
  // Acciones
  initializePremium: () => Promise<void>;
  purchaseSubscription: (productId: string) => Promise<void>;
  restorePurchases: () => Promise<void>;
  canUseAIScan: () => Promise<boolean>;
  recordAIScan: () => Promise<void>;
  refreshPremiumStatus: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

interface PremiumProviderProps {
  children: ReactNode;
}

export const PremiumProvider: React.FC<PremiumProviderProps> = ({ children }) => {
  const { user } = useAuth(); // Obtener usuario autenticado
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({
    isPremium: false,
    subscriptionType: null,
    expiresAt: null,
    dailyScansUsed: 0,
    lastScanDate: null,
  });
  const [loading, setLoading] = useState(true);

  // Inicializar servicio de suscripciones
  const initializePremium = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Inicializando contexto premium...');
      
      await subscriptionService.initialize();
      const status = await subscriptionService.getPremiumStatus();
      
      setPremiumStatus(status);
      console.log('✅ Contexto premium inicializado:', status);
    } catch (error) {
      console.error('❌ Error inicializando contexto premium:', error);
      // En caso de error, mantener estado por defecto
      setPremiumStatus({
        isPremium: false,
        subscriptionType: null,
        expiresAt: null,
        dailyScansUsed: 0,
        lastScanDate: null,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Comprar suscripción
  const purchaseSubscription = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      console.log('🛒 Iniciando compra de suscripción:', productId);
      
      await subscriptionService.purchaseSubscription(productId);
      
      // CRÍTICO: Forzar actualización completa del estado premium después de la compra
      console.log('🔄 [PREMIUM CONTEXT] Forzando actualización del estado premium después de compra...');
      
      // Esperar un momento para que RevenueCat sincronice
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Obtener estado fresco directamente desde RevenueCat
      const freshStatus = await subscriptionService.getPremiumStatus();
      console.log('📦 [PREMIUM CONTEXT] Estado premium fresco obtenido:', freshStatus);
      
      // Actualizar estado del contexto inmediatamente
      setPremiumStatus(freshStatus);
      
      // También llamar a refreshPremiumStatus para asegurar sincronización completa
      await refreshPremiumStatus();
      
      console.log('✅ [PREMIUM CONTEXT] Compra de suscripción completada y estado actualizado');
    } catch (error) {
      console.error('❌ Error en compra de suscripción:', error);
      // NO mostrar Alert.alert aquí - el error será manejado por PremiumScreen con el modal bonito
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshPremiumStatus]);

  // Restaurar compras
  const restorePurchases = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Restaurando compras...');
      
      await subscriptionService.restorePurchases();
      
      // Actualizar estado después de restaurar
      const status = await subscriptionService.getPremiumStatus();
      setPremiumStatus(status);
      
      if (status.isPremium) {
        Alert.alert(
          'Compras Restauradas',
          'Tu suscripción premium ha sido restaurada exitosamente.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Sin Compras',
          'No se encontraron compras para restaurar.',
          [{ text: 'OK' }]
        );
      }
      
      console.log('✅ Compras restauradas:', status);
    } catch (error) {
      console.error('❌ Error restaurando compras:', error);
      
      Alert.alert(
        'Error al Restaurar',
        'No se pudieron restaurar las compras. Inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar si puede usar escaneo con IA
  const canUseAIScan = useCallback(async (): Promise<boolean> => {
    try {
      const canUse = await subscriptionService.canUseAIScan();
      console.log('🤖 ¿Puede usar IA?', canUse);
      console.log('🤖 Estado premium actual:', premiumStatus);
      return canUse;
    } catch (error) {
      console.error('❌ Error verificando límite de IA:', error);
      return false;
    }
  }, [premiumStatus]);

  // Registrar uso de escaneo con IA
  const recordAIScan = useCallback(async () => {
    try {
      await subscriptionService.recordAIScan();
      
      // Actualizar estado local
      const status = await subscriptionService.getPremiumStatus();
      setPremiumStatus(status);
      
      console.log('📊 Escaneo con IA registrado');
    } catch (error) {
      console.error('❌ Error registrando escaneo con IA:', error);
    }
  }, []);

  // Refrescar estado premium
  const refreshPremiumStatus = useCallback(async () => {
    try {
      const status = await subscriptionService.getPremiumStatus();
      setPremiumStatus(status);
      console.log('🔄 Estado premium actualizado:', status);
    } catch (error) {
      console.error('❌ Error refrescando estado premium:', error);
    }
  }, []);

  // Inicializar al montar el componente
  useEffect(() => {
    console.log('🚀 PremiumContext - Inicializando...');
    initializePremium();
  }, [initializePremium]);

  // Configurar App User ID cuando el usuario se autentique
  // CRÍTICO: Esto debe suceder INMEDIATAMENTE después del registro/login
  // IMPORTANTE: También refrescar el estado premium cuando cambia el usuario
  useEffect(() => {
    const configureAppUserId = async () => {
      if (user?.id && subscriptionService) {
        try {
          console.log('👤 [PREMIUM CONTEXT] Usuario autenticado detectado, configurando App User ID...');
          console.log('👤 [PREMIUM CONTEXT] User ID:', user.id);
          
          // CRÍTICO: Primero verificar si hay un usuario diferente en RevenueCat
          // Si es así, hacer logOut primero para limpiar el estado anterior
          try {
            const PurchasesModule = await import('react-native-purchases');
            const Purchases = PurchasesModule.default;
            const currentCustomerInfo = await Purchases.getCustomerInfo();
            const currentAppUserId = currentCustomerInfo.originalAppUserId;
            
            if (currentAppUserId && currentAppUserId !== user.id) {
              console.log('⚠️ [PREMIUM CONTEXT] Detectado usuario diferente en RevenueCat');
              console.log('  - Usuario anterior:', currentAppUserId);
              console.log('  - Usuario nuevo:', user.id);
              console.log('🔄 [PREMIUM CONTEXT] Cerrando sesión de usuario anterior...');
              
              // Cerrar sesión del usuario anterior
              await Purchases.logOut();
              console.log('✅ [PREMIUM CONTEXT] Sesión anterior cerrada');
              
              // Esperar un momento para que RevenueCat procese el logout
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          } catch (checkError) {
            console.warn('⚠️ [PREMIUM CONTEXT] No se pudo verificar usuario actual en RevenueCat:', checkError);
          }
          
          // setAppUserId verifica internamente si está inicializado y lo inicializa si es necesario
          await subscriptionService.setAppUserId(user.id);
          console.log('✅ [PREMIUM CONTEXT] App User ID configurado correctamente');
          
          // Verificar que se configuró correctamente
          try {
            const PurchasesModule = await import('react-native-purchases');
            const Purchases = PurchasesModule.default;
            const customerInfo = await Purchases.getCustomerInfo();
            if (customerInfo.originalAppUserId === user.id) {
              console.log('✅ [PREMIUM CONTEXT] App User ID verificado correctamente en RevenueCat');
            } else {
              console.error('❌ [PREMIUM CONTEXT] App User ID no coincide después de configurar');
              console.error('  - Esperado:', user.id);
              console.error('  - Obtenido:', customerInfo.originalAppUserId);
              // Intentar de nuevo
              await subscriptionService.setAppUserId(user.id);
            }
          } catch (verifyError) {
            console.warn('⚠️ [PREMIUM CONTEXT] No se pudo verificar App User ID:', verifyError);
          }
          
          // CRÍTICO: Refrescar el estado premium después de configurar el App User ID
          // Esto asegura que el estado premium corresponde al usuario correcto
          console.log('🔄 [PREMIUM CONTEXT] Refrescando estado premium para nuevo usuario...');
          const freshStatus = await subscriptionService.getPremiumStatus();
          setPremiumStatus(freshStatus);
          console.log('✅ [PREMIUM CONTEXT] Estado premium actualizado para usuario:', user.id, freshStatus);
        } catch (error) {
          console.error('❌ [PREMIUM CONTEXT] Error configurando App User ID después de autenticación:', error);
        }
      } else if (!user?.id) {
        // Si no hay usuario, limpiar el estado premium
        console.log('🔄 [PREMIUM CONTEXT] No hay usuario autenticado, limpiando estado premium');
        setPremiumStatus({
          isPremium: false,
          subscriptionType: null,
          expiresAt: null,
          dailyScansUsed: 0,
          lastScanDate: null,
        });
      }
    };

    configureAppUserId();
  }, [user?.id]);

  // Refrescar estado premium cuando la app vuelve a foreground
  // CRÍTICO: Esto asegura que el estado premium se actualice cuando el usuario vuelve a la app
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('📱 [PREMIUM CONTEXT] App activa - refrescando estado premium...');
        try {
          // Forzar refresh desde RevenueCat cuando la app vuelve a primer plano
          await subscriptionService.refreshPremiumStatusFromRevenueCat();
          const status = await subscriptionService.getPremiumStatus();
          setPremiumStatus(status);
          console.log('✅ [PREMIUM CONTEXT] Estado premium refrescado después de volver a foreground:', status);
        } catch (error) {
          console.error('❌ [PREMIUM CONTEXT] Error refrescando estado premium en foreground:', error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // También refrescar al montar el componente
    const refreshStatus = async () => {
      try {
        const status = await subscriptionService.getPremiumStatus();
        setPremiumStatus(status);
        console.log('🔄 [PREMIUM CONTEXT] Estado refrescado al montar:', status);
      } catch (error) {
        console.error('❌ [PREMIUM CONTEXT] Error refrescando estado premium:', error);
      }
    };
    
    refreshStatus();
    
    return () => {
      subscription.remove();
    };
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      subscriptionService.cleanup();
    };
  }, []);

  const value: PremiumContextType = {
    // Estado
    isPremium: premiumStatus.isPremium,
    subscriptionType: premiumStatus.subscriptionType,
    expiresAt: premiumStatus.expiresAt,
    dailyScansUsed: premiumStatus.dailyScansUsed,
    lastScanDate: premiumStatus.lastScanDate,
    loading,
    
    // Acciones
    initializePremium,
    purchaseSubscription,
    restorePurchases,
    canUseAIScan,
    recordAIScan,
    refreshPremiumStatus,
  };

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = (): PremiumContextType => {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    console.warn('⚠️ usePremium usado fuera de PremiumProvider, retornando valores por defecto');
    // Retornar valores por defecto en lugar de lanzar error
    return {
      isPremium: false,
      subscriptionType: null,
      expiresAt: null,
      dailyScansUsed: 0,
      lastScanDate: null,
      loading: false,
      initializePremium: async () => {},
      purchaseSubscription: async () => {},
      restorePurchases: async () => {},
      canUseAIScan: async () => false,
      recordAIScan: async () => {},
      refreshPremiumStatus: async () => {},
    };
  }
  return context;
};
