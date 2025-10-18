import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile } from '../lib/userProfile';
import { ProgressService } from '../services/progressService';

const USER_PROFILE_KEY = '@fitso_user_profile';

export const debugProfileSync = async (): Promise<void> => {
  console.log('🔍 === DIAGNÓSTICO COMPLETO DEL PERFIL ===');
  
  try {
    // 1. Verificar perfil usando la función oficial
    console.log('\n1️⃣ Verificando perfil con getUserProfile():');
    const profile = await getUserProfile();
    if (profile) {
      console.log('✅ Perfil encontrado:');
      console.log('  - ID:', profile.id);
      console.log('  - Nombre:', profile.name);
      console.log('  - Peso:', profile.weight, 'kg');
      console.log('  - Altura:', profile.height, 'cm');
      console.log('  - Última actualización:', profile.lastUpdated);
    } else {
      console.log('❌ No se encontró perfil');
    }

    // 2. Verificar directamente en AsyncStorage
    console.log('\n2️⃣ Verificando AsyncStorage directamente:');
    const rawProfile = await AsyncStorage.getItem(USER_PROFILE_KEY);
    if (rawProfile) {
      const parsedProfile = JSON.parse(rawProfile);
      console.log('✅ Datos en AsyncStorage:');
      console.log('  - Peso:', parsedProfile.weight, 'kg');
      console.log('  - Última actualización:', parsedProfile.lastUpdated);
    } else {
      console.log('❌ No se encontraron datos en AsyncStorage');
    }

    // 3. Verificar registros de peso
    console.log('\n3️⃣ Verificando registros de peso:');
    const weightEntries = await ProgressService.getWeightEntries();
    console.log(`📊 Total de registros: ${weightEntries.length}`);
    
    if (weightEntries.length > 0) {
      const latest = weightEntries[0];
      console.log('📈 Último registro:');
      console.log('  - Peso:', latest.value, 'kg');
      console.log('  - Fecha:', latest.date);
      console.log('  - Timestamp:', new Date(latest.timestamp).toLocaleString());
      
      // Verificar si es de hoy
      const isToday = ProgressService.isToday(latest.date);
      console.log('📅 ¿Es de hoy?', isToday);
    }

    // 4. Verificar todas las claves en AsyncStorage
    console.log('\n4️⃣ Verificando todas las claves de AsyncStorage:');
    const allKeys = await AsyncStorage.getAllKeys();
    const profileKeys = allKeys.filter(key => key.includes('profile') || key.includes('user'));
    console.log('🔑 Claves relacionadas con perfil:', profileKeys);

    // 5. Verificar si hay inconsistencias
    console.log('\n5️⃣ Verificando inconsistencias:');
    if (profile && rawProfile) {
      const parsedProfile = JSON.parse(rawProfile);
      const weightMatch = profile.weight === parsedProfile.weight;
      console.log('⚖️ ¿Peso coincide?', weightMatch);
      
      if (!weightMatch) {
        console.log('❌ INCONSISTENCIA DETECTADA:');
        console.log('  - getUserProfile():', profile.weight, 'kg');
        console.log('  - AsyncStorage directo:', parsedProfile.weight, 'kg');
      }
    }

    console.log('\n✅ === FIN DEL DIAGNÓSTICO ===');
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  }
};

export const forceSyncProfile = async (): Promise<boolean> => {
  try {
    console.log('🔄 === FORZANDO SINCRONIZACIÓN ===');
    
    // Obtener el último peso registrado
    const weightEntries = await ProgressService.getWeightEntries();
    if (weightEntries.length === 0) {
      console.log('❌ No hay registros de peso');
      return false;
    }

    const latestWeight = weightEntries[0];
    console.log('📊 Último peso:', latestWeight.value, 'kg el', latestWeight.date);
    
    // Verificar si es de hoy
    const isToday = ProgressService.isToday(latestWeight.date);
    console.log('📅 ¿Es de hoy?', isToday);
    
    if (!isToday) {
      console.log('ℹ️ El último peso no es de hoy, no actualizando perfil');
      return false;
    }

    // Actualizar perfil
    console.log('🔄 Actualizando perfil...');
    await ProgressService.updateUserProfileWeight(latestWeight.value);
    
    // Verificar actualización
    const updatedProfile = await getUserProfile();
    if (updatedProfile && updatedProfile.weight === latestWeight.value) {
      console.log('✅ Perfil actualizado exitosamente');
      return true;
    } else {
      console.log('❌ Error: El perfil no se actualizó correctamente');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error forzando sincronización:', error);
    return false;
  }
};
