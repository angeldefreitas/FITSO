import apiService, { ApiResponse } from './apiService';

// ==================== PESO ====================

export interface WeightEntry {
  id: string;
  user_id: string;
  weight: number;
  entry_date: string;
  notes?: string;
  created_at: string;
}

export interface WeightEntriesByDateResponse {
  date: string;
  entries: WeightEntry[];
  total_weight: number | null;
  entry_count: number;
}

export interface WeightEntriesByRangeResponse {
  start_date: string;
  end_date: string;
  entries: WeightEntry[];
  stats: {
    total_entries: number;
    avg_weight: number | null;
    min_weight: number | null;
    max_weight: number | null;
    weight_stddev: number | null;
  };
}

export interface WeightHistoryResponse {
  history: Array<{
    date: string;
    entry_count: number;
  }>;
  count: number;
}

export interface CreateWeightEntryData {
  weight: number;
  entry_date: string;
  notes?: string;
}

export interface UpdateWeightEntryData {
  weight?: number;
  entry_date?: string;
  notes?: string;
}

// ==================== AGUA ====================

export interface WaterEntry {
  id: string;
  user_id: string;
  amount_ml: number;
  amount_liters: number;
  entry_date: string;
  created_at: string;
}

export interface WaterEntriesByDateResponse {
  date: string;
  entries: WaterEntry[];
  total_ml: number;
  total_liters: number;
  entry_count: number;
}

export interface WaterEntriesByRangeResponse {
  start_date: string;
  end_date: string;
  entries: WaterEntry[];
  stats: {
    total_entries: number;
    total_ml: number;
    avg_per_entry: number;
    min_per_entry: number;
    max_per_entry: number;
  };
  average_daily: {
    days_with_entries: number;
    total_ml: number;
    average_daily_ml: number;
  };
}

export interface WaterHistoryResponse {
  history: Array<{
    date: string;
    total_ml: number;
    entry_count: number;
  }>;
  count: number;
}

export interface CreateWaterEntryData {
  amount_ml: number;
  entry_date: string;
}

export interface UpdateWaterEntryData {
  amount_ml?: number;
  entry_date?: string;
}

class ProgressService {
  // ==================== PESO ====================

  // Obtener entradas de peso por fecha específica
  async getWeightEntriesByDate(date: string): Promise<WeightEntriesByDateResponse> {
    const response = await apiService.get<WeightEntriesByDateResponse>(`/progress/weight/date/${date}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error obteniendo entradas de peso');
  }

  // Obtener entradas de peso por rango de fechas
  async getWeightEntriesByDateRange(startDate: string, endDate: string): Promise<WeightEntriesByRangeResponse> {
    const response = await apiService.get<WeightEntriesByRangeResponse>(`/progress/weight/range?startDate=${startDate}&endDate=${endDate}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error obteniendo entradas de peso por rango');
  }

  // Obtener historial de peso
  async getWeightHistory(limit: number = 30): Promise<WeightHistoryResponse> {
    const response = await apiService.get<WeightHistoryResponse>(`/progress/weight/history?limit=${limit}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error obteniendo historial de peso');
  }

  // Agregar nueva entrada de peso
  async addWeightEntry(weightData: CreateWeightEntryData): Promise<WeightEntry> {
    const response = await apiService.post<WeightEntry>('/progress/weight', weightData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error agregando entrada de peso');
  }

  // Obtener entrada de peso por ID
  async getWeightEntryById(id: string): Promise<WeightEntry> {
    const response = await apiService.get<WeightEntry>(`/progress/weight/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error obteniendo entrada de peso');
  }

  // Actualizar entrada de peso
  async updateWeightEntry(id: string, updateData: UpdateWeightEntryData): Promise<WeightEntry> {
    const response = await apiService.put<WeightEntry>(`/progress/weight/${id}`, updateData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error actualizando entrada de peso');
  }

  // Eliminar entrada de peso
  async deleteWeightEntry(id: string): Promise<void> {
    const response = await apiService.delete(`/progress/weight/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Error eliminando entrada de peso');
    }
  }

  // ==================== AGUA ====================

  // Obtener entradas de agua por fecha específica
  async getWaterEntriesByDate(date: string): Promise<WaterEntriesByDateResponse> {
    const response = await apiService.get<WaterEntriesByDateResponse>(`/progress/water/date/${date}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error obteniendo entradas de agua');
  }

  // Obtener entradas de agua por rango de fechas
  async getWaterEntriesByDateRange(startDate: string, endDate: string): Promise<WaterEntriesByRangeResponse> {
    const response = await apiService.get<WaterEntriesByRangeResponse>(`/progress/water/range?startDate=${startDate}&endDate=${endDate}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error obteniendo entradas de agua por rango');
  }

  // Obtener historial de agua
  async getWaterHistory(limit: number = 30): Promise<WaterHistoryResponse> {
    const response = await apiService.get<WaterHistoryResponse>(`/progress/water/history?limit=${limit}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error obteniendo historial de agua');
  }

  // Agregar nueva entrada de agua
  async addWaterEntry(waterData: CreateWaterEntryData): Promise<WaterEntry> {
    const response = await apiService.post<WaterEntry>('/progress/water', waterData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error agregando entrada de agua');
  }

  // Obtener entrada de agua por ID
  async getWaterEntryById(id: string): Promise<WaterEntry> {
    const response = await apiService.get<WaterEntry>(`/progress/water/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error obteniendo entrada de agua');
  }

  // Actualizar entrada de agua
  async updateWaterEntry(id: string, updateData: UpdateWaterEntryData): Promise<WaterEntry> {
    const response = await apiService.put<WaterEntry>(`/progress/water/${id}`, updateData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error actualizando entrada de agua');
  }

  // Eliminar entrada de agua
  async deleteWaterEntry(id: string): Promise<void> {
    const response = await apiService.delete(`/progress/water/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Error eliminando entrada de agua');
    }
  }

  // ==================== UTILIDADES ====================

  // Obtener entradas de peso del día actual
  async getTodayWeightEntries(): Promise<WeightEntriesByDateResponse> {
    const today = this.formatDateForAPI(new Date());
    return this.getWeightEntriesByDate(today);
  }

  // Obtener entradas de agua del día actual
  async getTodayWaterEntries(): Promise<WaterEntriesByDateResponse> {
    const today = this.formatDateForAPI(new Date());
    return this.getWaterEntriesByDate(today);
  }

  // Obtener entradas de peso de ayer
  async getYesterdayWeightEntries(): Promise<WeightEntriesByDateResponse> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateString = this.formatDateForAPI(yesterday);
    return this.getWeightEntriesByDate(dateString);
  }

  // Obtener entradas de agua de ayer
  async getYesterdayWaterEntries(): Promise<WaterEntriesByDateResponse> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateString = this.formatDateForAPI(yesterday);
    return this.getWaterEntriesByDate(dateString);
  }

  // Obtener entradas de peso de la semana actual
  async getThisWeekWeightEntries(): Promise<WeightEntry[]> {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

    const startDate = this.formatDateForAPI(startOfWeek);
    const endDate = this.formatDateForAPI(endOfWeek);

    const response = await this.getWeightEntriesByDateRange(startDate, endDate);
    return response.entries;
  }

  // Obtener entradas de agua de la semana actual
  async getThisWeekWaterEntries(): Promise<WaterEntry[]> {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

    const startDate = this.formatDateForAPI(startOfWeek);
    const endDate = this.formatDateForAPI(endOfWeek);

    const response = await this.getWaterEntriesByDateRange(startDate, endDate);
    return response.entries;
  }

  // Obtener entradas de peso del mes actual
  async getThisMonthWeightEntries(): Promise<WeightEntry[]> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const startDate = this.formatDateForAPI(startOfMonth);
    const endDate = this.formatDateForAPI(endOfMonth);

    const response = await this.getWeightEntriesByDateRange(startDate, endDate);
    return response.entries;
  }

  // Obtener entradas de agua del mes actual
  async getThisMonthWaterEntries(): Promise<WaterEntry[]> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const startDate = this.formatDateForAPI(startOfMonth);
    const endDate = this.formatDateForAPI(endOfMonth);

    const response = await this.getWaterEntriesByDateRange(startDate, endDate);
    return response.entries;
  }

  // Formatear fecha para la API (YYYY-MM-DD)
  formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Obtener fecha de hoy formateada
  getTodayFormatted(): string {
    return this.formatDateForAPI(new Date());
  }

  // Obtener fecha de ayer formateada
  getYesterdayFormatted(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.formatDateForAPI(yesterday);
  }

  // Convertir mililitros a litros
  mlToLiters(ml: number): number {
    return Math.round(ml / 1000 * 10) / 10;
  }

  // Convertir litros a mililitros
  litersToMl(liters: number): number {
    return Math.round(liters * 1000);
  }

  // Calcular total de agua de un array de entradas
  calculateTotalWater(entries: WaterEntry[]): number {
    return entries.reduce((total, entry) => total + entry.amount_ml, 0);
  }

  // Obtener peso más reciente de un array de entradas
  getLatestWeight(entries: WeightEntry[]): number | null {
    if (entries.length === 0) return null;
    
    // Ordenar por fecha de creación descendente y tomar el primero
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return sortedEntries[0].weight;
  }

  // Calcular cambio de peso entre dos fechas
  calculateWeightChange(startWeight: number, endWeight: number): {
    change: number;
    change_percentage: number;
  } {
    const change = endWeight - startWeight;
    const change_percentage = (change / startWeight) * 100;
    
    return {
      change: Math.round(change * 10) / 10,
      change_percentage: Math.round(change_percentage * 10) / 10
    };
  }

  // Verificar si una fecha es hoy
  isToday(dateString: string): boolean {
    const today = this.formatDateForAPI(new Date());
    return dateString === today;
  }

  // Agregar entrada de medida (placeholder para futuras implementaciones)
  async addMeasurementEntry(value: number, dateString: string, measurementType: string): Promise<void> {
    // TODO: Implementar cuando se agregue soporte para medidas corporales
    console.log('📏 Agregando medida:', { value, dateString, measurementType });
    throw new Error('Funcionalidad de medidas no implementada aún');
  }

  // ==================== MÉTODO PARA PROGRESS TRACKING ====================

  // Obtener datos de progreso para el componente ProgressTracking
  async getProgressData(chartType: 'peso' | 'medidas', timeFilter: '1month' | '2months' | '3months' | '6months' | '1year' | 'initial' | 'all') {
    try {
      if (chartType === 'peso') {
        // Obtener datos de peso
        const endDate = new Date();
        const startDate = new Date();
        
        // Calcular fecha de inicio basada en el filtro de tiempo
        switch (timeFilter) {
          case '1month':
            startDate.setMonth(endDate.getMonth() - 1);
            break;
          case '2months':
            startDate.setMonth(endDate.getMonth() - 2);
            break;
          case '3months':
            startDate.setMonth(endDate.getMonth() - 3);
            break;
          case '6months':
            startDate.setMonth(endDate.getMonth() - 6);
            break;
          case '1year':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
          default:
            startDate.setFullYear(2020); // Fecha muy antigua para 'initial' y 'all'
        }

        const startDateString = this.formatDateForAPI(startDate);
        const endDateString = this.formatDateForAPI(endDate);

        const weightResponse = await this.getWeightEntriesByDateRange(startDateString, endDateString);
        
        // Convertir a formato esperado por ProgressTracking
        const filteredEntries = weightResponse.entries.map(entry => ({
          id: entry.id,
          value: entry.weight,
          date: entry.entry_date,
          timestamp: new Date(entry.created_at).getTime()
        }));

        // Calcular resumen
        const summary = {
          totalEntries: filteredEntries.length,
          averageValue: weightResponse.stats.avg_weight || 0,
          trend: 'stable' as const
        };

        return {
          entries: filteredEntries,
          filteredEntries,
          summary: {
            initialValue: filteredEntries.length > 0 ? filteredEntries[0].value : 0,
            currentValue: filteredEntries.length > 0 ? filteredEntries[filteredEntries.length - 1].value : 0,
            change: filteredEntries.length > 1 ? filteredEntries[filteredEntries.length - 1].value - filteredEntries[0].value : 0,
            changePercentage: filteredEntries.length > 1 ? 
              ((filteredEntries[filteredEntries.length - 1].value - filteredEntries[0].value) / filteredEntries[0].value) * 100 : 0,
            isIncrease: filteredEntries.length > 1 ? 
              filteredEntries[filteredEntries.length - 1].value > filteredEntries[0].value : false
          }
        };
      } else {
        // Para medidas corporales, devolver datos vacíos por ahora
        return {
          entries: [],
          filteredEntries: [],
          summary: {
            initialValue: 0,
            currentValue: 0,
            change: 0,
            changePercentage: 0,
            isIncrease: false
          }
        };
      }
    } catch (error) {
      console.error('Error getting progress data:', error);
      // Devolver datos vacíos en caso de error
      return {
        entries: [],
        filteredEntries: [],
        summary: {
          initialValue: 0,
          currentValue: 0,
          change: 0,
          changePercentage: 0,
          isIncrease: false
        }
      };
    }
  }
}

const progressService = new ProgressService();
export default progressService;