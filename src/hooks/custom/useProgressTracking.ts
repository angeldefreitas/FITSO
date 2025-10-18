import { useState, useEffect, useCallback } from 'react';
import { ProgressService } from '../../services/progressService';
import { ProgressData, TimeFilter, ProgressEntry } from '../../types/progress';

export const useProgressTracking = (type: 'peso' | 'medidas', timeFilter: TimeFilter) => {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgressData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ProgressService.getProgressData(type, timeFilter);
      setProgressData(data);
    } catch (err) {
      console.error('Error loading progress data:', err);
      setError('No se pudieron cargar los datos de progreso');
    } finally {
      setIsLoading(false);
    }
  }, [type, timeFilter]);

  const addWeightEntry = useCallback(async (weight: number, date: string) => {
    try {
      await ProgressService.addWeightEntry(weight, date);
      await loadProgressData();
      return true;
    } catch (err) {
      console.error('Error adding weight entry:', err);
      return false;
    }
  }, [loadProgressData]);

  const addMeasurementEntry = useCallback(async (value: number, date: string, measurementType: 'waist' | 'chest' | 'arm' | 'thigh' | 'hip') => {
    try {
      await ProgressService.addMeasurementEntry(value, date, measurementType);
      await loadProgressData();
      return true;
    } catch (err) {
      console.error('Error adding measurement entry:', err);
      return false;
    }
  }, [loadProgressData]);

  const updateWeightEntry = useCallback(async (id: string, weight: number, date: string) => {
    try {
      await ProgressService.updateWeightEntry(id, weight, date);
      await loadProgressData();
      return true;
    } catch (err) {
      console.error('Error updating weight entry:', err);
      return false;
    }
  }, [loadProgressData]);

  const deleteWeightEntry = useCallback(async (id: string) => {
    try {
      await ProgressService.deleteWeightEntry(id);
      await loadProgressData();
      return true;
    } catch (err) {
      console.error('Error deleting weight entry:', err);
      return false;
    }
  }, [loadProgressData]);

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  return {
    progressData,
    isLoading,
    error,
    loadProgressData,
    addWeightEntry,
    addMeasurementEntry,
    updateWeightEntry,
    deleteWeightEntry,
  };
};
