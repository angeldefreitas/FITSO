import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import ColoredMacros from '../ColoredMacros';

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
  date: string;
  mealType: 'Desayuno' | 'Almuerzo' | 'Snacks' | 'Cena';
  source?: 'manual' | 'database' | 'barcode' | 'ai';
  sourceData?: any;
}

interface MealSectionProps {
  mealType: string;
  icon: string;
  isExpanded: boolean;
  onToggle: () => void;
  onAddMeal: () => void;
  onMealClick: (meal: Meal) => void;
  onDeleteMeal: (mealId: string) => void;
  mealItems: Meal[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const MealSection: React.FC<MealSectionProps> = ({
  mealType,
  icon,
  isExpanded,
  onToggle,
  onAddMeal,
  onMealClick,
  onDeleteMeal,
  mealItems,
  totals,
  goals,
}) => {
  const { t } = useTranslation();
  
  // Función para obtener la traducción del tipo de comida
  const getMealTypeTranslation = (mealType: string) => {
    const translations: { [key: string]: string } = {
      'Desayuno': t('daily.breakfast'),
      'Almuerzo': t('daily.lunch'),
      'Snacks': t('daily.snacks'),
      'Cena': t('daily.dinner')
    };
    return translations[mealType] || mealType;
  };
  const renderMealItem = (item: Meal) => (
    <TouchableOpacity 
      style={styles.mealItemRow}
      onPress={() => onMealClick(item)}
      activeOpacity={0.7}
    >
      <View style={styles.mealItemInfo}>
        <Text style={styles.mealItemName}>{item.name}</Text>
        <ColoredMacros
          protein={item.protein}
          carbs={item.carbs}
          fat={item.fat}
          style={styles.mealItemMacros}
          textStyle={styles.mealItemMacroText}
        />
      </View>
      <View style={styles.mealItemRight}>
        <Text style={styles.mealItemCalories}>{item.calories} kcal</Text>
        <TouchableOpacity
          style={styles.deleteMealButton}
          onPress={(e) => {
            e.stopPropagation(); // Evitar que se active el click del item
            onDeleteMeal(item.id);
          }}
        >
          <Text style={styles.deleteMealButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mealSectionCard}>
      <TouchableOpacity 
        style={styles.mealSectionHeader}
        onPress={onToggle}
      >
        <View style={styles.mealSectionLeft}>
          <View style={styles.mealSectionIcon}>
            <Text style={styles.mealSectionEmoji}>{icon}</Text>
          </View>
          <View style={styles.mealSectionInfo}>
            <Text style={styles.mealSectionTitle}>{getMealTypeTranslation(mealType)}</Text>
            <Text style={styles.mealSectionCalories}>
              {totals.calories} / {goals.calories} kcal
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.addMealButton}
          onPress={onAddMeal}
        >
          <Text style={styles.addMealButtonText}>+</Text>
        </TouchableOpacity>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.mealSectionContent}>
          {mealItems.map((item) => (
            <View key={item.id}>
              {renderMealItem(item)}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = {
  // Tarjetas de secciones de comidas
  mealSectionCard: {
    backgroundColor: '#ffffff',
    marginBottom: 4,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden' as const,
  },
  
  mealSectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 8,
  },
  
  mealSectionLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  
  mealSectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e9ecef',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 8,
  },
  
  mealSectionEmoji: {
    fontSize: 14,
  },
  
  mealSectionInfo: {
    flex: 1,
  },
  
  mealSectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#2c3e50',
    marginBottom: 1,
  },
  
  mealSectionCalories: {
    fontSize: 11,
    color: '#6c757d',
  },
  
  addMealButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: '#6c757d',
    shadowColor: '#6c757d',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  
  addMealButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6c757d',
  },
  
  mealSectionContent: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  
  mealItemRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    marginBottom: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  mealItemInfo: {
    flex: 1,
  },
  
  mealItemName: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 1,
  },
  
  mealItemMacros: {
    flexDirection: 'row' as const,
  },
  
  mealItemMacroText: {
    fontSize: 9,
    fontWeight: '500' as const,
    color: '#6c757d',
    marginRight: 4,
  },
  
  mealItemRight: {
    alignItems: 'flex-end' as const,
  },
  
  mealItemCalories: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#6c757d',
    marginBottom: 1,
  },
  
  deleteMealButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: '#6c757d',
  },
  
  deleteMealButtonText: {
    fontSize: 8,
    fontWeight: '600' as const,
    color: '#6c757d',
  },
};

export default MealSection;
