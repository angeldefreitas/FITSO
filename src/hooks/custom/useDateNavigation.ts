import { useState, useEffect } from 'react';

export const useDateNavigation = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());

  // Actualizar fecha actual cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentDate(now);
      
      // Si cambió el día, actualizar selectedDate automáticamente
      const today = now.toISOString().slice(0, 10);
      const selectedDay = selectedDate.toISOString().slice(0, 10);
      
      if (today !== selectedDay && selectedDate < now) {
        setSelectedDate(now);
      }
    }, 60000); // Cada minuto
    
    return () => clearInterval(interval);
  }, [selectedDate]);

  const navigateToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const navigateToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const navigateToToday = () => {
    const today = new Date();
    setSelectedDate(today);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return {
    selectedDate,
    currentDate,
    navigateToPreviousMonth,
    navigateToNextMonth,
    navigateToToday,
    handleDateSelect,
  };
};
