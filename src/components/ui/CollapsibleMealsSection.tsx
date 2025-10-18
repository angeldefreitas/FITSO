import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import MealSection from './MealSection';

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

interface CollapsibleMealsSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
  onMealTypeSelect: (mealType: string) => void;
  onMealClick: (meal: Meal) => void;
  onDeleteMeal: (mealId: string) => void;
  meals: Meal[];
  selectedDate: Date;
  nutritionGoals: any;
  expandedSections: {[key: string]: boolean};
  onToggleSection: (mealType: string) => void;
}

const CollapsibleMealsSection: React.FC<CollapsibleMealsSectionProps> = ({
  isExpanded,
  onToggle,
  onMealTypeSelect,
  onMealClick,
  onDeleteMeal,
  meals,
  selectedDate,
  nutritionGoals,
  expandedSections,
  onToggleSection,
}) => {
  const mealTypes = [
    { type: 'Desayuno', icon: '🥞' },
    { type: 'Almuerzo', icon: '🍲' },
    { type: 'Snacks', icon: '🥑' },
    { type: 'Cena', icon: '🍗' }
  ];

  // Calcular totales de todas las comidas del día
  const allMealsToday = meals.filter(meal => meal.date === selectedDate.toISOString().slice(0, 10));
  const totalMealsCount = allMealsToday.length;

  const getMealsByType = (mealType: string) => {
    const today = selectedDate.toISOString().slice(0, 10);
    const filteredMeals = meals.filter(meal => 
      meal.mealType === mealType && meal.date === today
    );
    return filteredMeals;
  };

  const getMealTotals = (mealType: string) => {
    const mealItems = getMealsByType(mealType);
    return {
      calories: Math.round(mealItems.reduce((sum, meal) => sum + meal.calories, 0)),
      protein: Math.round(mealItems.reduce((sum, meal) => sum + meal.protein, 0)),
      carbs: Math.round(mealItems.reduce((sum, meal) => sum + meal.carbs, 0)),
      fat: Math.round(mealItems.reduce((sum, meal) => sum + meal.fat, 0)),
    };
  };

  const getMealGoals = (mealType: string) => {
    const calorieGoal = nutritionGoals?.calories || 2000;
    const proteinGoal = nutritionGoals?.protein || 150;
    const carbsGoal = nutritionGoals?.carbs || 250;
    const fatGoal = nutritionGoals?.fat || 67;

    switch (mealType) {
      case 'Desayuno':
        return { calories: Math.round(calorieGoal * 0.25), protein: Math.round(proteinGoal * 0.25), carbs: Math.round(carbsGoal * 0.25), fat: Math.round(fatGoal * 0.25) };
      case 'Almuerzo':
        return { calories: Math.round(calorieGoal * 0.35), protein: Math.round(proteinGoal * 0.35), carbs: Math.round(carbsGoal * 0.35), fat: Math.round(fatGoal * 0.35) };
      case 'Snacks':
        return { calories: Math.round(calorieGoal * 0.15), protein: Math.round(proteinGoal * 0.15), carbs: Math.round(carbsGoal * 0.15), fat: Math.round(fatGoal * 0.15) };
      case 'Cena':
        return { calories: Math.round(calorieGoal * 0.25), protein: Math.round(proteinGoal * 0.25), carbs: Math.round(carbsGoal * 0.25), fat: Math.round(fatGoal * 0.25) };
      default:
        return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
  };

  const renderMealSection = (mealType: string, icon: string) => {
    const isExpanded = expandedSections[mealType];
    const mealItems = getMealsByType(mealType);
    const totals = getMealTotals(mealType);
    const goals = getMealGoals(mealType);

    return (
      <MealSection
        key={mealType}
        mealType={mealType}
        icon={icon}
        isExpanded={isExpanded}
        onToggle={() => onToggleSection(mealType)}
        onAddMeal={() => onMealTypeSelect(mealType)}
        onMealClick={onMealClick}
        onDeleteMeal={onDeleteMeal}
        mealItems={mealItems}
        totals={totals}
        goals={goals}
      />
    );
  };

  return (
    <View style={styles.collapsibleMealsCard}>
      <View style={[
        styles.collapsibleMealsHeader,
        isExpanded && styles.collapsibleMealsHeaderExpanded
      ]}>
        {/* Botón de expandir/colapsar en la esquina - siempre visible */}
        <TouchableOpacity 
          style={styles.expandCollapseButton}
          onPress={onToggle}
        >
          <Text style={styles.expandCollapseButtonText}>
            {isExpanded ? '−' : '+'}
          </Text>
        </TouchableOpacity>
        
        {/* Título cuando está expandida - al lado del botón */}
        {isExpanded && (
          <View style={styles.expandedTitleContainer}>
            <Text style={styles.expandedTitleText}>Registro Diario</Text>
          </View>
        )}
        
        {/* Contenido centrado - solo visible cuando está colapsado */}
        {!isExpanded && (
          <TouchableOpacity 
            style={styles.collapsibleMealsCenterContent}
            onPress={onToggle}
            activeOpacity={0.7}
          >
            <View style={styles.collapsibleMealsIconContainer}>
              <Svg width={53} height={53} viewBox="0 0 24 24">
                <Path 
                  fill="none" 
                  stroke="currentColor" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="1.5" 
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48 48 0 0 0-1.123-.08m-5.801 0q-.099.316-.1.664c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75a2.3 2.3 0 0 0-.1-.664m-5.8 0A2.25 2.25 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0q-.563.035-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125zM6.75 12h.008v.008H6.75zm0 3h.008v.008H6.75zm0 3h.008v.008H6.75z"
                />
              </Svg>
            </View>
            <Text style={styles.collapsibleMealsTitle}>Registro Diario</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {isExpanded && (
        <ScrollView 
          style={styles.collapsibleMealsContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {mealTypes.map((mealType) => (
            <View key={mealType.type}>
              {renderMealSection(mealType.type, mealType.icon)}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = {
  // Estilos para la sección colapsable de comidas
  collapsibleMealsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden' as const,
    minHeight: 180,
    maxHeight: 180,
    padding: 8,
    flexDirection: 'column' as const,
  },

  collapsibleMealsHeader: {
    position: 'relative' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 8,
    marginBottom: 4,
    minHeight: 160,
  },

  collapsibleMealsHeaderExpanded: {
    minHeight: 0,
    paddingVertical: 4,
    marginBottom: 0,
  },

  collapsibleMealsCenterContent: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flex: 1,
    width: '100%' as any,
    height: '100%' as any,
    paddingVertical: 20,
  },

  collapsibleMealsIconContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 12,
  },

  collapsibleMealsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#2c3e50',
    textAlign: 'center' as const,
  },

  expandCollapseButton: {
    position: 'absolute' as const,
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: '#6c757d',
    shadowColor: '#6c757d',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },

  expandCollapseButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#6c757d',
  },

  collapsibleMealsContent: {
    paddingHorizontal: 0,
    paddingBottom: 0,
    marginTop: 30,
    maxHeight: 140,
    flex: 1,
  },

  expandedTitleContainer: {
    position: 'absolute' as const,
    left: 8,
    top: 8,
    alignItems: 'flex-start' as const,
    justifyContent: 'center' as const,
  },

  expandedTitleText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#2c3e50',
    textAlign: 'left' as const,
    marginBottom: 1,
  },
};

export default CollapsibleMealsSection;
