import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { FoodItem } from '../types/food';
import CircularProgressBar from './CircularProgressBar';
import MacroProgressCircle from './MacroProgressCircle';
import { getUserProfile } from '../lib/userProfile';
import { calculateNutritionGoals, NutritionGoals } from '../lib/nutritionCalculator';

interface QuantityModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (food: FoodItem, quantity: number) => void;
  food: FoodItem | null;
  initialQuantity?: number;
  mode?: 'add' | 'edit';
  currentMeals?: Array<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

export default function QuantityModal({
  visible,
  onClose,
  onConfirm,
  food,
  initialQuantity,
  mode = 'add',
  currentMeals = [],
}: QuantityModalProps) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState('100');
  const [calculatedNutrition, setCalculatedNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals | null>(null);

  useEffect(() => {
    loadNutritionGoals();
  }, []);

  // Actualizar cantidad cuando cambia initialQuantity o se abre el modal
  useEffect(() => {
    if (visible && initialQuantity !== undefined) {
      setQuantity(initialQuantity.toString());
    } else if (visible && initialQuantity === undefined) {
      setQuantity('100');
    }
  }, [visible, initialQuantity]);

  useEffect(() => {
    if (food && quantity) {
      calculateNutrition();
    }
  }, [food, quantity]);

  const loadNutritionGoals = async () => {
    try {
      const profile = await getUserProfile();
      if (profile) {
        if (profile.customNutritionGoals) {
          setNutritionGoals({
            calories: profile.customNutritionGoals.calories,
            protein: profile.customNutritionGoals.protein,
            carbs: profile.customNutritionGoals.carbs,
            fat: profile.customNutritionGoals.fat,
            isCustom: true,
          });
        } else {
          const autoGoals = calculateNutritionGoals(profile);
          setNutritionGoals(autoGoals);
        }
      }
    } catch (error) {
      console.error('Error loading nutrition goals:', error);
    }
  };

  const calculateNutrition = () => {
    if (!food || !quantity) return;

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) return;

    // Los valores nutricionales en la base de datos están por 100g
    const multiplier = quantityNum / 100;

    setCalculatedNutrition({
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier * 10) / 10,
      carbs: Math.round(food.carbs * multiplier * 10) / 10,
      fat: Math.round(food.fat * multiplier * 10) / 10,
    });
  };

  const handleConfirm = () => {
    const quantityNum = parseFloat(quantity);
    
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Alert.alert('Error', 'Por favor ingresa una cantidad válida');
      return;
    }

    if (food) {
      onConfirm(food, quantityNum);
    }
  };

  const handleQuantityChange = (text: string) => {
    // Mejorar validación de decimales
    // Permitir: números enteros, un solo punto decimal, máximo 2 decimales
    const cleanText = text.replace(/[^0-9.]/g, ''); // Solo números y punto
    
    // Evitar múltiples puntos decimales
    const parts = cleanText.split('.');
    if (parts.length > 2) return;
    
    // Limitar a 2 decimales
    if (parts[1] && parts[1].length > 2) return;
    
    // No permitir punto al inicio
    if (cleanText.startsWith('.')) return;
    
    setQuantity(cleanText);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Calcular totales incluyendo las comidas actuales
  const getTotalNutrition = () => {
    const currentTotals = currentMeals.reduce(
      (totals, meal) => ({
        calories: totals.calories + meal.calories,
        protein: totals.protein + meal.protein,
        carbs: totals.carbs + meal.carbs,
        fat: totals.fat + meal.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return {
      calories: currentTotals.calories + calculatedNutrition.calories,
      protein: currentTotals.protein + calculatedNutrition.protein,
      carbs: currentTotals.carbs + calculatedNutrition.carbs,
      fat: currentTotals.fat + calculatedNutrition.fat,
    };
  };

  // Obtener composición nutricional del alimento actual (para los círculos de macros)
  const getFoodMacroComposition = () => {
    const totalMacros = calculatedNutrition.protein + calculatedNutrition.carbs + calculatedNutrition.fat;
    
    if (totalMacros === 0) {
      return {
        proteinPercentage: 0,
        carbsPercentage: 0,
        fatPercentage: 0,
      };
    }

    return {
      proteinPercentage: (calculatedNutrition.protein / totalMacros) * 100,
      carbsPercentage: (calculatedNutrition.carbs / totalMacros) * 100,
      fatPercentage: (calculatedNutrition.fat / totalMacros) * 100,
    };
  };

  // Obtener progreso de calorías hacia el objetivo (para el círculo de calorías)
  const getCaloriesProgress = () => {
    const totalCalories = getTotalNutrition().calories;
    const goal = getNutritionGoals().calories;
    return Math.min((totalCalories / goal) * 100, 100);
  };

  // Obtener objetivos nutricionales
  const getNutritionGoals = () => {
    return {
      calories: nutritionGoals?.calories || 2000,
      protein: nutritionGoals?.protein || 150,
      carbs: nutritionGoals?.carbs || 250,
      fat: nutritionGoals?.fat || 67,
    };
  };

  if (!food) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {mode === 'edit' ? t('modals.edit') : t('food.servingSize')}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Información del alimento */}
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <Text style={styles.foodCategory}>
                    {food.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {food.subcategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                  <Text style={styles.foodServingSize}>
                    {t('food.nutritionalValuesPer100g')}
                  </Text>
                </View>

                {/* Input de cantidad */}
                <View style={styles.quantitySection}>
                  <Text style={styles.quantityLabel}>{t('food.servingSize')}</Text>
                  <TextInput
                    style={styles.quantityInput}
                    value={quantity}
                    onChangeText={handleQuantityChange}
                    placeholder="100"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    onSubmitEditing={dismissKeyboard}
                  />
                </View>

                {/* Valores Nutricionales */}
                <View style={styles.nutritionSection}>
                  <Text style={styles.nutritionTitle}>{t('food.nutritionalValues')}</Text>
                  
                  {/* Círculo de calorías centrado - muestra progreso hacia objetivo */}
                  <View style={styles.caloriesContainer}>
                    <CircularProgressBar
                      progress={getCaloriesProgress()}
                      size={80}
                      strokeWidth={5}
                      color="#f57c00"
                      backgroundColor="rgba(245, 124, 0, 0.2)"
                    >
                      <Text style={styles.caloriesValue}>{calculatedNutrition.calories}</Text>
                      <Text style={styles.caloriesLabel}>kcal</Text>
                    </CircularProgressBar>
                  </View>

                  {/* Círculos de macros - muestran composición del alimento */}
                  <View style={styles.macrosContainer}>
                    <View style={styles.macroCircleContainer}>
                      <MacroProgressCircle
                        progress={getFoodMacroComposition().proteinPercentage}
                        size={50}
                        strokeWidth={3}
                        color="#FF6B35"
                        backgroundColor="rgba(255, 107, 53, 0.2)"
                        currentValue={calculatedNutrition.protein}
                        targetValue={100}
                        label={t('food.protein')}
                        textColor="#000000"
                      />
                      <Text style={styles.macroValue}>{calculatedNutrition.protein.toFixed(1)}g</Text>
                    </View>
                    
                    <View style={styles.macroCircleContainer}>
                      <MacroProgressCircle
                        progress={getFoodMacroComposition().fatPercentage}
                        size={50}
                        strokeWidth={3}
                        color="#4CAF50"
                        backgroundColor="rgba(76, 175, 80, 0.2)"
                        currentValue={calculatedNutrition.fat}
                        targetValue={100}
                        label={t('food.fat')}
                        textColor="#000000"
                      />
                      <Text style={styles.macroValue}>{calculatedNutrition.fat.toFixed(1)}g</Text>
                    </View>
                    
                    <View style={styles.macroCircleContainer}>
                      <MacroProgressCircle
                        progress={getFoodMacroComposition().carbsPercentage}
                        size={50}
                        strokeWidth={3}
                        color="#2196F3"
                        backgroundColor="rgba(33, 150, 243, 0.2)"
                        currentValue={calculatedNutrition.carbs}
                        targetValue={100}
                        label={t('food.carbs')}
                        textColor="#000000"
                      />
                      <Text style={styles.macroValue}>{calculatedNutrition.carbs.toFixed(1)}g</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Botones fijos en la parte inferior */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>{t('modals.cancel')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmButtonText}>
                    {mode === 'edit' ? t('modals.update') : t('modals.add')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContainer: {
    marginHorizontal: 20,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
    flex: 1,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  
  modalContent: {
    padding: 20,
    flex: 1,
  },
  
  foodInfo: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  
  foodName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  
  foodCategory: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  
  foodServingSize: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  
  quantitySection: {
    marginBottom: 16,
  },
  
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  
  quantityInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
  },
  
  // Estilos para valores nutricionales
  nutritionSection: {
    marginBottom: 2,
    alignItems: 'center',
  },
  
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  caloriesContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  
  caloriesValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  
  caloriesLabel: {
    fontSize: 14,
    color: '#666666',
  },
  
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  
  macroCircleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  
  macroValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    marginTop: 4,
    textAlign: 'center',
  },
  
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  
  cancelButton: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#000000',
  },
  
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  confirmButton: {
    flex: 1,
    backgroundColor: '#DC143C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginLeft: 8,
  },
  
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
