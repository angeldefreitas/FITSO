import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import progressService, { WaterEntry, CreateWaterEntryData, UpdateWaterEntryData } from '../../services/progressService';

export interface UseWaterTrackingBackendReturn {
  waterAmount: number; // en ml
  waterGoal: number; // en ml
  waterEntries: WaterEntry[];
  loading: boolean;
  error: string | null;
  addWater: (amount: number) => Promise<void>;
  removeWater: (entryId: string) => Promise<void>;
  setWaterGoal: (goal: number) => Promise<void>;
  loadWaterData: (date: string) => Promise<void>;
  refreshWaterData: () => Promise<void>;
  getWaterProgress: () => number; // porcentaje 0-100
  getWaterConsumed: () => number; // total en ml
}

export const useWaterTrackingBackend = (selectedDate: string): UseWaterTrackingBackendReturn => {
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [waterGoal, setWaterGoalState] = useState(2000); // 2 litros por defecto
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular agua consumida
  const getWaterConsumed = useCallback(() => {
    return waterEntries.reduce((total, entry) => total + entry.amount_ml, 0);
  }, [waterEntries]);

  // Calcular progreso de agua
  const getWaterProgress = useCallback(() => {
    const consumed = getWaterConsumed();
    return waterGoal > 0 ? Math.min((consumed / waterGoal) * 100, 100) : 0;
  }, [getWaterConsumed, waterGoal]);

  // Cargar datos de agua para una fecha específica
  const loadWaterData = useCallback(async (date: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await progressService.getWaterEntriesByDate(date);
      setWaterEntries(response.entries);
      
      // Cargar meta de agua desde AsyncStorage (por ahora usar valor por defecto)
      // TODO: Implementar meta de agua en el backend
      setWaterGoalState(2000);
    } catch (err: any) {
      console.error('Error cargando datos de agua:', err);
      setError(err.message || 'Error cargando datos de agua');
      Alert.alert('Error', 'No se pudieron cargar los datos de agua');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refrescar datos de agua
  const refreshWaterData = useCallback(async () => {
    await loadWaterData(selectedDate);
  }, [selectedDate, loadWaterData]);

  // Agregar agua
  const addWater = useCallback(async (amount: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const waterData: CreateWaterEntryData = {
        amount_ml: amount,
        entry_date: selectedDate
      };
      
      const newEntry = await progressService.addWaterEntry(waterData);
      setWaterEntries(prevEntries => [...prevEntries, newEntry]);
      
      Alert.alert('Éxito', `${amount}ml de agua agregados`);
    } catch (err: any) {
      console.error('Error agregando agua:', err);
      setError(err.message || 'Error agregando agua');
      Alert.alert('Error', 'No se pudo agregar el agua');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Remover agua (eliminar entrada)
  const removeWater = useCallback(async (entryId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await progressService.deleteWaterEntry(entryId);
      setWaterEntries(prevEntries => 
        prevEntries.filter(entry => entry.id !== entryId)
      );
      
      Alert.alert('Éxito', 'Entrada de agua eliminada');
    } catch (err: any) {
      console.error('Error eliminando agua:', err);
      setError(err.message || 'Error eliminando agua');
      Alert.alert('Error', 'No se pudo eliminar la entrada de agua');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Establecer meta de agua
  const setWaterGoal = useCallback(async (goal: number) => {
    try {
      setWaterGoalState(goal);
      // TODO: Guardar meta en el backend
      Alert.alert('Éxito', `Meta de agua establecida en ${goal}ml`);
    } catch (err: any) {
      console.error('Error estableciendo meta de agua:', err);
      Alert.alert('Error', 'No se pudo establecer la meta de agua');
    }
  }, []);

  // Cargar datos de agua cuando cambie la fecha seleccionada
  useEffect(() => {
    if (selectedDate) {
      loadWaterData(selectedDate);
    }
  }, [selectedDate, loadWaterData]);

  // Calcular agua total consumida
  const waterAmount = getWaterConsumed();

  return {
    waterAmount,
    waterGoal,
    waterEntries,
    loading,
    error,
    addWater,
    removeWater,
    setWaterGoal,
    loadWaterData,
    refreshWaterData,
    getWaterProgress,
    getWaterConsumed
  };
};
