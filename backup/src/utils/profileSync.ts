import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile } from '../lib/userProfile';

const USER_PROFILE_KEY = '@fitso_user_profile';

export const verifyProfileSync = async (): Promise<void> => {
  try {
    console.log('🔍 Verificando sincronización del perfil...');
    
    // Obtener perfil usando la función oficial
    const profile = await getUserProfile();
    
    if (profile) {
      console.log('✅ Perfil encontrado:');
      console.log('  - Nombre:', profile.name);
      console.log('  - Peso:', profile.weight, 'kg');
      console.log('  - Altura:', profile.height, 'cm');
      console.log('  - Última actualización:', profile.lastUpdated);
    } else {
      console.log('❌ No se encontró perfil de usuario');
    }
    
    // Verificar directamente en AsyncStorage
    const rawProfile = await AsyncStorage.getItem(USER_PROFILE_KEY);
    if (rawProfile) {
      const parsedProfile = JSON.parse(rawProfile);
      console.log('📊 Perfil en AsyncStorage:');
      console.log('  - Peso:', parsedProfile.weight, 'kg');
      console.log('  - Última actualización:', parsedProfile.lastUpdated);
    } else {
      console.log('❌ No se encontró perfil en AsyncStorage');
    }
    
  } catch (error) {
    console.error('❌ Error verificando sincronización:', error);
  }
};

export const forceProfileRefresh = async (): Promise<void> => {
  try {
    console.log('🔄 Forzando actualización del perfil...');
    
    // Limpiar cache y recargar
    const profile = await getUserProfile();
    
    if (profile) {
      console.log('✅ Perfil recargado exitosamente');
      console.log('  - Peso actual:', profile.weight, 'kg');
    }
    
  } catch (error) {
    console.error('❌ Error forzando actualización:', error);
  }
};
