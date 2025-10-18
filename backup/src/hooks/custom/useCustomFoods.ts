import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodItem } from '../../types/food';

const CUSTOM_FOODS_STORAGE_KEY = '@fitso_custom_foods';

export const useCustomFoods = () => {
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);

  const loadCustomFoods = async () => {
    try {
      const customFoodsJson = await AsyncStorage.getItem(CUSTOM_FOODS_STORAGE_KEY);
      if (customFoodsJson) {
        const savedCustomFoods = JSON.parse(customFoodsJson);
        setCustomFoods(savedCustomFoods);
      }
    } catch (error) {
      console.error('Error loading custom foods:', error);
    }
  };

  const saveCustomFood = async (food: FoodItem) => {
    try {
      const updatedCustomFoods = [...customFoods, food];
      setCustomFoods(updatedCustomFoods);
      await AsyncStorage.setItem(CUSTOM_FOODS_STORAGE_KEY, JSON.stringify(updatedCustomFoods));
      console.log('Custom food saved:', food.name);
    } catch (error) {
      console.error('Error saving custom food:', error);
    }
  };

  const deleteCustomFood = async (foodId: string) => {
    try {
      const updatedCustomFoods = customFoods.filter(food => food.id !== foodId);
      setCustomFoods(updatedCustomFoods);
      await AsyncStorage.setItem(CUSTOM_FOODS_STORAGE_KEY, JSON.stringify(updatedCustomFoods));
      console.log('Custom food deleted:', foodId);
    } catch (error) {
      console.error('Error deleting custom food:', error);
    }
  };

  // Cargar comidas personalizadas al inicializar
  useEffect(() => {
    loadCustomFoods();
  }, []);

  return {
    customFoods,
    saveCustomFood,
    deleteCustomFood,
    loadCustomFoods,
  };
};
