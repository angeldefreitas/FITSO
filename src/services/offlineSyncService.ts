import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface OfflineData {
  user: any;
  profile: any;
  meals: any[];
  waterTracking: any;
  lastSync: string;
}

class OfflineSyncService {
  private static instance: OfflineSyncService;
  private _isOnline: boolean = true;
  private syncInProgress: boolean = false;

  private constructor() {
    this.initializeNetworkListener();
  }

  static getInstance(): OfflineSyncService {
    if (!OfflineSyncService.instance) {
      OfflineSyncService.instance = new OfflineSyncService();
    }
    return OfflineSyncService.instance;
  }

  // Inicializar listener de red
  private initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this._isOnline;
      this._isOnline = state.isConnected ?? false;
      
      console.log(`🌐 Estado de conexión: ${this._isOnline ? 'Online' : 'Offline'}`);
      
      // Si se conecta después de estar offline, sincronizar datos
      if (wasOffline && this._isOnline) {
        console.log('🔄 Conexión restaurada, iniciando sincronización...');
        this.syncPendingData();
      }
    });
  }

  // Verificar si está online
  get isOnline(): boolean {
    return this._isOnline;
  }

  // Guardar datos para uso offline
  async saveOfflineData(data: Partial<OfflineData>): Promise<void> {
    try {
      const currentData = await this.getOfflineData();
      const updatedData = {
        ...currentData,
        ...data,
        lastSync: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('offline_data', JSON.stringify(updatedData));
      console.log('💾 Datos guardados para uso offline');
    } catch (error) {
      console.error('Error guardando datos offline:', error);
    }
  }

  // Obtener datos offline
  async getOfflineData(): Promise<OfflineData | null> {
    try {
      const data = await AsyncStorage.getItem('offline_data');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error obteniendo datos offline:', error);
      return null;
    }
  }

  // Sincronizar datos pendientes cuando se restaura la conexión
  async syncPendingData(): Promise<void> {
    if (this.syncInProgress || !this._isOnline) {
      return;
    }

    try {
      this.syncInProgress = true;
      console.log('🔄 Iniciando sincronización de datos pendientes...');

      const offlineData = await this.getOfflineData();
      if (!offlineData) {
        console.log('ℹ️ No hay datos offline para sincronizar');
        return;
      }

      // Aquí se pueden agregar las llamadas específicas para sincronizar
      // diferentes tipos de datos (perfil, comidas, agua, etc.)
      
      console.log('✅ Sincronización completada');
    } catch (error) {
      console.error('❌ Error durante la sincronización:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Limpiar datos offline
  async clearOfflineData(): Promise<void> {
    try {
      await AsyncStorage.removeItem('offline_data');
      console.log('🗑️ Datos offline eliminados');
    } catch (error) {
      console.error('Error eliminando datos offline:', error);
    }
  }

  // Obtener tiempo desde la última sincronización
  async getLastSyncTime(): Promise<Date | null> {
    try {
      const data = await this.getOfflineData();
      return data?.lastSync ? new Date(data.lastSync) : null;
    } catch (error) {
      console.error('Error obteniendo tiempo de última sincronización:', error);
      return null;
    }
  }
}

export default OfflineSyncService.getInstance();
