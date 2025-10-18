import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mealService from '../../services/mealService';
import foodService from '../../services/foodService';
import { useAuth } from '../../contexts/AuthContext';

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
  date: string; // Fecha en formato YYYY-MM-DD
  mealType: 'Desayuno' | 'Almuerzo' | 'Snacks' | 'Cena';
  source?: 'manual' | 'database' | 'barcode' | 'ai'; // Origen de la comida
  sourceData?: any; // Datos originales para edición
}

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

export const useMealsBackend = (selectedDate: Date) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<MealHistoryItem[]>([]);
  const { user, isAuthenticated } = useAuth();

  // Debug: Log cuando cambia el estado de meals
  useEffect(() => {
    console.log('🍽️ Estado de meals actualizado:', meals.length, 'comidas');
    if (meals.length > 0) {
      console.log('🍽️ Primera comida:', meals[0].name, 'Calorías:', meals[0].calories);
    }
  }, [meals]);

  // Funciones para manejar almacenamiento local
  const loadMealsFromLocal = async (dateString: string, userId?: string): Promise<Meal[]> => {
    try {
      const storageKey = `@fitso_meals_${userId || 'default'}_${dateString}`;
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        const localMeals = JSON.parse(stored);
        console.log('📱 Comidas cargadas desde almacenamiento local:', localMeals.length);
        return localMeals;
      }
      return [];
    } catch (error) {
      console.error('❌ Error cargando comidas desde almacenamiento local:', error);
      return [];
    }
  };

  const saveMealsToLocal = async (dateString: string, meals: Meal[], userId?: string): Promise<void> => {
    try {
      const storageKey = `@fitso_meals_${userId || 'default'}_${dateString}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(meals));
      console.log('💾 Comidas guardadas en almacenamiento local:', meals.length);
    } catch (error) {
      console.error('❌ Error guardando comidas en almacenamiento local:', error);
    }
  };

  const loadMealsForDate = async (date: Date) => {
    try {
      // Usar fecha local para evitar problemas de zona horaria
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      console.log('🔄 Recargando comidas para fecha:', dateString);
      console.log('🔄 Usuario autenticado:', isAuthenticated, 'User ID:', user?.id);
      setLoading(true);
      
      // Siempre usar PostgreSQL
      console.log('🔐 Cargando desde PostgreSQL');
      const response = await mealService.getMealsByDate(dateString);
      console.log('📊 Respuesta del backend:', response);
      
      // Verificar que la respuesta tiene la estructura correcta
      if (!response || !response.data || !response.data.meals) {
        console.warn('⚠️ Respuesta del backend no tiene la estructura esperada:', response);
        setMeals([]);
        return;
      }
      
      console.log('✅ Backend response - Meals encontradas:', response.data.meals.length);
      
      // Convertir las comidas del backend al formato del frontend
      const convertedMeals: Meal[] = response.data.meals.map(meal => {
        console.log('🔄 Convirtiendo comida:', meal.name || meal.food?.name, 'Calorías:', meal.nutrition?.calories);
        return {
          id: meal.id,
          name: meal.food?.name ? `${meal.food.name} (${meal.quantity}g)` : 'Comida desconocida',
          calories: Math.round(meal.nutrition?.calories || 0),
          protein: Math.round(meal.nutrition?.protein || 0),
          carbs: Math.round(meal.nutrition?.carbs || 0),
          fat: Math.round(meal.nutrition?.fat || 0),
          createdAt: meal.created_at,
          date: meal.entry_date,
          mealType: meal.meal_type === 'breakfast' ? 'Desayuno' :
                    meal.meal_type === 'lunch' ? 'Almuerzo' :
                    meal.meal_type === 'dinner' ? 'Cena' : 'Snacks',
          source: 'database' as const,
          sourceData: {
            food: meal.food,
            quantity: meal.quantity
          }
        };
      });

      console.log('🍽️ Comidas convertidas:', convertedMeals.length, 'comidas');
      console.log('🍽️ Total de calorías:', convertedMeals.reduce((sum, meal) => sum + meal.calories, 0));
      
      console.log('🔄 Estableciendo comidas en el estado...');
      setMeals(convertedMeals);
      
      // Log después de un pequeño delay para verificar que el estado se actualizó
      setTimeout(() => {
        console.log('🍽️ Estado actualizado - Total comidas:', convertedMeals.length);
      }, 50);
      
    } catch (error) {
      console.error('❌ Error loading meals:', error);
      console.error('❌ Error details:', error);
      console.log('🔄 Reseteando comidas debido a error...');
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  const addMeal = async (mealData: Omit<Meal, 'id' | 'createdAt' | 'date'>) => {
    setLoading(true);
    try {
      // Usar fecha local para evitar problemas de zona horaria
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const entryDate = `${year}-${month}-${day}`;
      
      console.log('📅 Fecha seleccionada:', selectedDate);
      console.log('📅 Fecha para backend:', entryDate);
      
      // Siempre usar PostgreSQL
      console.log('🔐 Agregando comida a PostgreSQL');
      
      // Convertir el tipo de comida del frontend al backend
      const mealTypeMap = {
        'Desayuno': 'breakfast',
        'Almuerzo': 'lunch',
        'Cena': 'dinner',
        'Snacks': 'snack'
      } as const;

      // Si es una comida de la base de datos local (desde FoodSearchScreen), crear el alimento primero
      if (mealData.source === 'database' && mealData.sourceData?.food) {
        console.log('🍽️ Procesando comida de base de datos local:', mealData.sourceData.food);
        
        // Crear el alimento en la base de datos PostgreSQL
        const foodData = {
          name: mealData.sourceData.food.name,
          brand: 'Local',
          barcode: undefined,
          calories_per_100g: mealData.sourceData.food.calories,
          protein_per_100g: mealData.sourceData.food.protein,
          carbs_per_100g: mealData.sourceData.food.carbs,
          fat_per_100g: mealData.sourceData.food.fat,
          fiber_per_100g: mealData.sourceData.food.fiber || 0,
          sugar_per_100g: mealData.sourceData.food.sugar || 0,
          sodium_per_100g: mealData.sourceData.food.sodium || 0
        };

        console.log('📦 Datos del alimento a crear:', foodData);
        const foodResponse = await foodService.createFood(foodData);
        console.log('✅ Alimento creado:', foodResponse);
        const foodId = foodResponse.id;

        // Crear entrada de comida con la cantidad especificada
        const mealEntry = {
          food_id: foodId,
          quantity: mealData.sourceData.quantity,
          meal_type: mealTypeMap[mealData.mealType],
          entry_date: entryDate
        };

        console.log('🍽️ Entrada de comida a crear:', mealEntry);
        const createdMeal = await mealService.addMeal(mealEntry);
        console.log('✅ Entrada de comida creada:', createdMeal);
      } else {
        throw new Error('Tipo de comida no soportado para el backend');
      }

      // Recargar comidas después de agregar
      console.log('🔄 Recargando comidas después de agregar...');
      setTimeout(async () => {
        await loadMealsForDate(selectedDate);
      }, 100);
      
      return true;
    } catch (error) {
      console.error('❌ Error adding meal:', error);
      console.error('❌ Error details:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateMeal = async (mealId: string, mealData: Partial<Meal>) => {
    setLoading(true);
    try {
      // Convertir el tipo de comida del frontend al backend
      const mealTypeMap = {
        'Desayuno': 'breakfast',
        'Almuerzo': 'lunch',
        'Cena': 'dinner',
        'Snacks': 'snack'
      } as const;

      const updateData = {
        meal_type: mealData.mealType ? mealTypeMap[mealData.mealType] : undefined,
        entry_date: mealData.date,
        quantity: mealData.sourceData?.quantity || 100
      };

      await mealService.updateMeal(mealId, updateData);
      
      // Recargar comidas después de actualizar
      await loadMealsForDate(selectedDate);
      
      console.log('✅ Comida actualizada en el backend exitosamente');
      Alert.alert('¡Perfecto!', 'Comida actualizada correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error updating meal in backend:', error);
      Alert.alert('Error', 'Error al actualizar la comida');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteMeal = async (mealId: string) => {
    try {
      await mealService.deleteMeal(mealId);
      
      // Recargar comidas después de eliminar
      await loadMealsForDate(selectedDate);
      
      console.log('🗑️ Comida eliminada del backend:', mealId);
    } catch (error) {
      console.error('❌ Error deleting meal from backend:', error);
      Alert.alert('Error', 'Error al eliminar la comida');
    }
  };

  const getMealsByType = (mealType: string) => {
    const today = selectedDate.toISOString().slice(0, 10);
    const filteredMeals = meals.filter(meal => 
      meal.mealType === mealType && meal.date === today
    );
    return filteredMeals;
  };

  const getMealTotals = (mealType: string) => {
    const mealItems = getMealsByType(mealType);
    return {
      calories: Math.round(mealItems.reduce((sum, meal) => sum + meal.calories, 0)),
      protein: Math.round(mealItems.reduce((sum, meal) => sum + meal.protein, 0)),
      carbs: Math.round(mealItems.reduce((sum, meal) => sum + meal.carbs, 0)),
      fat: Math.round(mealItems.reduce((sum, meal) => sum + meal.fat, 0)),
    };
  };

  const getTotalNutrients = () => {
    // Usar fecha local para evitar problemas de zona horaria
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    
    console.log('📊 Calculando totales para fecha:', today);
    console.log('📊 Comidas disponibles:', meals.length);
    
    const todayMeals = meals.filter(meal => {
      // Comparar fechas (meal.date ya es un string en formato YYYY-MM-DD)
      return meal.date === today;
    });
    
    console.log('📊 Comidas para hoy:', todayMeals.length);
    
    const totals = {
      calories: Math.round(todayMeals.reduce((sum, meal) => sum + meal.calories, 0)),
      protein: Math.round(todayMeals.reduce((sum, meal) => sum + meal.protein, 0)),
      carbs: Math.round(todayMeals.reduce((sum, meal) => sum + meal.carbs, 0)),
      fat: Math.round(todayMeals.reduce((sum, meal) => sum + meal.fat, 0)),
    };
    
    console.log('📊 Totales calculados:', totals);
    
    return totals;
  };

  const loadMealHistory = async () => {
    try {
      // Obtener historial de comidas de los últimos 30 días
      const response = await mealService.getMealHistory(30);
      
      // Verificar que la respuesta tiene la estructura correcta
      if (!response || !response.data || !response.data.history) {
        console.warn('⚠️ Respuesta del historial no tiene la estructura esperada:', response);
        setHistory([]);
        return;
      }
      
      // Convertir a formato de historial
      const historyItems: MealHistoryItem[] = response.data.history.map(day => ({
        id: day.date,
        name: `Comidas del ${new Date(day.date).toLocaleDateString('es-ES')}`,
        calories: 0, // Se calculará si es necesario
        protein: 0,
        carbs: 0,
        fat: 0,
        lastUsed: day.date,
        timesUsed: day.meal_count,
        source: 'database' as const
      }));

      setHistory(historyItems);
      console.log('📊 Historial de comidas cargado del backend:', historyItems.length);
    } catch (error) {
      console.error('❌ Error loading meal history from backend:', error);
      setHistory([]);
    }
  };

  const addToHistory = async (meal: Meal) => {
    // Para el backend, no necesitamos mantener un historial local
    // Las comidas ya se guardan en la base de datos con trazabilidad temporal
    console.log('✅ Comida agregada al backend (historial automático)');
  };

  const removeFromHistory = async (mealId: string) => {
    // Eliminar del backend
    await deleteMeal(mealId);
  };

  const getRecentMeals = (limit: number = 12) => {
    return history.slice(0, limit);
  };

  // Cargar comidas cuando cambia la fecha seleccionada
  useEffect(() => {
    console.log('🔄 useEffect ejecutado - Fecha cambiada:', selectedDate);
    loadMealsForDate(selectedDate);
  }, [selectedDate]);

  // Cargar historial al inicializar
  useEffect(() => {
    loadMealHistory();
  }, []);

  // Debug: Log cuando cambia el estado de autenticación
  useEffect(() => {
    console.log('🔐 Estado de autenticación cambiado:', isAuthenticated, 'User:', user?.email);
  }, [isAuthenticated, user]);

  return {
    meals,
    loading,
    addMeal,
    updateMeal,
    deleteMeal,
    getMealsByType,
    getMealTotals,
    getTotalNutrients,
    loadMealsForDate,
    history,
    addToHistory,
    removeFromHistory,
    getRecentMeals,
    loadMealHistory,
  };
};