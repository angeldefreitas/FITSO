import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { FoodItem } from '../../types/food';

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  createdAt: string;
  date: string; // Fecha en formato YYYY-MM-DD
  mealType: 'Desayuno' | 'Almuerzo' | 'Snacks' | 'Cena';
  source?: 'manual' | 'database' | 'barcode' | 'ai'; // Origen de la comida
  sourceData?: any; // Datos originales para edición
  food?: FoodItem; // Datos del alimento original
  quantity?: number; // Cantidad en gramos
}

const getStorageKey = (userId: string) => `@fitso_daily_meals_${userId}`;

export const useMeals = (selectedDate: Date, userId?: string) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMealsForDate = async (date: Date) => {
    if (!userId) {
      console.log('❌ No hay userId para cargar comidas');
      setMeals([]);
      return;
    }
    
    try {
      const storageKey = getStorageKey(userId);
      const mealsJson = await AsyncStorage.getItem(storageKey);
      if (mealsJson) {
        const savedMeals: Meal[] = JSON.parse(mealsJson);
        // Filtrar comidas de la fecha seleccionada
        const targetDate = date.toISOString().slice(0, 10);
        const dayMeals = savedMeals.filter(meal => 
          meal.date === targetDate
        );
        console.log('🍽️ [DEBUG] loadMealsForDate:', {
          targetDate,
          totalSavedMeals: savedMeals.length,
          dayMeals: dayMeals.length,
          meals: dayMeals.map(m => ({ name: m.name, mealType: m.mealType, date: m.date }))
        });
        setMeals(dayMeals);
      } else {
        console.log('🍽️ [DEBUG] No hay comidas guardadas en AsyncStorage');
        setMeals([]);
      }
    } catch (error) {
      console.error('❌ Error loading meals:', error);
      setMeals([]);
    }
  };

  const saveMeals = async (mealsToSave: Meal[]) => {
    if (!userId) {
      console.log('❌ No hay userId para guardar comidas');
      return;
    }
    
    try {
      console.log('🍽️ [DEBUG] saveMeals iniciado con:', mealsToSave.length, 'comidas');
      console.log('🍽️ [DEBUG] mealsToSave:', mealsToSave.map(m => ({ name: m.name, mealType: m.mealType, date: m.date })));
      
      // Obtener todas las comidas existentes
      const storageKey = getStorageKey(userId);
      const existingMealsJson = await AsyncStorage.getItem(storageKey);
      let allMeals: Meal[] = existingMealsJson ? JSON.parse(existingMealsJson) : [];
      
      console.log('🍽️ [DEBUG] existingMeals:', allMeals.length, 'comidas existentes');
      
      // Filtrar comidas de la fecha actual para evitar duplicados
      const currentDate = selectedDate.toISOString().slice(0, 10);
      allMeals = allMeals.filter(meal => meal.date !== currentDate);
      
      console.log('🍽️ [DEBUG] after filtering by date:', allMeals.length, 'comidas restantes');
      
      // Agregar las nuevas comidas
      allMeals = [...allMeals, ...mealsToSave];
      
      console.log('🍽️ [DEBUG] final meals to save:', allMeals.length, 'comidas totales');
      console.log('🍽️ [DEBUG] final meals:', allMeals.map(m => ({ name: m.name, mealType: m.mealType, date: m.date })));
      
      await AsyncStorage.setItem(storageKey, JSON.stringify(allMeals));
      console.log('🍽️ [DEBUG] Comidas guardadas exitosamente en AsyncStorage');
    } catch (error) {
      console.error('❌ Error saving meals:', error);
    }
  };

  const addMeal = async (mealData: Omit<Meal, 'id' | 'createdAt' | 'date'>) => {
    setLoading(true);
    try {
      // Validar datos requeridos
      if (!mealData.name || !mealData.calories) {
        Alert.alert('Error', 'Nombre y calorías son requeridos');
        return false;
      }

      const newMeal: Meal = {
        id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        date: selectedDate.toISOString().slice(0, 10),
        fiber: 0,
        sugar: 0,
        sodium: 0,
        ...mealData,
      };

      const updatedMeals = [...meals, newMeal];
      setMeals(updatedMeals);
      await saveMeals(updatedMeals);

      console.log('✅ Comida agregada exitosamente:', {
        name: newMeal.name,
        mealType: newMeal.mealType,
        calories: newMeal.calories
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error adding meal:', error);
      Alert.alert('Error', 'Error al agregar la comida');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateMeal = async (mealId: string, mealData: Partial<Meal>) => {
    setLoading(true);
    try {
      const updatedMeals = meals.map(meal => 
        meal.id === mealId 
          ? { ...meal, ...mealData }
          : meal
      );

      setMeals(updatedMeals);
      await saveMeals(updatedMeals);

      console.log('✅ Comida actualizada exitosamente');
      Alert.alert('¡Perfecto!', 'Comida actualizada correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error updating meal:', error);
      Alert.alert('Error', 'Error al actualizar la comida');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteMeal = async (mealId: string) => {
    if (!userId) {
      console.log('❌ No hay userId para eliminar comida');
      return;
    }
    
    try {
      // Obtener todas las comidas existentes
      const storageKey = getStorageKey(userId);
      const existingMealsJson = await AsyncStorage.getItem(storageKey);
      let allMeals: Meal[] = existingMealsJson ? JSON.parse(existingMealsJson) : [];
      
      // Filtrar la comida eliminada
      allMeals = allMeals.filter(meal => meal.id !== mealId);
      
      // Guardar todas las comidas actualizadas
      await AsyncStorage.setItem(storageKey, JSON.stringify(allMeals));
      
      // Actualizar el estado local
      const updatedMeals = meals.filter(meal => meal.id !== mealId);
      setMeals(updatedMeals);
      
      console.log('🗑️ Comida eliminada:', mealId);
    } catch (error) {
      console.error('❌ Error deleting meal:', error);
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
    const today = selectedDate.toISOString().slice(0, 10);
    const todayMeals = meals.filter(meal => meal.date === today);
    return {
      calories: Math.round(todayMeals.reduce((sum, meal) => sum + meal.calories, 0)),
      protein: Math.round(todayMeals.reduce((sum, meal) => sum + meal.protein, 0)),
      carbs: Math.round(todayMeals.reduce((sum, meal) => sum + meal.carbs, 0)),
      fat: Math.round(todayMeals.reduce((sum, meal) => sum + meal.fat, 0)),
      fiber: Math.round(todayMeals.reduce((sum, meal) => sum + (meal.fiber || 0), 0)),
      sugar: Math.round(todayMeals.reduce((sum, meal) => sum + (meal.sugar || 0), 0)),
      sodium: Math.round(todayMeals.reduce((sum, meal) => sum + (meal.sodium || 0), 0)),
    };
  };

  // Cargar comidas cuando cambia la fecha seleccionada
  useEffect(() => {
    loadMealsForDate(selectedDate);
  }, [selectedDate]);

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
  };
};
