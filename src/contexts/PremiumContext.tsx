import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Alert } from 'react-native';
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
      
      // Actualizar estado después de la compra
      await refreshPremiumStatus();
      
      console.log('✅ Compra de suscripción completada');
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
  useEffect(() => {
    const configureAppUserId = async () => {
      if (user?.id && subscriptionService) {
        try {
          console.log('👤 Usuario autenticado detectado, configurando App User ID...');
          await subscriptionService.setAppUserId(user.id);
        } catch (error) {
          console.error('❌ Error configurando App User ID después de autenticación:', error);
        }
      }
    };

    configureAppUserId();
  }, [user?.id]);

  // Forzar actualización del estado cada vez que se monte el componente
  useEffect(() => {
    const refreshStatus = async () => {
      try {
        const status = await subscriptionService.getPremiumStatus();
        setPremiumStatus(status);
        console.log('🔄 PremiumContext - Estado refrescado:', status);
      } catch (error) {
        console.error('❌ Error refrescando estado premium:', error);
      }
    };
    
    refreshStatus();
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
