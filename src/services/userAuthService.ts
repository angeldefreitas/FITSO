import AsyncStorage from '@react-native-async-storage/async-storage';

class UserAuthService {
  private static instance: UserAuthService;
  private currentUserId: string | null = null;
  private currentToken: string | null = null;

  private constructor() {}

  static getInstance(): UserAuthService {
    if (!UserAuthService.instance) {
      UserAuthService.instance = new UserAuthService();
    }
    return UserAuthService.instance;
  }

  // Establecer usuario actual y cargar su token
  async setCurrentUser(userId: string) {
    this.currentUserId = userId;
    await this.loadTokenForUser(userId);
  }

  // Limpiar usuario actual
  clearCurrentUser() {
    this.currentUserId = null;
    this.currentToken = null;
  }

  // Obtener token actual
  getCurrentToken(): string | null {
    return this.currentToken;
  }

  // Obtener usuario actual
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  // Cargar usuario actual desde el almacenamiento
  async loadCurrentUser(): Promise<string | null> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const authKeys = keys.filter(key => key.startsWith('auth_token_'));
      
      if (authKeys.length > 0) {
        // Obtener el primer usuario con token
        const userId = authKeys[0].replace('auth_token_', '');
        this.currentUserId = userId;
        await this.loadTokenForUser(userId);
        console.log(`🔑 Usuario actual cargado: ${userId}`);
        return userId;
      }
      
      return null;
    } catch (error) {
      console.error('Error cargando usuario actual:', error);
      return null;
    }
  }

  // Guardar token para un usuario específico
  async saveTokenForUser(userId: string, token: string) {
    try {
      const key = `auth_token_${userId}`;
      await AsyncStorage.setItem(key, token);
      console.log(`🔑 Token guardado para usuario ${userId}`);
    } catch (error) {
      console.error('Error guardando token:', error);
    }
  }

  // Cargar token para un usuario específico
  private async loadTokenForUser(userId: string) {
    try {
      const key = `auth_token_${userId}`;
      const token = await AsyncStorage.getItem(key);
      if (token) {
        this.currentToken = token;
        console.log(`🔑 Token cargado para usuario ${userId}`);
      } else {
        this.currentToken = null;
        console.log(`❌ No hay token para usuario ${userId}`);
      }
    } catch (error) {
      console.error('Error cargando token:', error);
      this.currentToken = null;
    }
  }

  // Eliminar token de un usuario específico
  async removeTokenForUser(userId: string) {
    try {
      const key = `auth_token_${userId}`;
      await AsyncStorage.removeItem(key);
      console.log(`🗑️ Token eliminado para usuario ${userId}`);
    } catch (error) {
      console.error('Error eliminando token:', error);
    }
  }

  // Limpiar todos los tokens (para logout)
  async clearAllTokens() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const authKeys = keys.filter(key => key.startsWith('auth_token_'));
      await AsyncStorage.multiRemove(authKeys);
      console.log('🗑️ Todos los tokens eliminados');
    } catch (error) {
      console.error('Error eliminando tokens:', error);
    }
  }
}

export default UserAuthService.getInstance();
