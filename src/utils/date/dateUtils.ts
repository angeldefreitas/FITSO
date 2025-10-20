/**
 * Utilidades para manejo de fechas
 */

import i18n from '../../config/i18n';

// Función para obtener el locale correcto
const getLocale = () => {
  switch (i18n.language) {
    case 'es': return 'es-ES';
    case 'en': return 'en-GB';
    case 'pt': return 'pt-PT';
    default: return 'es-ES';
  }
};

export const formatDate = () => {
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return today.toLocaleDateString(getLocale(), options);
};

export const getWeekDays = (selectedDate: Date, currentDate: Date) => {
  const days: Array<{
    date: Date;
    dayName: string;
    dayNumber: number;
    isToday: boolean;
    isSelected: boolean;
    month: number;
    year: number;
  }> = [];
  const baseDate = selectedDate;
  
  // Mostrar 7 días centrados en la fecha seleccionada
  for (let i = -3; i <= 3; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    
    days.push({
      date: date,
      dayName: date.toLocaleDateString(getLocale(), { weekday: 'short' }).charAt(0).toUpperCase(),
      dayNumber: date.getDate(),
      isToday: date.toDateString() === currentDate.toDateString(),
      isSelected: date.toDateString() === selectedDate.toDateString(),
      month: date.getMonth(),
      year: date.getFullYear()
    });
  }
  
  return days;
};

export const formatMonthYear = (date: Date) => {
  return date.toLocaleDateString(getLocale(), { 
    month: 'long', 
    year: 'numeric' 
  }).charAt(0).toUpperCase() + 
  date.toLocaleDateString(getLocale(), { 
    month: 'long', 
    year: 'numeric' 
  }).slice(1);
};

export const isSameDay = (date1: Date, date2: Date) => {
  return date1.toDateString() === date2.toDateString();
};

export const getDateString = (date: Date) => {
  return date.toISOString().slice(0, 10);
};
