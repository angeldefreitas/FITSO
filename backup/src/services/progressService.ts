import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeightEntry, MeasurementEntry, ProgressEntry, TimeFilter, ProgressSummary, ProgressData } from '../types/progress';

const STORAGE_KEYS = {
  WEIGHT_ENTRIES: 'weight_entries',
  MEASUREMENT_ENTRIES: 'measurement_entries',
  USER_PROFILE: '@fitso_user_profile'
};

export class ProgressService {
  // ===== PESO =====
  static async getWeightEntries(): Promise<WeightEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WEIGHT_ENTRIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting weight entries:', error);
      return [];
    }
  }

  static async addWeightEntry(weight: number, date: string): Promise<WeightEntry> {
    try {
      const entries = await this.getWeightEntries();
      
      // Verificar si ya existe un registro para esta fecha
      const existingEntryIndex = entries.findIndex(entry => entry.date === date);
      
      if (existingEntryIndex !== -1) {
        console.log('🗑️ Eliminando peso anterior del mismo día:', entries[existingEntryIndex].value, 'kg');
        entries.splice(existingEntryIndex, 1);
      }
      
      const newEntry: WeightEntry = {
        id: Date.now().toString(),
        value: weight,
        date,
        timestamp: new Date(date).getTime()
      };
      
      entries.push(newEntry);
      // Ordenar por timestamp descendente (más reciente primero)
      entries.sort((a, b) => b.timestamp - a.timestamp);
      
      await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT_ENTRIES, JSON.stringify(entries));
      
      console.log('✅ Peso agregado:', weight, 'kg para', date);
      return newEntry;
    } catch (error) {
      console.error('Error adding weight entry:', error);
      throw error;
    }
  }

  static async updateWeightEntry(id: string, weight: number, date: string): Promise<void> {
    try {
      const entries = await this.getWeightEntries();
      const index = entries.findIndex(entry => entry.id === id);
      
      if (index !== -1) {
        const oldEntry = entries[index];
        
        // Si cambió la fecha, verificar si ya existe un registro para la nueva fecha
        if (oldEntry.date !== date) {
          const existingEntryIndex = entries.findIndex(entry => entry.date === date && entry.id !== id);
          
          if (existingEntryIndex !== -1) {
            console.log('🗑️ Eliminando peso anterior del mismo día:', entries[existingEntryIndex].value, 'kg');
            entries.splice(existingEntryIndex, 1);
          }
        }
        
        entries[index] = {
          ...entries[index],
          value: weight,
          date,
          timestamp: new Date(date).getTime()
        };
        
        // Reordenar
        entries.sort((a, b) => b.timestamp - a.timestamp);
        await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT_ENTRIES, JSON.stringify(entries));
        
        console.log('✅ Peso actualizado:', weight, 'kg para', date);
      }
    } catch (error) {
      console.error('Error updating weight entry:', error);
      throw error;
    }
  }

  static async deleteWeightEntry(id: string): Promise<void> {
    try {
      const entries = await this.getWeightEntries();
      const filteredEntries = entries.filter(entry => entry.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.WEIGHT_ENTRIES, JSON.stringify(filteredEntries));
    } catch (error) {
      console.error('Error deleting weight entry:', error);
      throw error;
    }
  }

  // ===== MEDIDAS =====
  static async getMeasurementEntries(): Promise<MeasurementEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MEASUREMENT_ENTRIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting measurement entries:', error);
      return [];
    }
  }

  static async addMeasurementEntry(value: number, date: string, type: 'waist' | 'chest' | 'arm' | 'thigh' | 'hip'): Promise<MeasurementEntry> {
    try {
      const entries = await this.getMeasurementEntries();
      const newEntry: MeasurementEntry = {
        id: Date.now().toString(),
        value,
        date,
        timestamp: new Date(date).getTime(),
        type
      };
      
      entries.push(newEntry);
      entries.sort((a, b) => b.timestamp - a.timestamp);
      
      await AsyncStorage.setItem(STORAGE_KEYS.MEASUREMENT_ENTRIES, JSON.stringify(entries));
      return newEntry;
    } catch (error) {
      console.error('Error adding measurement entry:', error);
      throw error;
    }
  }

  // ===== FILTROS DE TIEMPO =====
  static filterEntriesByTime(entries: ProgressEntry[], filter: TimeFilter): ProgressEntry[] {
    if (filter === 'all') return entries;
    
    const now = new Date();
    const filterDate = new Date();
    
    switch (filter) {
      case '1month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case '2months':
        filterDate.setMonth(now.getMonth() - 2);
        break;
      case '3months':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        filterDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'initial':
        // Para 'initial', devolver solo el primer registro (más antiguo)
        return entries.length > 0 ? [entries[entries.length - 1]] : [];
    }
    
    return entries.filter(entry => new Date(entry.date) >= filterDate);
  }

  // ===== CÁLCULO DE RESUMEN =====
  static async calculateProgressSummary(entries: ProgressEntry[], type: 'peso' | 'medidas'): Promise<ProgressSummary> {
    if (entries.length === 0) {
      return {
        initialValue: 0,
        currentValue: 0,
        change: 0,
        changePercentage: 0,
        isIncrease: false
      };
    }

    // Ordenar por fecha (más reciente primero)
    const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);
    
    let initialValue: number;
    
    if (type === 'peso') {
      // Para peso, usar el peso del perfil del usuario como peso inicial
      try {
        const profileData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        if (profileData) {
          const profile = JSON.parse(profileData);
          initialValue = profile.weight || 0;
        } else {
          // Si no hay perfil, usar el primer peso registrado
          initialValue = sortedEntries[sortedEntries.length - 1].value;
        }
      } catch (error) {
        console.error('Error getting user profile weight:', error);
        initialValue = sortedEntries[sortedEntries.length - 1].value;
      }
    } else {
      // Para medidas, usar el primer valor registrado del intervalo
      initialValue = sortedEntries[sortedEntries.length - 1].value;
    }
    
    const currentValue = sortedEntries[0].value; // El más reciente
    const change = currentValue - initialValue;
    const changePercentage = initialValue > 0 ? (change / initialValue) * 100 : 0;
    const isIncrease = change > 0;

    return {
      initialValue,
      currentValue,
      change: Math.abs(change),
      changePercentage: Math.abs(changePercentage),
      isIncrease
    };
  }

  // ===== CREAR ENTRADAS PARA GRÁFICO =====
  static async createChartEntries(type: 'peso' | 'medidas', filteredEntries: ProgressEntry[], filter: TimeFilter): Promise<ProgressEntry[]> {
    // Simplificado: solo devolver los registros reales del usuario
    // El peso del perfil se usa solo para el cálculo del resumen, no para el gráfico
    return filteredEntries;
  }

  // ===== OBTENER DATOS COMPLETOS =====
  static async getProgressData(type: 'peso' | 'medidas', filter: TimeFilter): Promise<ProgressData> {
    try {
      const entries = type === 'peso' 
        ? await this.getWeightEntries()
        : await this.getMeasurementEntries();
      
      const filteredEntries = this.filterEntriesByTime(entries, filter);
      const summary = await this.calculateProgressSummary(filteredEntries, type);

      return {
        entries,
        summary,
        filteredEntries
      };
    } catch (error) {
      console.error('Error getting progress data:', error);
      return {
        entries: [],
        summary: {
          initialValue: 0,
          currentValue: 0,
          change: 0,
          changePercentage: 0,
          isIncrease: false
        },
        filteredEntries: []
      };
    }
  }

  // ===== ACTUALIZAR PERFIL DE USUARIO =====
  static async updateUserProfileWeight(weight: number): Promise<void> {
    try {
      console.log('🔄 Actualizando peso del perfil a:', weight);
      const profileData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (profileData) {
        const profile = JSON.parse(profileData);
        console.log('📊 Peso anterior:', profile.weight);
        profile.weight = weight;
        profile.lastUpdated = new Date().toISOString();
        await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
        console.log('✅ Peso del perfil actualizado exitosamente');
        
        // Emitir evento personalizado para notificar la actualización
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('profileWeightUpdated', { 
            detail: { weight, timestamp: new Date().toISOString() } 
          }));
        }
      } else {
        console.log('❌ No se encontró perfil de usuario');
      }
    } catch (error) {
      console.error('❌ Error updating user profile weight:', error);
    }
  }

  // ===== VERIFICAR SI ES FECHA DE HOY =====
  static isToday(date: string): boolean {
    const today = new Date();
    const entryDate = new Date(date);
    
    const isTodayResult = today.getFullYear() === entryDate.getFullYear() &&
           today.getMonth() === entryDate.getMonth() &&
           today.getDate() === entryDate.getDate();
    
    console.log('🔍 Verificando si es hoy:');
    console.log('  - Fecha entrada:', date);
    console.log('  - Fecha hoy:', today.toISOString().split('T')[0]);
    console.log('  - Es hoy:', isTodayResult);
    
    return isTodayResult;
  }

  // ===== FORZAR ACTUALIZACIÓN DEL PERFIL =====
  static async forceUpdateProfileFromLatestWeight(): Promise<void> {
    try {
      console.log('🔄 Forzando actualización del perfil desde el último peso...');
      
      const weightEntries = await this.getWeightEntries();
      if (weightEntries.length === 0) {
        console.log('❌ No hay registros de peso');
        return;
      }

      // Obtener el peso más reciente
      const latestWeight = weightEntries[0]; // Ya están ordenados por timestamp descendente
      console.log('📊 Último peso registrado:', latestWeight.value, 'kg el', latestWeight.date);
      
      // Verificar si es de hoy
      const isToday = this.isToday(latestWeight.date);
      console.log('📅 ¿Es de hoy?', isToday);
      
      if (isToday) {
        console.log('✅ Actualizando perfil con el peso de hoy...');
        await this.updateUserProfileWeight(latestWeight.value);
      } else {
        console.log('ℹ️ El último peso no es de hoy, no actualizando perfil');
      }
      
    } catch (error) {
      console.error('❌ Error forzando actualización:', error);
    }
  }

  // ===== AGREGAR PESO CON SINCRONIZACIÓN AUTOMÁTICA =====
  static async addWeightEntryWithSync(weight: number, date: string, updateProfileWeight?: (weight: number) => Promise<void>): Promise<WeightEntry> {
    try {
      // Agregar el peso (ya maneja la lógica de un peso por día)
      const newEntry = await this.addWeightEntry(weight, date);
      
      // Si es de hoy, sincronizar automáticamente con el perfil
      if (this.isToday(date)) {
        console.log('📅 Peso de hoy detectado, sincronizando perfil automáticamente...');
        
        if (updateProfileWeight) {
          // Usar la función del contexto para actualización en tiempo real
          await updateProfileWeight(weight);
        } else {
          // Fallback a la función original
          await this.updateUserProfileWeight(weight);
        }
      }
      
      return newEntry;
    } catch (error) {
      console.error('Error adding weight entry with sync:', error);
      throw error;
    }
  }
}
