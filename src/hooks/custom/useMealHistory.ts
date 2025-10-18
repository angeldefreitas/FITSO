import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { Meal } from './useMeals';

const getMealHistoryKey = (userId: string) => `@fitso_meal_history_${userId}`;

export interface MealHistoryItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  lastUsed: string; // Fecha de último uso en formato ISO
  timesUsed: number; // Número de veces que se ha usado
  source?: 'manual' | 'database' | 'barcode' | 'ai';
  sourceData?: any;
}

export const useMealHistory = (userId?: string) => {
  const [history, setHistory] = useState<MealHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    if (!userId) {
      console.log('❌ No hay userId para cargar historial de comidas');
      setHistory([]);
      return;
    }
    
    try {
      const storageKey = getMealHistoryKey(userId);
      const historyJson = await AsyncStorage.getItem(storageKey);
      if (historyJson) {
        const savedHistory: MealHistoryItem[] = JSON.parse(historyJson);
        // Ordenar por fecha de último uso (más reciente primero)
        const sortedHistory = savedHistory.sort((a, b) => 
          new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
        );
        setHistory(sortedHistory);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('❌ Error loading meal history:', error);
      setHistory([]);
    }
  };

  const saveHistory = async (historyToSave: MealHistoryItem[]) => {
    if (!userId) {
      console.log('❌ No hay userId para guardar historial');
      return;
    }
    
    try {
      const storageKey = getMealHistoryKey(userId);
      await AsyncStorage.setItem(storageKey, JSON.stringify(historyToSave));
    } catch (error) {
      console.error('❌ Error saving meal history:', error);
    }
  };

  const addToHistory = async (meal: Meal) => {
    if (!userId) {
      console.log('❌ No hay userId para agregar al historial');
      return;
    }
    
    try {
      // Crear un identificador único basado en el nombre base de la comida (sin cantidad)
      const baseName = meal.name.replace(/\s*\(\d+g\)$/, '').toLowerCase().trim();
      
      // Verificar si ya existe una comida con el mismo nombre base en el historial
      const existingIndex = history.findIndex(item => {
        const itemBaseName = item.name.replace(/\s*\(\d+g\)$/, '').toLowerCase().trim();
        return itemBaseName === baseName;
      });

      let updatedHistory: MealHistoryItem[];

      if (existingIndex !== -1) {
        // Si ya existe, solo actualizar la fecha de último uso y aumentar el contador
        updatedHistory = [...history];
        updatedHistory[existingIndex] = {
          ...updatedHistory[existingIndex],
          lastUsed: new Date().toISOString(),
          timesUsed: updatedHistory[existingIndex].timesUsed + 1,
        };
        
        console.log('✅ Comida actualizada en historial:', meal.name);
      } else {
        // Si no existe, crear nueva entrada
        const historyItem: MealHistoryItem = {
          id: meal.id,
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          lastUsed: new Date().toISOString(),
          timesUsed: 1,
          source: meal.source,
          sourceData: meal.sourceData,
        };
        
        updatedHistory = [historyItem, ...history];
        console.log('✅ Nueva comida agregada al historial:', meal.name);
      }

      // Mantener solo las últimas 20 comidas en el historial
      updatedHistory = updatedHistory.slice(0, 20);

      // Ordenar por fecha de último uso (más reciente primero)
      updatedHistory.sort((a, b) => 
        new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
      );

      setHistory(updatedHistory);
      await saveHistory(updatedHistory);
    } catch (error) {
      console.error('❌ Error adding to meal history:', error);
    }
  };

  const removeFromHistory = async (historyItemId: string) => {
    try {
      const updatedHistory = history.filter(item => item.id !== historyItemId);
      setHistory(updatedHistory);
      await saveHistory(updatedHistory);
      
      console.log('🗑️ Comida eliminada del historial:', historyItemId);
    } catch (error) {
      console.error('❌ Error removing from meal history:', error);
    }
  };

  const getRecentMeals = (limit: number = 12) => {
    return history.slice(0, limit);
  };

  // Cargar historial al inicializar
  useEffect(() => {
    loadHistory();
  }, []);

  return {
    history,
    loading,
    addToHistory,
    removeFromHistory,
    getRecentMeals,
    loadHistory,
  };
};
