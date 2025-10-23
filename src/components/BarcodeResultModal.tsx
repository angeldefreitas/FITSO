import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  Modal,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { BarcodeProduct } from '../services/barcodeService';
import NumberPicker from './NumberPicker';

interface BarcodeResultModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (product: BarcodeProduct, quantity: number) => void;
  product: BarcodeProduct | null;
  isLoading: boolean;
}

export default function BarcodeResultModal({ 
  visible, 
  onClose, 
  onConfirm, 
  product,
  isLoading 
}: BarcodeResultModalProps) {
  const [quantity, setQuantity] = useState(100);

  useEffect(() => {
    if (visible && product) {
      setQuantity(100);
    }
  }, [visible, product]);

  const handleConfirm = () => {
    if (!product) return;
    
    if (quantity <= 0) {
      Alert.alert('Error', 'La cantidad debe ser mayor a 0');
      return;
    }
    
    onConfirm(product, quantity);
  };

  const calculateNutritionForQuantity = () => {
    if (!product) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    const multiplier = quantity / 100;
    return {
      calories: Math.round(product.nutrition.calories * multiplier),
      protein: Math.round(product.nutrition.protein * multiplier * 10) / 10,
      carbs: Math.round(product.nutrition.carbs * multiplier * 10) / 10,
      fat: Math.round(product.nutrition.fat * multiplier * 10) / 10,
    };
  };

  const nutrition = calculateNutritionForQuantity();

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  if (!visible) return null;

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
            <LinearGradient
              colors={['#DC143C', '#2c2c2c', '#1a1a1a', '#000000']}
              locations={[0, 0.3, 0.7, 1]}
              style={styles.modalContainer}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Resultado del Escaneo</Text>
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
                    <Text style={styles.loadingText}>Buscando información del producto...</Text>
                  </View>
                ) : product ? (
                  <>
                    {/* Product Info */}
                    <View style={styles.productInfo}>
                      {product.image && (
                        <Image source={{ uri: product.image }} style={styles.productImage} />
                      )}
                      
                      <View style={styles.productDetails}>
                        <Text style={styles.productName}>{product.name}</Text>
                        {product.brand && (
                          <Text style={styles.productBrand}>Marca: {product.brand}</Text>
                        )}
                        <Text style={styles.productBarcode}>Código: {product.barcode}</Text>
                      </View>
                    </View>

                    {/* Nutrition Info per 100g */}
                    <View style={styles.nutritionSection}>
                      <Text style={styles.sectionTitle}>Información Nutricional (por 100g)</Text>
                      <View style={styles.nutritionGrid}>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionValue}>{product.nutrition.calories}</Text>
                          <Text style={styles.nutritionLabel}>Calorías</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionValue}>{product.nutrition.protein}g</Text>
                          <Text style={styles.nutritionLabel}>Proteína</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionValue}>{product.nutrition.carbs}g</Text>
                          <Text style={styles.nutritionLabel}>{t('food.carbs')}</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionValue}>{product.nutrition.fat}g</Text>
                          <Text style={styles.nutritionLabel}>{t('food.fat')}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Quantity Selector */}
                    <View style={styles.quantitySection}>
                      <Text style={styles.sectionTitle}>Ingresa la cantidad (gramos)</Text>
                      <NumberPicker
                        value={quantity}
                        onValueChange={setQuantity}
                        min={1}
                        max={1000}
                        step={1}
                        unit="g"
                        label="Gramos"
                      />
                    </View>

                    {/* Calculated Nutrition */}
                    <View style={styles.calculatedNutritionSection}>
                      <Text style={styles.sectionTitle}>Valores para {quantity}g</Text>
                      <View style={styles.nutritionGrid}>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionValue}>{nutrition.calories}</Text>
                          <Text style={styles.nutritionLabel}>Calorías</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionValue}>{nutrition.protein}g</Text>
                          <Text style={styles.nutritionLabel}>Proteína</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionValue}>{nutrition.carbs}g</Text>
                          <Text style={styles.nutritionLabel}>{t('food.carbs')}</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionValue}>{nutrition.fat}g</Text>
                          <Text style={styles.nutritionLabel}>{t('food.fat')}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Additional Info - Compacto */}
                    {product.ingredients && product.ingredients.length > 0 && (
                      <View style={styles.additionalInfo}>
                        <Text style={styles.sectionTitle}>Ingredientes</Text>
                        <Text style={styles.additionalText} numberOfLines={2}>
                          {product.ingredients.slice(0, 3).join(', ')}
                          {product.ingredients.length > 3 && '...'}
                        </Text>
                      </View>
                    )}

                    {product.allergens && product.allergens.length > 0 && (
                      <View style={styles.additionalInfo}>
                        <Text style={styles.sectionTitle}>Alérgenos</Text>
                        <Text style={styles.additionalText} numberOfLines={1}>
                          {product.allergens.join(', ')}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorTitle}>Producto No Encontrado</Text>
                    <Text style={styles.errorText}>
                      No pudimos encontrar información nutricional para este código de barras.
                    </Text>
                    <Text style={styles.errorText}>
                      Intenta escanear otro producto o agregar manualmente.
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* Botones fijos en la parte inferior */}
              {!isLoading && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  {product && (
                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={handleConfirm}
                    >
                      <Text style={styles.confirmButtonText}>Agregar Producto</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </LinearGradient>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
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
    color: Colors.textPrimary,
  },
  
  modalContent: {
    padding: 16,
  },
  
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  
  loadingText: {
    color: Colors.textPrimary,
    fontSize: 14,
    marginTop: 8,
  },
  
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  
  productDetails: {
    flex: 1,
  },
  
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  
  productBrand: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  
  productBarcode: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  
  nutritionSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  nutritionItem: {
    alignItems: 'center',
  },
  
  nutritionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  
  nutritionLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  
  quantitySection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  calculatedNutritionSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  additionalInfo: {
    paddingVertical: 10,
  },
  
  additionalText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  
  errorText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  
  confirmButton: {
    flex: 1,
    backgroundColor: Colors.textPrimary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
});
