import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import BannerAd from './BannerAd';
import { FoodAnalysis, FoodItem } from '../types/food';
import FoodSearchScreen from '../screens/FoodSearchScreen';
import BarcodeScanner from './BarcodeScanner';
import FoodResultModal from './FoodResultModal';
import ColoredMacros from './ColoredMacros';
import CircularProgressBar from './CircularProgressBar';
import MacroProgressCircle from './MacroProgressCircle';
import { barcodeService, BarcodeProduct } from '../services/barcodeService';

interface Ingredient {
  name: string;
  per100g: {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
  };
  estimatedWeight: number;
  totalValues: {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
  };
}

interface FoodAnalysisModalProps {
  visible: boolean;
  onClose: () => void;
  foodAnalysis: FoodAnalysis;
  onConfirm: (name: string, ingredients: Ingredient[], totalNutrients: any) => void;
}

export default function FoodAnalysisModal({
  visible,
  onClose,
  foodAnalysis,
  onConfirm,
}: FoodAnalysisModalProps) {
  const { t } = useTranslation();
  const [foodName, setFoodName] = useState(foodAnalysis.name);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    foodAnalysis.ingredients || []
  );
  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
  
  // Estados para los diferentes modales de agregar ingredientes
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  
  // Estado para el producto seleccionado (para el modal de cantidad)
  const [selectedProduct, setSelectedProduct] = useState<{
    type: 'food' | 'barcode';
    data: FoodItem | BarcodeProduct;
  } | null>(null);
  const [showProductQuantityModal, setShowProductQuantityModal] = useState(false);

  // Calcular totales basados en ingredientes
  const calculateTotals = () => {
    const totals = ingredients.reduce(
      (acc, ing) => ({
        calories: acc.calories + ing.totalValues.calories,
        proteins: acc.proteins + ing.totalValues.proteins,
        carbs: acc.carbs + ing.totalValues.carbs,
        fats: acc.fats + ing.totalValues.fats,
      }),
      { calories: 0, proteins: 0, carbs: 0, fats: 0 }
    );
    
    // Asegurar que todos los valores sean enteros
    return {
      calories: Math.round(totals.calories),
      proteins: Math.round(totals.proteins),
      carbs: Math.round(totals.carbs),
      fats: Math.round(totals.fats),
    };
  };

  const updateIngredientWeight = (index: number, newWeight: number) => {
    const newIngredients = [...ingredients];
    const ingredient = newIngredients[index];
    
    // Recalcular valores totales basado en el nuevo peso
    const multiplier = newWeight / 100;
    ingredient.estimatedWeight = newWeight;
    ingredient.totalValues = {
      calories: Math.round(ingredient.per100g.calories * multiplier),
      proteins: Math.round(ingredient.per100g.proteins * multiplier),
      carbs: Math.round(ingredient.per100g.carbs * multiplier),
      fats: Math.round(ingredient.per100g.fats * multiplier),
    };
    
    setIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    Alert.alert(
      'Eliminar ingrediente',
      '¿Estás seguro de eliminar este ingrediente?',
      [
        { text: t('modals.cancel'), style: 'cancel' },
        {
          text: t('modals.delete'),
          style: 'destructive',
          onPress: () => {
            const newIngredients = ingredients.filter((_, i) => i !== index);
            setIngredients(newIngredients);
          },
        },
      ]
    );
  };

  // Manejar selección desde búsqueda de base de datos
  const handleFoodSearchSelect = (food: FoodItem, quantity: number) => {
    const newIngredient = convertFoodItemToIngredient(food, quantity);
    setIngredients([...ingredients, newIngredient]);
    setShowFoodSearch(false);
  };

  // Manejar escaneo de código de barras
  const handleBarcodeScanned = async (barcode: string) => {
    setBarcodeLoading(true);
    setShowBarcodeScanner(false);
    
    try {
      const product = await barcodeService.getProductByBarcode(barcode);
      
      if (!product) {
        Alert.alert(
          'Producto no encontrado',
          'No se encontró información nutricional para este código de barras.'
        );
        return;
      }
      
      // Pequeño delay para asegurar que el scanner se cierre completamente
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mostrar modal de cantidad para el producto
      setSelectedProduct({ type: 'barcode', data: product });
      setShowProductQuantityModal(true);
      
    } catch (error) {
      console.error('Error al buscar producto:', error);
      Alert.alert('Error', 'Error al buscar el producto');
    } finally {
      setBarcodeLoading(false);
    }
  };

  // Confirmar cantidad del producto escaneado
  const handleProductQuantityConfirm = (product: BarcodeProduct | FoodAnalysis, quantity: number) => {
    if (!selectedProduct) return;
    
    let newIngredient: Ingredient;
    
    if (selectedProduct.type === 'barcode') {
      newIngredient = convertBarcodeProductToIngredient(product as BarcodeProduct, quantity);
    } else {
      newIngredient = convertFoodItemToIngredient(selectedProduct.data as FoodItem, quantity);
    }
    
    setIngredients([...ingredients, newIngredient]);
    setShowProductQuantityModal(false);
    setSelectedProduct(null);
  };

  // Convertir FoodItem a Ingredient
  const convertFoodItemToIngredient = (food: FoodItem, quantity: number): Ingredient => {
    const multiplier = quantity / 100;
    
    return {
      name: food.name,
      per100g: {
        calories: food.calories,
        proteins: food.protein,
        carbs: food.carbs,
        fats: food.fat,
      },
      estimatedWeight: quantity,
      totalValues: {
        calories: Math.round(food.calories * multiplier),
        proteins: Math.round(food.protein * multiplier),
        carbs: Math.round(food.carbs * multiplier),
        fats: Math.round(food.fat * multiplier),
      },
    };
  };

  // Convertir BarcodeProduct a Ingredient
  const convertBarcodeProductToIngredient = (product: BarcodeProduct, quantity: number): Ingredient => {
    const multiplier = quantity / 100;
    
    return {
      name: `${product.name}${product.brand ? ` (${product.brand})` : ''}`,
      per100g: {
        calories: product.nutrition.calories,
        proteins: product.nutrition.protein,
        carbs: product.nutrition.carbs,
        fats: product.nutrition.fat,
      },
      estimatedWeight: quantity,
      totalValues: {
        calories: Math.round(product.nutrition.calories * multiplier),
        proteins: Math.round(product.nutrition.protein * multiplier),
        carbs: Math.round(product.nutrition.carbs * multiplier),
        fats: Math.round(product.nutrition.fat * multiplier),
      },
    };
  };

  // Manejar agregado manual de ingrediente
  const handleManualIngredientAdd = (
    name: string,
    weight: number,
    calories: number,
    proteins: number,
    carbs: number,
    fats: number
  ) => {
    const newIngredient: Ingredient = {
      name,
      per100g: {
        calories,
        proteins,
        carbs,
        fats,
      },
      estimatedWeight: weight,
      totalValues: {
        calories: Math.round((calories * weight) / 100),
        proteins: Math.round((proteins * weight) / 100),
        carbs: Math.round((carbs * weight) / 100),
        fats: Math.round((fats * weight) / 100),
      },
    };
    
    setIngredients([...ingredients, newIngredient]);
    setShowManualInput(false);
  };

  const handleConfirm = () => {
    const totals = calculateTotals();
    onConfirm(foodName, ingredients, totals);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const totals = calculateTotals();

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <LinearGradient
        colors={['#DC143C', '#2c2c2c', '#1a1a1a', '#000000']}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.container}
      >
        {/* Header con título FITSO en el top */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.appTitle}>FITSO</Text>
            <Text style={styles.subtitle}>{t('food.scannedFood')}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Imagen de la comida */}
          {foodAnalysis.image && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: foodAnalysis.image.uri }}
                style={styles.foodImage}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Nombre editable */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('food.dishName')}</Text>
            <TextInput
              style={styles.nameInput}
              value={foodName}
              onChangeText={setFoodName}
              returnKeyType="done"
              onSubmitEditing={dismissKeyboard}
              placeholder={t('food.dishNamePlaceholder')}
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />
          </View>

          {/* Totales */}
          <View style={styles.totalsCard}>
            <Text style={styles.totalsTitle}>{t('food.totalNutritionalValues')}</Text>
            
            {/* Círculo de calorías centrado */}
            <View style={styles.caloriesContainer}>
              <CircularProgressBar
                progress={50} // Porcentaje fijo para mostrar el diseño
                size={80}
                strokeWidth={4}
                color="#f57c00"
                backgroundColor="rgba(245, 124, 0, 0.2)"
              >
                <Text style={styles.caloriesValue}>{totals.calories}</Text>
                <Text style={styles.caloriesLabel}>kcal</Text>
              </CircularProgressBar>
            </View>

            {/* Círculos de macros */}
            <View style={styles.macrosContainer}>
              <View style={styles.macroCircleContainer}>
                <MacroProgressCircle
                  progress={33.3}
                  size={50}
                  strokeWidth={3}
                  color="#FF6B35"
                  backgroundColor="rgba(255, 107, 53, 0.2)"
                  currentValue={totals.proteins.toString()}
                  targetValue="g"
                  label={t('food.protein')}
                  textColor="#2c3e50"
                />
              </View>
              
              <View style={styles.macroCircleContainer}>
                <MacroProgressCircle
                  progress={33.3}
                  size={50}
                  strokeWidth={3}
                  color="#2196F3"
                  backgroundColor="rgba(33, 150, 243, 0.2)"
                  currentValue={totals.carbs.toString()}
                  targetValue="g"
                  label={t('food.carbs')}
                  textColor="#2c3e50"
                />
              </View>
              
              <View style={styles.macroCircleContainer}>
                <MacroProgressCircle
                  progress={33.3}
                  size={50}
                  strokeWidth={3}
                  color="#4CAF50"
                  backgroundColor="rgba(76, 175, 80, 0.2)"
                  currentValue={totals.fats.toString()}
                  targetValue="g"
                  label={t('food.fat')}
                  textColor="#2c3e50"
                />
              </View>
            </View>
          </View>

          {/* Banner Ad */}
          <BannerAd style={styles.bannerAd} />

          {/* Ingredientes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('food.ingredients')}</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowFoodSearch(true)}
              >
                <Text style={styles.addButtonText}>+ {t('modals.add')}</Text>
              </TouchableOpacity>
            </View>

            {ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientCard}>
                <View style={styles.ingredientHeader}>
                  <Text style={styles.ingredientName}>{ingredient.name}</Text>
                  <TouchableOpacity onPress={() => removeIngredient(index)} style={styles.removeButtonContainer}>
                    <Text style={styles.removeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.ingredientContent}>
                  <View style={styles.quantitySection}>
                  <Text style={styles.quantityLabel}>{t('food.servingSize')}</Text>
                    <View style={styles.quantityInputContainer}>
                      <TextInput
                        style={styles.ingredientInput}
                        value={ingredient.estimatedWeight.toString()}
                        onChangeText={(text) => {
                          const value = parseInt(text) || 0;
                          updateIngredientWeight(index, value);
                        }}
                        keyboardType="numeric"
                        returnKeyType="done"
                        onSubmitEditing={dismissKeyboard}
                        placeholder="0"
                        placeholderTextColor="rgba(44, 62, 80, 0.4)"
                      />
                      <Text style={styles.quantityUnit}>g</Text>
                    </View>
                  </View>

                  <View style={styles.nutritionSection}>
                    <Text style={styles.nutritionLabel}>{t('food.nutritionalValues')}</Text>
                    <View style={styles.nutritionGrid}>
                      <View style={styles.caloriesContainer}>
                        <Text style={styles.caloriesValue}>{ingredient.totalValues.calories}</Text>
                        <Text style={styles.caloriesLabel}>kcal</Text>
                      </View>
                      <ColoredMacros
                        protein={ingredient.totalValues.proteins}
                        carbs={ingredient.totalValues.carbs}
                        fat={ingredient.totalValues.fats}
                        style={styles.macroContainer}
                        textStyle={styles.macroText}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Botón de confirmar */}
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>{t('modals.add')}</Text>
        </TouchableOpacity>

        {/* Modal para agregar ingrediente */}
        {showAddIngredientModal && (
          <Modal visible={showAddIngredientModal} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.addIngredientModal}>
                <Text style={styles.modalTitle}>{t('modals.add')}</Text>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    setShowAddIngredientModal(false);
                    setTimeout(() => setShowBarcodeScanner(true), 300);
                  }}
                >
                  <Text style={styles.optionButtonText}>📱 {t('food.scanBarcode')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    setShowAddIngredientModal(false);
                    setTimeout(() => setShowFoodSearch(true), 300);
                  }}
                >
                  <Text style={styles.optionButtonText}>🔍 {t('food.searchDatabase')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    setShowAddIngredientModal(false);
                    setTimeout(() => setShowManualInput(true), 300);
                  }}
                >
                  <Text style={styles.optionButtonText}>✏️ {t('modals.add')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, styles.cancelButton]}
                  onPress={() => setShowAddIngredientModal(false)}
                >
                  <Text style={styles.optionButtonText}>{t('modals.cancel')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* Modal de búsqueda de comida */}
        {showFoodSearch && (
          <FoodSearchScreen
            visible={showFoodSearch}
            onClose={() => setShowFoodSearch(false)}
            onFoodSelect={handleFoodSearchSelect}
            selectedMealType=""
            currentMeals={[]}
          />
        )}

        {/* Escáner de código de barras */}
        {showBarcodeScanner && (
          <BarcodeScanner
            visible={showBarcodeScanner}
            onClose={() => setShowBarcodeScanner(false)}
            onBarcodeScanned={handleBarcodeScanned}
          />
        )}

        {/* Modal de cantidad para producto escaneado */}
        {showProductQuantityModal && selectedProduct && (
          <FoodResultModal
            visible={showProductQuantityModal}
            onClose={() => {
              setShowProductQuantityModal(false);
              setSelectedProduct(null);
            }}
            product={selectedProduct.type === 'barcode' ? (selectedProduct.data as BarcodeProduct) : undefined}
            onConfirm={handleProductQuantityConfirm}
          />
        )}

        {/* Modal de input manual */}
        {showManualInput && (
          <ManualIngredientModal
            visible={showManualInput}
            onClose={() => setShowManualInput(false)}
            onConfirm={handleManualIngredientAdd}
          />
        )}

        {/* Loading overlay para código de barras */}
        {barcodeLoading && (
          <Modal visible={barcodeLoading} transparent animationType="fade">
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.textPrimary} />
              <Text style={styles.loadingText}>Buscando producto...</Text>
            </View>
          </Modal>
        )}
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 32,
  },
  
  titleContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  appTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    letterSpacing: 2,
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  
  subtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageContainer: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  foodImage: {
    width: '100%',
    height: 200,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  nameInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  ingredientCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  removeButtonContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffebee',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  
  removeButton: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: '600',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ingredientLabel: {
    fontSize: 14,
    color: '#2c3e50',
    marginRight: 12,
  },
  ingredientInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    color: '#2c3e50',
    width: 80,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutrientItem: {
    alignItems: 'center',
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  nutrientLabel: {
    fontSize: 11,
    color: '#2c3e50',
    marginTop: 2,
  },
  
  macroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  macroText: {
    fontSize: 11,
    fontWeight: '600',
  },
  
  // Nuevos estilos para las tarjetas mejoradas
  ingredientContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 20,
  },
  
  quantitySection: {
    flex: 1,
  },
  
  quantityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  
  quantityUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    marginLeft: 8,
  },
  
  nutritionSection: {
    flex: 1,
  },
  
  nutritionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  
  nutritionGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  
  caloriesContainer: {
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ffcc02',
  },
  
  caloriesValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f57c00',
  },
  
  caloriesLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: '#f57c00',
    marginTop: 2,
  },
  totalsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  // Banner Ad
  bannerAd: {
    marginTop: 16,
    marginBottom: 8,
  },
  totalsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  // Estilos para los círculos de totales
  caloriesContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  
  caloriesValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 2,
  },
  
  caloriesLabel: {
    fontSize: 12,
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
  confirmButton: {
    backgroundColor: Colors.accent,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  addIngredientModal: {
    backgroundColor: '#2c2c2c',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    borderColor: '#ff4444',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textPrimary,
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
  },
});

// Componente para agregar ingrediente manualmente
interface ManualIngredientModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (
    name: string,
    weight: number,
    calories: number,
    proteins: number,
    carbs: number,
    fats: number
  ) => void;
}

function ManualIngredientModal({ visible, onClose, onConfirm }: ManualIngredientModalProps) {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('100');
  const [calories, setCalories] = useState('');
  const [proteins, setProteins] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');

  const handleConfirm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre del ingrediente');
      return;
    }

    const parsedWeight = parseFloat(weight) || 100;
    const parsedCalories = parseFloat(calories) || 0;
    const parsedProteins = parseFloat(proteins) || 0;
    const parsedCarbs = parseFloat(carbs) || 0;
    const parsedFats = parseFloat(fats) || 0;

    onConfirm(name, parsedWeight, parsedCalories, parsedProteins, parsedCarbs, parsedFats);
    
    // Reset
    setName('');
    setWeight('100');
    setCalories('');
    setProteins('');
    setCarbs('');
    setFats('');
  };

  const handleClose = () => {
    // Reset
    setName('');
    setWeight('100');
    setCalories('');
    setProteins('');
    setCarbs('');
    setFats('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={manualStyles.modalOverlay}>
        <View style={manualStyles.modalContent}>
          <View style={manualStyles.header}>
            <Text style={manualStyles.title}>{t('modals.add')}</Text>
            <TouchableOpacity onPress={handleClose} style={manualStyles.closeButton}>
              <Text style={manualStyles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={manualStyles.form} showsVerticalScrollIndicator={false}>
            <Text style={manualStyles.label}>Nombre del ingrediente *</Text>
            <TextInput
              style={manualStyles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ej: Pechuga de pollo"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />

            <Text style={manualStyles.label}>Cantidad (gramos) *</Text>
            <TextInput
              style={manualStyles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="100"
              keyboardType="numeric"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />

            <Text style={manualStyles.sectionTitle}>Valores por 100g</Text>

            <Text style={manualStyles.label}>Calorías (kcal)</Text>
            <TextInput
              style={manualStyles.input}
              value={calories}
              onChangeText={setCalories}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />

            <Text style={manualStyles.label}>Proteínas (g)</Text>
            <TextInput
              style={manualStyles.input}
              value={proteins}
              onChangeText={setProteins}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />

            <Text style={manualStyles.label}>{t('food.carbohydratesG')}</Text>
            <TextInput
              style={manualStyles.input}
              value={carbs}
              onChangeText={setCarbs}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />

            <Text style={manualStyles.label}>{t('food.fatsG')}</Text>
            <TextInput
              style={manualStyles.input}
              value={fats}
              onChangeText={setFats}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />
          </ScrollView>

          <View style={manualStyles.buttonContainer}>
            <TouchableOpacity
              style={[manualStyles.button, manualStyles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={manualStyles.buttonText}>{t('modals.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[manualStyles.button, manualStyles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={manualStyles.buttonText}>{t('modals.add')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const manualStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#2c2c2c',
    borderRadius: 20,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.accent,
    marginTop: 20,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  confirmButton: {
    backgroundColor: Colors.accent,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
