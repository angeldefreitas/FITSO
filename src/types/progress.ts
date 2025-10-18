export interface WeightEntry {
  id: string;
  value: number; // en kg
  date: string; // formato ISO (YYYY-MM-DD)
  timestamp: number; // para ordenamiento
}

export interface MeasurementEntry {
  id: string;
  value: number; // en cm
  date: string; // formato ISO (YYYY-MM-DD)
  timestamp: number; // para ordenamiento
  type: 'waist' | 'chest' | 'arm' | 'thigh' | 'hip'; // tipo de medida
}

export type ProgressEntry = WeightEntry | MeasurementEntry;

export type TimeFilter = '1month' | '2months' | '3months' | '6months' | '1year' | 'initial' | 'all';

export interface ProgressSummary {
  initialValue: number;
  currentValue: number;
  change: number; // diferencia absoluta
  changePercentage: number; // porcentaje de cambio
  isIncrease: boolean; // true si subió, false si bajó
}

export interface ProgressData {
  entries: ProgressEntry[];
  summary: ProgressSummary;
  filteredEntries: ProgressEntry[];
}

export interface ProgressState {
  weightEntries: WeightEntry[];
  measurementEntries: MeasurementEntry[];
  selectedTimeFilter: TimeFilter;
  selectedChartType: 'peso' | 'medidas';
}
