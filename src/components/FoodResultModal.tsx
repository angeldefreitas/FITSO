import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import BannerAd from './BannerAd';
import { BarcodeProduct } from '../services/barcodeService';
import { FoodAnalysis } from '../types/food';
import CircularProgressBar from './CircularProgressBar';
import MacroProgressCircle from './MacroProgressCircle';
import { getUserProfile } from '../lib/userProfile';
import { calculateNutritionGoals, NutritionGoals } from '../lib/nutritionCalculator';

interface FoodResultModalProps {
  visible: boolean;
  onClose: () => void;
  product?: BarcodeProduct | null;
  foodAnalysis?: FoodAnalysis | null;
  onConfirm: (product: BarcodeProduct | FoodAnalysis, quantity: number) => void;
  isLoading?: boolean;
}

export default function FoodResultModal({
  visible,
  onClose,
  product,
  foodAnalysis,
  onConfirm,
  isLoading = false,
}: FoodResultModalProps) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState('100');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  useEffect(() => {
    if ((product || foodAnalysis) && quantity) {
      calculateNutrition();
    }
  }, [product, foodAnalysis, quantity]);

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
    if (!product && !foodAnalysis || !quantity) return;

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) return;

    let baseNutrition;

    if (product) {
      // Para productos de código de barras, los valores están por 100g
      const multiplier = quantityNum / 100;
      baseNutrition = {
        calories: product.nutrition.calories,
        protein: product.nutrition.protein,
        carbs: product.nutrition.carbs,
        fat: product.nutrition.fat,
      };
      
      setCalculatedNutrition({
        calories: Math.round(baseNutrition.calories * multiplier),
        protein: Math.round(baseNutrition.protein * multiplier * 10) / 10,
        carbs: Math.round(baseNutrition.carbs * multiplier * 10) / 10,
        fat: Math.round(baseNutrition.fat * multiplier * 10) / 10,
      });
    } else if (foodAnalysis) {
      // Para análisis de IA, usar los valores totales directamente
      setCalculatedNutrition({
        calories: Math.round(foodAnalysis.totalNutrients.calories * (quantityNum / 100)),
        protein: Math.round(foodAnalysis.totalNutrients.proteins * (quantityNum / 100) * 10) / 10,
        carbs: Math.round(foodAnalysis.totalNutrients.carbs * (quantityNum / 100) * 10) / 10,
        fat: Math.round(foodAnalysis.totalNutrients.fats * (quantityNum / 100) * 10) / 10,
      });
    }
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const quantityNum = parseFloat(quantity) || 100;
      
      if (product) {
        await onConfirm(product, quantityNum);
      } else if (foodAnalysis) {
        await onConfirm(foodAnalysis, quantityNum);
      }
    } catch (error) {
      console.error('Error confirming food:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNumericInput = (text: string) => {
    const numericRegex = /^\d*\.?\d{0,2}$/;
    if (numericRegex.test(text) || text === '') {
      setQuantity(text);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
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
    const goal = getNutritionGoals().calories;
    return Math.min((calculatedNutrition.calories / goal) * 100, 100);
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

  const renderProductInfo = () => {
    if (product) {
      return (
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          {product.brand && (
            <Text style={styles.productBrand}>Marca: {product.brand}</Text>
          )}
          {product.image && (
            <Image source={{ uri: product.image }} style={styles.productImage} />
          )}
          <View style={styles.nutritionInfo}>
            <Text style={styles.nutritionTitle}>Información Nutricional (por 100g):</Text>
            <Text style={styles.nutritionText}>Calorías: {product.nutrition.calories}</Text>
            <Text style={styles.nutritionText}>{t('food.protein')}: {product.nutrition.protein}g</Text>
            <Text style={styles.nutritionText}>{t('food.carbs')}: {product.nutrition.carbs}g</Text>
            <Text style={styles.nutritionText}>{t('food.fat')}: {product.nutrition.fat}g</Text>
          </View>
        </View>
      );
    }

    if (foodAnalysis) {
      return (
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{foodAnalysis.name}</Text>
          <Text style={styles.productDescription}>{foodAnalysis.description}</Text>
          {foodAnalysis.image && (
            <Image source={{ uri: foodAnalysis.image.uri }} style={styles.productImage} />
          )}
          
          <View style={styles.nutritionInfo}>
            <Text style={styles.nutritionTitle}>Información Nutricional Total:</Text>
            <Text style={styles.nutritionText}>Calorías: {foodAnalysis.totalNutrients.calories}</Text>
            <Text style={styles.nutritionText}>{t('food.protein')}: {foodAnalysis.totalNutrients.proteins}g</Text>
            <Text style={styles.nutritionText}>{t('food.carbs')}: {foodAnalysis.totalNutrients.carbs}g</Text>
            <Text style={styles.nutritionText}>{t('food.fat')}: {foodAnalysis.totalNutrients.fats}g</Text>
          </View>

          {foodAnalysis.ingredients && foodAnalysis.ingredients.length > 0 && (
            <View style={styles.ingredientsInfo}>
              <Text style={styles.ingredientsTitle}>Ingredientes Detectados:</Text>
              {foodAnalysis.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <Text style={styles.ingredientName}>• {ingredient.name}</Text>
                  <Text style={styles.ingredientWeight}>({ingredient.estimatedWeight}g)</Text>
                </View>
              ))}
            </View>
          )}

          {/* Banner Ad */}
          <BannerAd style={styles.bannerAd} />
        </View>
      );
    }

    return null;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {t('food.servingSize')}
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
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.textPrimary} />
                <Text style={styles.loadingText}>{t('common.loading')}</Text>
              </View>
            ) : (
              <>
                {/* Información del alimento */}
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>
                    {product ? `${t('food.product')}: ${product.name}` : `${t('food.product')}: ${foodAnalysis?.name}`}
                  </Text>
                  {foodAnalysis && foodAnalysis.description && (
                    <Text style={styles.foodCategory}>
                      {foodAnalysis.description}
                    </Text>
                  )}
                  <View style={styles.imageContainer}>
                    {/* Imagen del producto */}
                    {product && product.image && (
                      <Image source={{ uri: product.image }} style={styles.productImage} />
                    )}
                    {foodAnalysis && foodAnalysis.image && (
                      <Image source={{ uri: foodAnalysis.image.uri }} style={styles.productImage} />
                    )}
                  </View>
                </View>

                {/* Input de cantidad */}
                <View style={styles.quantitySection}>
                  <Text style={styles.quantityLabel}>{t('food.enterQuantityGrams')}</Text>
                  <TextInput
                    style={styles.quantityInput}
                    value={quantity}
                    onChangeText={handleNumericInput}
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
                  
                  {/* Círculo de calorías centrado */}
                  <View style={styles.caloriesContainer}>
                    <CircularProgressBar
                      progress={getCaloriesProgress()}
                      size={75}
                      strokeWidth={5}
                      color="#f57c00"
                      backgroundColor="rgba(245, 124, 0, 0.2)"
                    >
                      <Text style={styles.caloriesValue}>{calculatedNutrition.calories}</Text>
                      <Text style={styles.caloriesLabel}>kcal</Text>
                    </CircularProgressBar>
                  </View>

                  {/* Círculos de macros */}
                  <View style={styles.macrosContainer}>
                    <View style={styles.macroCircleContainer}>
                      <MacroProgressCircle
                        progress={getFoodMacroComposition().proteinPercentage}
                        size={46}
                        strokeWidth={3}
                        color="#FF6B35"
                        backgroundColor="rgba(255, 107, 53, 0.2)"
                        currentValue={calculatedNutrition.protein.toFixed(1)}
                        targetValue="g"
                        label={t('food.protein')}
                        textColor="#2c3e50"
                      />
                    </View>
                    
                    <View style={styles.macroCircleContainer}>
                      <MacroProgressCircle
                        progress={getFoodMacroComposition().fatPercentage}
                        size={46}
                        strokeWidth={3}
                        color="#4CAF50"
                        backgroundColor="rgba(76, 175, 80, 0.2)"
                        currentValue={calculatedNutrition.fat.toFixed(1)}
                        targetValue="g"
                        label={t('food.fat')}
                        textColor="#2c3e50"
                      />
                    </View>
                    
                    <View style={styles.macroCircleContainer}>
                      <MacroProgressCircle
                        progress={getFoodMacroComposition().carbsPercentage}
                        size={46}
                        strokeWidth={3}
                        color="#2196F3"
                        backgroundColor="rgba(33, 150, 243, 0.2)"
                        currentValue={calculatedNutrition.carbs.toFixed(1)}
                        targetValue="g"
                        label={t('food.carbs')}
                        textColor="#2c3e50"
                      />
                    </View>
                  </View>
                </View>
              </>
            )}
              </ScrollView>

              {/* Botones fijos en la parte inferior */}
              {!isLoading && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onClose}
                  >
                    <Text style={styles.cancelButtonText}>{t('modals.cancel')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.confirmButton, isSubmitting && styles.confirmButtonDisabled]}
                    onPress={handleConfirm}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.confirmButtonText}>
                      {isSubmitting ? t('modals.loading') : t('modals.add')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
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
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2c3e50',
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },

  modalContent: {
    padding: 14,
  },

  foodInfo: {
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },

  foodName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 2,
  },

  foodCategory: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },

  imageContainer: {
    marginTop: 8,
    marginBottom: 6,
  },

  productImage: {
    width: '100%',
    height: 42,
    borderRadius: 4,
  },

  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  loadingText: {
    color: '#2c3e50',
    fontSize: 16,
    marginTop: 10,
  },

  productInfo: {
    marginBottom: 20,
  },

  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },

  productBrand: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },

  productDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },

  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },

  nutritionInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  nutritionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },

  nutritionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },

  ingredientsInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },

  // Banner Ad
  bannerAd: {
    marginTop: 16,
    marginBottom: 8,
  },

  ingredientsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },

  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  ingredientName: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },

  ingredientWeight: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  quantitySection: {
    marginBottom: 10,
  },

  quantityLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },

  quantityInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: '#2c3e50',
    textAlign: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Estilos para valores nutricionales
  nutritionSection: {
    marginBottom: 2,
    alignItems: 'center',
  },

  nutritionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },

  caloriesContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },

  caloriesValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 2,
  },

  caloriesLabel: {
    fontSize: 14,
    color: '#6c757d',
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
    color: Colors.textPrimary,
    marginTop: 4,
    textAlign: 'center',
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#2c3e50',
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },

  confirmButton: {
    flex: 1,
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 6,
  },

  confirmButtonDisabled: {
    opacity: 0.5,
  },

  confirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
