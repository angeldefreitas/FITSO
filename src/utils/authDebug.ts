import AsyncStorage from '@react-native-async-storage/async-storage';
import userAuthService from '../services/userAuthService';

export const debugAuthState = async () => {
  console.log('🔍 === DEBUG AUTH STATE ===');
  
  try {
    // Verificar todas las claves de AsyncStorage
    const keys = await AsyncStorage.getAllKeys();
    console.log('📋 Todas las claves en AsyncStorage:', keys);
    
    // Verificar claves de autenticación
    const authKeys = keys.filter(key => key.includes('auth_token') || key.includes('cached_user') || key.includes('offline_data'));
    console.log('🔑 Claves de autenticación:', authKeys);
    
    // Verificar datos de cada clave de autenticación
    for (const key of authKeys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`📄 ${key}:`, value ? `${value.substring(0, 100)}...` : 'null');
    }
    
    // Verificar estado del userAuthService
    const currentUserId = userAuthService.getCurrentUserId();
    const currentToken = userAuthService.getCurrentToken();
    console.log('👤 Usuario actual:', currentUserId);
    console.log('🎫 Token actual:', currentToken ? `${currentToken.substring(0, 20)}...` : 'null');
    
  } catch (error) {
    console.error('❌ Error en debug:', error);
  }
  
  console.log('🔍 === FIN DEBUG ===');
};

export const clearAllAuthData = async () => {
  console.log('🗑️ Limpiando todos los datos de autenticación...');
  
  try {
    const keys = await AsyncStorage.getAllKeys();
    const authKeys = keys.filter(key => 
      key.includes('auth_token') || 
      key.includes('cached_user') || 
      key.includes('offline_data') ||
      key.includes('fitso_user_profile') ||
      key.includes('fitso_app_state')
    );
    
    await AsyncStorage.multiRemove(authKeys);
    console.log('✅ Datos de autenticación eliminados');
  } catch (error) {
    console.error('❌ Error limpiando datos:', error);
  }
};
