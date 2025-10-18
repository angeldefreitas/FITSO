import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vibration } from 'react-native';

const getWaterStorageKey = (userId: string) => `@fitso_water_tracking_${userId}`;

export const useWaterTracking = (selectedDate: Date, userId?: string) => {
  const [waterGoal, setWaterGoal] = useState(8); // Objetivo en vasos (default 8 vasos)
  const [waterConsumed, setWaterConsumed] = useState(0); // Vasos consumidos

  const loadWaterDataForDate = async (date: Date) => {
    if (!userId) {
      console.log('❌ No hay userId para cargar datos de agua');
      setWaterGoal(8);
      setWaterConsumed(0);
      return;
    }
    
    try {
      const storageKey = getWaterStorageKey(userId);
      const waterDataJson = await AsyncStorage.getItem(storageKey);
      if (waterDataJson) {
        const waterData = JSON.parse(waterDataJson);
        const targetDate = date.toISOString().slice(0, 10);
        const dayData = waterData[targetDate];
        
        if (dayData) {
          setWaterGoal(dayData.goal || 8);
          setWaterConsumed(dayData.consumed || 0);
        } else {
          // Si no hay datos para este día, resetear a valores por defecto
          setWaterGoal(8);
          setWaterConsumed(0);
        }
      } else {
        setWaterGoal(8);
        setWaterConsumed(0);
      }
    } catch (error) {
      console.error('❌ Error loading water data:', error);
      setWaterGoal(8);
      setWaterConsumed(0);
    }
  };

  const saveWaterData = async (goal: number, consumed: number) => {
    if (!userId) {
      console.log('❌ No hay userId para guardar datos de agua');
      return;
    }
    
    try {
      const storageKey = getWaterStorageKey(userId);
      const waterDataJson = await AsyncStorage.getItem(storageKey);
      let waterData = waterDataJson ? JSON.parse(waterDataJson) : {};
      
      const targetDate = selectedDate.toISOString().slice(0, 10);
      waterData[targetDate] = {
        goal,
        consumed,
        date: targetDate,
      };
      
      await AsyncStorage.setItem(storageKey, JSON.stringify(waterData));
      console.log('💧 Datos de agua guardados:', { goal, consumed, date: targetDate });
    } catch (error) {
      console.error('❌ Error saving water data:', error);
    }
  };

  const addWaterGlass = async () => {
    Vibration.vibrate([0, 1, 2, 1]); // Patrón "toc-toc" muy suave
    const newConsumed = Math.min(waterConsumed + 1, waterGoal);
    setWaterConsumed(newConsumed);
    await saveWaterData(waterGoal, newConsumed);
  };

  const removeWaterGlass = async () => {
    Vibration.vibrate([0, 1, 2, 1]); // Patrón "toc-toc" muy suave
    const newConsumed = Math.max(waterConsumed - 1, 0);
    setWaterConsumed(newConsumed);
    await saveWaterData(waterGoal, newConsumed);
  };

  const updateWaterGoal = async (newGoal: number) => {
    if (newGoal > 0 && newGoal <= 20) {
      setWaterGoal(newGoal);
      // Ajustar el consumo si excede el nuevo objetivo
      const adjustedConsumed = Math.min(waterConsumed, newGoal);
      setWaterConsumed(adjustedConsumed);
      await saveWaterData(newGoal, adjustedConsumed);
    }
  };

  // Cargar datos de agua cuando cambia la fecha seleccionada
  useEffect(() => {
    loadWaterDataForDate(selectedDate);
  }, [selectedDate]);

  return {
    waterGoal,
    waterConsumed,
    addWaterGlass,
    removeWaterGlass,
    updateWaterGoal,
    loadWaterDataForDate,
  };
};
