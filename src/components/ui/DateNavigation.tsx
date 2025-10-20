import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';

interface DateNavigationProps {
  selectedDate: Date;
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const DateNavigation: React.FC<DateNavigationProps> = ({
  selectedDate,
  currentDate,
  onDateSelect,
  onPreviousMonth,
  onNextMonth,
  onToday,
}) => {
  const { t, i18n } = useTranslation();
  
  // Función para obtener el locale correcto
  const getLocale = () => {
    switch (i18n.language) {
      case 'es': return 'es-ES';
      case 'en': return 'en-GB';
      case 'pt': return 'pt-PT';
      default: return 'es-ES';
    }
  };
  
  // Generar días de la semana
  const getWeekDays = () => {
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

  const weekDays = getWeekDays();

  return (
    <View>
      {/* Navegación de meses */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity 
          style={styles.monthNavButton}
          onPress={onPreviousMonth}
        >
          <Text style={styles.monthNavText}>‹</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.monthTitle}
          onPress={onToday}
        >
          <Text style={styles.monthTitleText}>
            {selectedDate.toLocaleDateString(getLocale(), { 
              month: 'long', 
              year: 'numeric' 
            }).charAt(0).toUpperCase() + 
            selectedDate.toLocaleDateString(getLocale(), { 
              month: 'long', 
              year: 'numeric' 
            }).slice(1)}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.monthNavButton}
          onPress={onNextMonth}
        >
          <Text style={styles.monthNavText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Navegación de días */}
      <View style={styles.dateNavigation}>
        {weekDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dateButton,
              day.isSelected && styles.dateButtonSelected,
              day.isToday && !day.isSelected && styles.dateButtonToday
            ]}
            onPress={() => onDateSelect(day.date)}
          >
            <Text style={[
              styles.dateDayName,
              day.isSelected && styles.dateDayNameSelected,
              day.isToday && !day.isSelected && styles.dateDayNameToday
            ]}>
              {day.dayName}
            </Text>
            <Text style={[
              styles.dateNumber,
              day.isSelected && styles.dateNumberSelected,
              day.isToday && !day.isSelected && styles.dateNumberToday
            ]}>
              {day.dayNumber}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = {
  // Navegación de meses
  monthNavigation: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  
  monthNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  monthNavText: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  
  monthTitle: {
    flex: 1,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
  },
  
  monthTitleText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
  },
  
  // Navegación de días
  dateNavigation: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  
  dateButton: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  dateButtonSelected: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  dateDayName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  
  dateDayNameSelected: {
    color: Colors.primary,
  },
  
  dateNumber: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  
  dateNumberSelected: {
    color: Colors.primary,
  },
  
  dateButtonToday: {
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  
  dateDayNameToday: {
    color: Colors.textPrimary,
    fontWeight: '700' as const,
  },
  
  dateNumberToday: {
    color: Colors.textPrimary,
    fontWeight: '700' as const,
  },
};

export default DateNavigation;
