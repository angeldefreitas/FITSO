/**
 * Utilidades para manejo de fechas
 */

export const formatDate = () => {
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return today.toLocaleDateString('es-ES', options);
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
      dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }).charAt(0).toUpperCase(),
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
  return date.toLocaleDateString('es-ES', { 
    month: 'long', 
    year: 'numeric' 
  }).charAt(0).toUpperCase() + 
  date.toLocaleDateString('es-ES', { 
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
