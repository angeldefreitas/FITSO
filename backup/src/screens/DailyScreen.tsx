import React, { useState, useEffect, useRef } from 'react';
import { Alert, ScrollView, Text, TextInput, View, TouchableOpacity, FlatList, Dimensions, Modal, Image, Animated, Easing, Vibration } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// Crear componente animado de Path
const AnimatedPath = Animated.createAnimatedComponent(Path);
import LottieView from 'lottie-react-native';
import { Colors } from '../constants/colors';
import { CommonStyles } from '../constants/styles';
import { getUserProfile } from '../lib/userProfile';
import { calculateNutritionGoals, calculateNutritionProgress, NutritionGoals } from '../lib/nutritionCalculator';
import CircularProgress from '../components/CircularProgress';
import CircularProgressBar from '../components/CircularProgressBar';
import MacroProgressBars from '../components/MacroProgressBars';
import HorizontalProgressBar from '../components/HorizontalProgressBar';
import ColoredMacros from '../components/ColoredMacros';
import BottomNavigation from '../components/BottomNavigation';
import BannerAd from '../components/BannerAd';
import FoodSearchScreen from './FoodSearchScreen';
import BarcodeScanner from '../components/BarcodeScanner';
import FoodResultModal from '../components/FoodResultModal';
import FoodAnalysisModal from '../components/FoodAnalysisModal';
import FoodScanner from '../components/FoodScanner';
import QuantityModal from '../components/QuantityModal';
import { barcodeService, BarcodeProduct } from '../services/barcodeService';
import { useScan } from '../hooks/useScan';
import useImagePicker from '../hooks/useImagePicker';
import { FoodAnalysis, FoodItem } from '../types/food';

// Nuevos componentes extraídos
import CollapsibleMealsSection from '../components/ui/CollapsibleMealsSection';
import WaterSection from '../components/ui/WaterSection';
import DateNavigation from '../components/ui/DateNavigation';
import ProgressTracking from '../components/ui/ProgressTracking';
import MealHistory from '../components/ui/MealHistory';
import ProgressTrackingScreen from './ProgressTrackingScreen';
import MealTypeSelector from '../components/modals/MealTypeSelector';
import WaterGoalPicker from '../components/modals/WaterGoalPicker';

// Nuevos hooks extraídos
import { useMeals, Meal } from '../hooks/custom/useMeals';
import { useWaterTracking } from '../hooks/custom/useWaterTracking';
import { useDateNavigation } from '../hooks/custom/useDateNavigation';
import { useMealHistory, MealHistoryItem } from '../hooks/custom/useMealHistory';

// Nuevos estilos extraídos
import { dailyScreenStyles } from '../styles/screens/DailyScreenStyles';

// Componente de Banner Ad
import BannerAdComponent from '../components/BannerAd';

// Nuevas utilidades extraídas
import { handleNumericInput, validateMealForm } from '../utils/validation/inputValidation';
import { getWeekDays, formatMonthYear } from '../utils/date/dateUtils';
import { calculateMealGoals, calculateTotalNutrients, calculateProgressPercentage, calculateRemainingCalories, getNutritionDefaults } from '../utils/nutrition/nutritionUtils';

// Crear componente animado de LottieView
const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

// El tipo Meal ya está importado desde useMeals

interface DailyScreenProps {
  onTabChange: (tab: 'diario' | 'perfil') => void;
  shouldOpenAddModal?: boolean;
  onModalOpened?: () => void;
  showProgressTracking?: boolean;
  onProgressTrackingClose?: () => void;
  onProgressPress?: () => void;
}

export default function DailyScreen({ onTabChange, shouldOpenAddModal, onModalOpened, showProgressTracking, onProgressTrackingClose, onProgressPress }: DailyScreenProps) {
  // Estados locales
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals | null>(null);
  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showBarcodeResult, setShowBarcodeResult] = useState(false);
  const [showFoodScanner, setShowFoodScanner] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<BarcodeProduct | null>(null);
  const [scannedFood, setScannedFood] = useState<FoodAnalysis | null>(null);
  const [showFoodAnalysis, setShowFoodAnalysis] = useState(false);
  const [isLoadingBarcode, setIsLoadingBarcode] = useState(false);
  
  // Estados para edición de meals
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedFoodForEdit, setSelectedFoodForEdit] = useState<FoodItem | null>(null);
  const [initialQuantity, setInitialQuantity] = useState<number | undefined>(undefined);
  
  // Hooks para funcionalidades avanzadas
  const { scanPicture, scanLoading } = useScan();
  const { accessGallery, accessCamera, localImageUriArray, loading: imageLoading } = useImagePicker();
  
  // Estados para modales
  const [showWaterGoalPicker, setShowWaterGoalPicker] = useState(false);
  const [showMealTypeSelector, setShowMealTypeSelector] = useState(false);
  const [caloriesBurned, setCaloriesBurned] = useState(0);

  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    Desayuno: false,
    Almuerzo: false,
    Snacks: false,
    Cena: false
  });
  
  // Estado para controlar si la sección de mealtypes está expandida
  const [isMealTypesExpanded, setIsMealTypesExpanded] = useState(false);

  // Nuevos hooks extraídos
  const { selectedDate, currentDate, navigateToPreviousMonth, navigateToNextMonth, navigateToToday, handleDateSelect } = useDateNavigation();
  const { meals, loading, addMeal, updateMeal, deleteMeal, getMealsByType, getMealTotals, getTotalNutrients } = useMeals(selectedDate);
  const { waterGoal, waterConsumed, addWaterGlass, removeWaterGlass, updateWaterGoal } = useWaterTracking(selectedDate);
  // Variables de salud eliminadas - ya no se usan
  const healthSummary = null;
  const healthSyncStatus = null;
  const isHealthSyncing = false;
  const performHealthSync = () => Promise.resolve([]);
  const { history, addToHistory, removeFromHistory, getRecentMeals } = useMealHistory();

  useEffect(() => {
    loadNutritionGoals();
  }, []);

  // Efecto para abrir el modal automáticamente cuando se navega desde ProfileScreen
  useEffect(() => {
    if (shouldOpenAddModal) {
      console.log('🎯 Abriendo modal automáticamente desde ProfileScreen');
      setShowMealTypeSelector(true);
      // Notificar que el modal se abrió
      if (onModalOpened) {
        onModalOpened();
      }
    }
  }, [shouldOpenAddModal, onModalOpened]);

  // Las animaciones del agua ahora están en el componente WaterSection

  async function loadNutritionGoals() {
    try {
      const profile = await getUserProfile();
      if (profile) {
        // Usar objetivos personalizados si existen, sino calcular automáticamente
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
  }

  // Las funciones loadMeals, loadMealsForDate y saveMeals ahora están en el hook useMeals

  async function addMealManual() {
    const validation = validateMealForm(name, calories, selectedMealType);
    if (!validation.isValid) {
      Alert.alert('Datos requeridos', validation.message);
      return;
    }

    const mealData = {
      name: name.trim(),
      calories: Math.round(parseFloat(calories) || 0),
      protein: Math.round(parseFloat(protein) || 0),
      carbs: Math.round(parseFloat(carbs) || 0),
      fat: Math.round(parseFloat(fat) || 0),
      mealType: selectedMealType as 'Desayuno' | 'Almuerzo' | 'Snacks' | 'Cena',
      source: 'manual' as const,
      sourceData: {
        name: name.trim(),
        calories: parseFloat(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
      },
    };

    if (editingMeal) {
      // Modo creación desde historial
      const success = await addMeal(mealData);
      if (success) {
        // Agregar al historial (actualizar fecha de último uso)
        const newMeal: Meal = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          date: selectedDate.toISOString().slice(0, 10),
          name: mealData.name,
          calories: mealData.calories,
          protein: mealData.protein,
          carbs: mealData.carbs,
          fat: mealData.fat,
          mealType: mealData.mealType,
          source: mealData.source,
          sourceData: mealData.sourceData,
        };
        await addToHistory(newMeal);
        setEditingMeal(null);
      }
    } else {
      // Modo creación normal
      const success = await addMeal(mealData);
      if (success) {
        // Agregar al historial
        const newMeal: Meal = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          date: selectedDate.toISOString().slice(0, 10),
          name: mealData.name,
          calories: mealData.calories,
          protein: mealData.protein,
          carbs: mealData.carbs,
          fat: mealData.fat,
          mealType: mealData.mealType,
          source: mealData.source,
          sourceData: mealData.sourceData,
        };
        await addToHistory(newMeal);
        
        // Limpiar formulario
        setName('');
        setCalories('');
        setProtein('');
        setCarbs('');
        setFat('');
      }
    }
  }

  // La función deleteMeal ahora está en el hook useMeals

  // Las funciones de agua ahora están en el hook useWaterTracking

  // Calcular totales usando utilidades extraídas
  const { calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fat: totalFat } = getTotalNutrients();
  
  // Usar objetivos calculados o valores por defecto
  const defaults = getNutritionDefaults();
  const baseCalorieGoal = nutritionGoals?.calories || defaults.calories;
  // Sumar calorías quemadas manuales + calorías de actividad sincronizada
  const totalCaloriesBurned = caloriesBurned + (healthSummary?.totalCaloriesBurned || 0);
  const calorieGoal = baseCalorieGoal + totalCaloriesBurned;
  const proteinGoal = nutritionGoals?.protein || defaults.protein;
  const carbsGoal = nutritionGoals?.carbs || defaults.carbs;
  const fatGoal = nutritionGoals?.fat || defaults.fat;
  
  const progressPercentage = calculateProgressPercentage(totalCalories, calorieGoal);
  
  // Calcular progreso de macronutrientes
  const progress = nutritionGoals ? calculateNutritionProgress(nutritionGoals, {
    calories: totalCalories,
    protein: totalProtein,
    carbs: totalCarbs,
    fat: totalFat,
  }) : null;

  // Las funciones formatDate, getWeekDays y navegación de fechas ahora están en las utilidades extraídas


  const openMealModal = (mealType: string) => {
    console.log('🍽️ Abriendo pantalla de búsqueda para:', mealType);
    setSelectedMealType(mealType);
    setShowFoodSearch(true);
  };

  const handleAddButtonPress = () => {
    console.log('➕ Botón + presionado, abriendo selector de tipo de comida');
    setShowMealTypeSelector(true);
  };

  const handleMealTypeSelect = async (mealType: string) => {
    console.log('🍽️ Tipo de comida seleccionado:', mealType);
    setSelectedMealType(mealType);
    setShowMealTypeSelector(false);
    
    // Si hay una comida del historial seleccionada, abrir modal de cantidad
    if (editingMeal) {
      try {
        // Determinar el tipo de comida del historial para abrir el modal correcto
        if (editingMeal.source === 'database' && editingMeal.sourceData?.food) {
          // Es una comida de base de datos, usar QuantityModal
          setSelectedFoodForEdit(editingMeal.sourceData.food);
          setInitialQuantity(editingMeal.sourceData.quantity || 100); // Cantidad por defecto
          setShowQuantityModal(true);
        } else if (editingMeal.source === 'barcode' && editingMeal.sourceData?.product) {
          // Es un producto escaneado, usar FoodResultModal
          setScannedProduct(editingMeal.sourceData.product);
          setShowBarcodeResult(true);
        } else if (editingMeal.source === 'ai' && editingMeal.sourceData) {
          // Es una comida analizada por IA, usar FoodAnalysisModal
          const foodAnalysis = {
            id: editingMeal.id,
            name: editingMeal.sourceData.name || editingMeal.name,
            description: editingMeal.sourceData.description || '',
            ingredients: editingMeal.sourceData.ingredients || [],
            totalNutrients: editingMeal.sourceData.totalNutrients || {
              calories: editingMeal.calories,
              proteins: editingMeal.protein,
              carbs: editingMeal.carbs,
              fats: editingMeal.fat,
            },
            image: editingMeal.sourceData.image,
          };
          setScannedFood(foodAnalysis);
          setShowFoodAnalysis(true);
        } else {
          // Es una comida manual, usar formulario manual
          setName(editingMeal.name);
          setCalories(editingMeal.calories.toString());
          setProtein(editingMeal.protein.toString());
          setCarbs(editingMeal.carbs.toString());
          setFat(editingMeal.fat.toString());
          setShowManualForm(true);
          setShowMealModal(true);
        }
      } catch (error) {
        console.error('❌ Error opening history meal for editing:', error);
        Alert.alert('Error', 'Error al abrir la comida del historial para edición');
        setEditingMeal(null);
        setSelectedMealType('');
      }
    } else {
      // Si no hay comida del historial, abrir modal normal
      setTimeout(() => {
        openMealModal(mealType);
      }, 100);
    }
  };

  // Manejar cambio de calorías quemadas
  const handleCaloriesBurnedChange = (calories: number) => {
    setCaloriesBurned(calories);
  };

  const closeFoodSearch = () => {
    setShowFoodSearch(false);
    // NO resetear selectedMealType aquí para mantener el contexto si se vuelve a intentar
    // Solo se resetea cuando se confirma exitosamente o se cierra todo
  };

  const openFoodSearch = () => {
    // Cerrar el modal principal primero
    setShowMealModal(false);
    // Pequeño delay para asegurar que el modal se cierre antes de abrir la búsqueda
    setTimeout(() => {
      setShowFoodSearch(true);
    }, 100);
  };

  const openManualForm = () => {
    setShowManualForm(true);
  };

  const openBarcodeScanner = () => {
    // Cerrar la pantalla de búsqueda primero
    setShowFoodSearch(false);
    // Pequeño delay para asegurar que se cierre antes de abrir el escáner
    setTimeout(() => {
      setShowBarcodeScanner(true);
    }, 100);
  };

  const closeBarcodeScanner = () => {
    setShowBarcodeScanner(false);
    // NO resetear selectedMealType aquí para mantener el contexto si se vuelve a intentar
    // Solo se resetea cuando se confirma exitosamente o se cierra todo
  };

  const openFoodScanner = () => {
    // Cerrar la pantalla de búsqueda primero
    setShowFoodSearch(false);
    // Pequeño delay para asegurar que se cierre antes de abrir el escáner
    setTimeout(() => {
      setShowFoodScanner(true);
    }, 100);
  };

  const closeFoodScanner = () => {
    setShowFoodScanner(false);
    // NO resetear selectedMealType aquí para mantener el contexto si se vuelve a intentar
    // Solo se resetea cuando se confirma exitosamente o se cierra todo
  };

  const openImagePicker = async () => {
    try {
      console.log('📸 Abriendo selector de galería...');
      
      // Cerrar modal
      
      // Pequeño delay para que el modal se cierre correctamente
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Abrir galería
      const images = await accessGallery(false, false, 'photo');
      
      if (images && images.length > 0) {
        const imageUri = images[0].path || images[0].uri;
        
        if (!imageUri) {
          console.log('❌ No se pudo obtener la URI de la imagen');
          Alert.alert('Error', 'No se pudo obtener la imagen seleccionada');
          return;
        }
        
        console.log('📸 Imagen seleccionada:', imageUri);
        
        // Mostrar loading
        setIsLoadingBarcode(true);
        
        // Analizar imagen con Claude
        const foodAnalysis = await scanPicture(imageUri);
        
        if (foodAnalysis) {
          setScannedFood(foodAnalysis);
          setShowBarcodeResult(true);
        }
        
        setIsLoadingBarcode(false);
      } else {
        console.log('📸 No se seleccionó ninguna imagen');
      }
    } catch (error) {
      console.error('❌ Error al seleccionar imagen:', error);
      setIsLoadingBarcode(false);
      Alert.alert('Error', 'Error al seleccionar imagen de la galería');
    }
  };

  const handleBarcodeScanned = async (barcode: string) => {
    console.log('📱 Código de barras escaneado:', barcode);
    
    setIsLoadingBarcode(true);
    setShowBarcodeScanner(false);
    
    try {
      const product = await barcodeService.getProductByBarcode(barcode);
      
      if (product) {
        setScannedProduct(product);
        setShowBarcodeResult(true);
      } else {
        Alert.alert(
          'Producto No Encontrado', 
          'No pudimos encontrar información nutricional para este código de barras. Intenta escanear otro producto o agregar manualmente.',
          [{ text: 'OK', onPress: () => setShowMealModal(true) }]
        );
      }
    } catch (error) {
      console.error('Error processing barcode:', error);
      Alert.alert('Error', 'Error al procesar el código de barras');
    } finally {
      setIsLoadingBarcode(false);
    }
  };

  const closeBarcodeResult = () => {
    setShowBarcodeResult(false);
    setScannedProduct(null);
    setScannedFood(null);
    // Si estamos editando desde el historial, limpiar el estado
    if (editingMeal) {
      setEditingMeal(null);
      setSelectedMealType('');
    }
    // No resetear selectedMealType aquí para mantener el contexto del tipo de comida seleccionado
    // setSelectedMealType('');
  };

  const handleBarcodeProductConfirm = async (product: BarcodeProduct | FoodAnalysis, quantity: number) => {
    try {
      // Validar que tengamos un mealType seleccionado
      if (!selectedMealType) {
        console.error('❌ No hay mealType seleccionado');
        Alert.alert('Error', 'Por favor selecciona el tipo de comida primero');
        return;
      }

      let mealData: Partial<Meal>;

      // Verificar si es un BarcodeProduct o FoodAnalysis
      if ('barcode' in product) {
        // Es un BarcodeProduct
        console.log('🍽️ Procesando producto escaneado (barcode):', product.name);
        
        const foodItem = barcodeService.createFoodItemFromBarcode(product as BarcodeProduct, quantity);
        
        mealData = {
          name: `${foodItem.name} (${quantity}g)`,
          calories: foodItem.calories,
          protein: foodItem.protein,
          carbs: foodItem.carbs,
          fat: foodItem.fat,
          mealType: selectedMealType as 'Desayuno' | 'Almuerzo' | 'Snacks' | 'Cena',
          source: 'barcode',
          sourceData: { product: product as BarcodeProduct, quantity },
        };
      } else {
        // Es un FoodAnalysis
        console.log('🍽️ Procesando comida escaneada (IA):', product.name);
        
        // Usar los totales ya calculados en FoodAnalysis
        const totalNutrients = product.totalNutrients;
        
        mealData = {
          name: product.name,
          calories: Math.round(totalNutrients.calories),
          protein: Math.round(totalNutrients.proteins),
          carbs: Math.round(totalNutrients.carbs),
          fat: Math.round(totalNutrients.fats),
          mealType: selectedMealType as 'Desayuno' | 'Almuerzo' | 'Snacks' | 'Cena',
          source: 'ai',
          sourceData: product as FoodAnalysis,
        };
      }

      if (editingMeal) {
        // Modo creación desde historial
        const success = await addMeal(mealData as Omit<Meal, 'id' | 'createdAt' | 'date'>);
        if (success) {
          // Agregar al historial (actualizar fecha de último uso)
          const newMeal: Meal = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            date: selectedDate.toISOString().slice(0, 10),
            name: mealData.name,
            calories: mealData.calories,
            protein: mealData.protein,
            carbs: mealData.carbs,
            fat: mealData.fat,
            mealType: mealData.mealType,
            source: mealData.source,
            sourceData: mealData.sourceData,
          };
          await addToHistory(newMeal);
          console.log('✅ Comida agregada desde historial con mealType:', selectedMealType);
        }
        setEditingMeal(null);
      } else {
        // Modo creación normal
        const success = await addMeal(mealData as Omit<Meal, 'id' | 'createdAt' | 'date'>);
        if (success) {
          // Agregar al historial
          const newMeal: Meal = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            date: selectedDate.toISOString().slice(0, 10),
            name: mealData.name,
            calories: mealData.calories,
            protein: mealData.protein,
            carbs: mealData.carbs,
            fat: mealData.fat,
            mealType: mealData.mealType,
            source: mealData.source,
            sourceData: mealData.sourceData,
          };
          await addToHistory(newMeal);
          console.log('✅ Comida agregada con mealType:', selectedMealType);
        }
      }

      // Cerrar todos los modales
      setShowBarcodeResult(false);
      setScannedProduct(null);
      setScannedFood(null);
      // IMPORTANTE: Resetear selectedMealType después de usar su valor
      setSelectedMealType('');

      Alert.alert('¡Perfecto!', editingMeal ? 'Producto agregado desde el historial' : 'Producto escaneado agregado correctamente');
    } catch (error) {
      console.error('❌ Error adding scanned product:', error);
      Alert.alert('Error', 'Error al agregar el producto escaneado');
    }
  };

  const handleFoodDetected = async (foodAnalysis: FoodAnalysis) => {
    try {
      console.log('🍽️ Comida detectada, mostrando modal de análisis...');
      
      // Guardar el análisis y cerrar el escáner
      setScannedFood(foodAnalysis);
      setShowFoodScanner(false);
      
      // Mostrar el modal de análisis en lugar de agregar automáticamente
      setShowFoodAnalysis(true);
    } catch (error) {
      console.error('Error handling food detection:', error);
      Alert.alert('Error', 'Error al procesar la comida');
    }
  };

  const handleFoodAnalysisConfirm = async (
    name: string,
    ingredients: any[],
    totalNutrients: any
  ) => {
    try {
      // Validar que tengamos un mealType seleccionado
      if (!selectedMealType) {
        console.error('❌ No hay mealType seleccionado');
        Alert.alert('Error', 'Por favor selecciona el tipo de comida primero');
        return;
      }

      const mealData = {
        name: name,
        calories: totalNutrients.calories,
        protein: totalNutrients.proteins,
        carbs: totalNutrients.carbs,
        fat: totalNutrients.fats,
        mealType: selectedMealType as 'Desayuno' | 'Almuerzo' | 'Snacks' | 'Cena',
        source: 'ai' as const,
        sourceData: {
          name,
          ingredients,
          totalNutrients,
          image: scannedFood?.image,
        },
      };

      if (editingMeal) {
        // Modo creación desde historial
        const success = await addMeal(mealData as Omit<Meal, 'id' | 'createdAt' | 'date'>);
        if (success) {
          // Agregar al historial (actualizar fecha de último uso)
          const newMeal: Meal = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            date: selectedDate.toISOString().slice(0, 10),
            name: mealData.name,
            calories: mealData.calories,
            protein: mealData.protein,
            carbs: mealData.carbs,
            fat: mealData.fat,
            mealType: mealData.mealType,
            source: mealData.source,
            sourceData: mealData.sourceData,
          };
          await addToHistory(newMeal);
          console.log('✅ Comida agregada desde historial con mealType:', selectedMealType);
        }
        setEditingMeal(null);
      } else {
        // Modo creación normal
        const success = await addMeal(mealData as Omit<Meal, 'id' | 'createdAt' | 'date'>);
        if (success) {
          // Agregar al historial
          const newMeal: Meal = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            date: selectedDate.toISOString().slice(0, 10),
            name: mealData.name,
            calories: mealData.calories,
            protein: mealData.protein,
            carbs: mealData.carbs,
            fat: mealData.fat,
            mealType: mealData.mealType,
            source: mealData.source,
            sourceData: mealData.sourceData,
          };
          await addToHistory(newMeal);
          console.log('✅ Comida agregada con mealType:', selectedMealType);
        }
      }

      // Cerrar modales y resetear estado
      setShowFoodAnalysis(false);
      setScannedFood(null);
      // IMPORTANTE: Resetear selectedMealType después de usar su valor
      setSelectedMealType('');

      Alert.alert('¡Perfecto!', editingMeal ? 'Comida agregada desde el historial' : 'Comida agregada exitosamente');
    } catch (error) {
      console.error('Error adding food:', error);
      Alert.alert('Error', 'Error al agregar la comida');
    }
  };

  const closeFoodAnalysis = () => {
    setShowFoodAnalysis(false);
    setScannedFood(null);
    
    // Si estamos editando desde el historial, limpiar el estado
    if (editingMeal) {
      setEditingMeal(null);
      setSelectedMealType('');
    }
  };

  const handleFoodSelect = async (food: any, quantity: number) => {
    try {
      // Validar que tengamos un mealType seleccionado
      if (!selectedMealType) {
        console.error('❌ No hay mealType seleccionado');
        Alert.alert('Error', 'Por favor selecciona el tipo de comida primero');
        return;
      }

      // Calcular valores nutricionales basados en la cantidad especificada
      const multiplier = quantity / 100; // Los valores en la base de datos están por 100g
      
      const mealData = {
        name: `${food.name} (${quantity}g)`,
        calories: Math.round(food.calories * multiplier),
        protein: Math.round(food.protein * multiplier),
        carbs: Math.round(food.carbs * multiplier),
        fat: Math.round(food.fat * multiplier),
        mealType: selectedMealType as 'Desayuno' | 'Almuerzo' | 'Snacks' | 'Cena',
        source: 'database' as const,
        sourceData: { food, quantity },
      };

      if (editingMeal) {
        // Modo edición
        const success = await updateMeal(editingMeal.id, mealData);
        if (success) {
          setEditingMeal(null);
        }
      } else {
        // Modo creación
        const success = await addMeal(mealData as Omit<Meal, 'id' | 'createdAt' | 'date'>);
        if (success) {
          // Agregar al historial
          const newMeal: Meal = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            date: selectedDate.toISOString().slice(0, 10),
            name: mealData.name,
            calories: mealData.calories,
            protein: mealData.protein,
            carbs: mealData.carbs,
            fat: mealData.fat,
            mealType: mealData.mealType,
            source: mealData.source,
            sourceData: mealData.sourceData,
          };
          await addToHistory(newMeal);
          console.log('✅ Comida agregada con mealType:', selectedMealType);
        }
      }

      // Cerrar todos los modales con un pequeño delay
      setTimeout(() => {
        setShowFoodSearch(false);
        setSelectedMealType('');
      }, 100);

      Alert.alert('¡Perfecto!', editingMeal ? 'Comida actualizada correctamente' : 'Comida agregada correctamente');
    } catch (error) {
      console.error('Error adding food:', error);
      Alert.alert('Error', 'Error al agregar la comida');
    }
  };

  const handleQuantityModalClose = () => {
    setShowQuantityModal(false);
    setSelectedFoodForEdit(null);
    setInitialQuantity(undefined);
    setEditingMeal(null);
    setSelectedMealType('');
  };

  const handleQuantityConfirm = async (food: FoodItem, quantity: number) => {
    try {
      // Validar que tengamos un mealType seleccionado
      if (!selectedMealType) {
        console.error('❌ No hay mealType seleccionado');
        Alert.alert('Error', 'Por favor selecciona el tipo de comida primero');
        return;
      }

      // Calcular valores nutricionales basados en la cantidad especificada
      const multiplier = quantity / 100; // Los valores en la base de datos están por 100g
      
      const mealData = {
        name: `${food.name} (${quantity}g)`,
        calories: Math.round(food.calories * multiplier),
        protein: Math.round(food.protein * multiplier),
        carbs: Math.round(food.carbs * multiplier),
        fat: Math.round(food.fat * multiplier),
        mealType: selectedMealType as 'Desayuno' | 'Almuerzo' | 'Snacks' | 'Cena',
        source: 'database' as const,
        sourceData: { food, quantity },
      };

      // Siempre estamos en modo edición cuando se abre el modal de cantidad desde un click
      if (editingMeal) {
        const success = await addMeal(mealData);
        if (success) {
          // Agregar al historial (actualizar fecha de último uso)
          const newMeal: Meal = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            date: selectedDate.toISOString().slice(0, 10),
            name: mealData.name,
            calories: mealData.calories,
            protein: mealData.protein,
            carbs: mealData.carbs,
            fat: mealData.fat,
            mealType: mealData.mealType,
            source: mealData.source,
            sourceData: mealData.sourceData,
          };
          await addToHistory(newMeal);

          console.log('✅ Comida agregada desde historial con nueva cantidad');

          // Cerrar modal y resetear estados
          setShowQuantityModal(false);
          setSelectedFoodForEdit(null);
          setInitialQuantity(undefined);
          setEditingMeal(null);
          setSelectedMealType('');

          Alert.alert('¡Perfecto!', 'Comida agregada desde el historial');
        }
      }
    } catch (error) {
      console.error('Error adding food from history:', error);
      Alert.alert('Error', 'Error al agregar la comida desde el historial');
    }
  };

  // Función para manejar el click en una comida del historial
  const handleHistoryMealPress = async (historyItem: MealHistoryItem) => {
    try {
      console.log('🍽️ Comida del historial seleccionada:', historyItem.name);
      
      // Guardar la comida del historial seleccionada para usar después
      setEditingMeal({
        id: historyItem.id,
        name: historyItem.name,
        calories: historyItem.calories,
        protein: historyItem.protein,
        carbs: historyItem.carbs,
        fat: historyItem.fat,
        createdAt: historyItem.lastUsed,
        date: selectedDate.toISOString().slice(0, 10),
        mealType: 'Desayuno', // Valor por defecto, se cambiará en el modal
        source: historyItem.source,
        sourceData: historyItem.sourceData,
      } as Meal);
      
      // Abrir modal de selección de tipo de comida
      setShowMealTypeSelector(true);
      
    } catch (error) {
      console.error('❌ Error handling history meal press:', error);
      Alert.alert('Error', 'Error al abrir la comida del historial');
    }
  };

  // Función para eliminar una comida del historial
  const handleDeleteHistoryMeal = async (mealId: string) => {
    try {
      await removeFromHistory(mealId);
      console.log('✅ Comida eliminada del historial');
    } catch (error) {
      console.error('❌ Error deleting from history:', error);
      Alert.alert('Error', 'Error al eliminar la comida del historial');
    }
  };

  // La función handleNumericInput ahora está en las utilidades extraídas

  const toggleSection = (mealType: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [mealType]: !prev[mealType]
    }));
  };

  // Las funciones getMealsByType, getMealTotals y getMealGoals ahora están en los hooks y utilidades extraídas

  const handleMealItemClick = (meal: Meal) => {
    setEditingMeal(meal);
    
    // Abrir el modal correcto según el origen
    switch (meal.source) {
      case 'manual':
        // Cargar datos en el formulario manual
        setName(meal.sourceData?.name || meal.name);
        setCalories(meal.sourceData?.calories?.toString() || '');
        setProtein(meal.sourceData?.protein?.toString() || '');
        setCarbs(meal.sourceData?.carbs?.toString() || '');
        setFat(meal.sourceData?.fat?.toString() || '');
        setSelectedMealType(meal.mealType);
        setShowManualForm(true);
        setShowMealModal(true);
        break;
        
      case 'database':
        // Abrir modal de cantidad para editar el alimento de base de datos
        if (meal.sourceData?.food) {
          setEditingMeal(meal);
          setSelectedFoodForEdit(meal.sourceData.food);
          setInitialQuantity(meal.sourceData.quantity);
          setSelectedMealType(meal.mealType);
          setShowQuantityModal(true);
        }
        break;
        
      case 'barcode':
        // Abrir modal de código de barras con el producto
        if (meal.sourceData?.product) {
          setScannedProduct(meal.sourceData.product);
          setSelectedMealType(meal.mealType);
          setShowBarcodeResult(true);
        }
        break;
        
      case 'ai':
        // Abrir modal de análisis de IA
        if (meal.sourceData) {
          // Reconstruir FoodAnalysis desde sourceData
          const foodAnalysis: FoodAnalysis = {
            id: meal.id,
            name: meal.sourceData.name || meal.name,
            description: meal.sourceData.description || '',
            ingredients: meal.sourceData.ingredients || [],
            totalNutrients: meal.sourceData.totalNutrients || {
              calories: meal.calories,
              proteins: meal.protein,
              carbs: meal.carbs,
              fats: meal.fat,
            },
            image: meal.sourceData.image,
          };
          setScannedFood(foodAnalysis);
          setSelectedMealType(meal.mealType);
          setShowFoodAnalysis(true);
        }
        break;
        
      default:
        // Si no tiene source, permitir edición manual
        setName(meal.name);
        setCalories(meal.calories.toString());
        setProtein(meal.protein.toString());
        setCarbs(meal.carbs.toString());
        setFat(meal.fat.toString());
        setSelectedMealType(meal.mealType);
        setShowManualForm(true);
        setShowMealModal(true);
        break;
    }
  };

  // Las funciones de renderizado ahora están en los componentes extraídos

  // Permitir números negativos para mostrar cuando se excede el objetivo
  const remainingCalories = calculateRemainingCalories(totalCalories, calorieGoal);
  
  // Calcular el progreso del círculo (0-100)
  const circleProgress = calculateProgressPercentage(totalCalories, calorieGoal);

  return (
    <LinearGradient
      colors={['#DC143C', '#2c2c2c', '#1a1a1a', '#000000']}
      locations={[0, 0.3, 0.7, 1]}
      style={dailyScreenStyles.container}
    >
      <ScrollView style={dailyScreenStyles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header con título */}
        <View style={dailyScreenStyles.appHeader}>
          <Text style={dailyScreenStyles.appTitle}>FITSO</Text>
        </View>

        {/* Navegación de fechas */}
        <DateNavigation
          selectedDate={selectedDate}
          currentDate={currentDate}
          onDateSelect={handleDateSelect}
          onPreviousMonth={navigateToPreviousMonth}
          onNextMonth={navigateToNextMonth}
          onToday={navigateToToday}
        />

        {/* Sección de Calorías */}
        <TouchableOpacity 
          style={dailyScreenStyles.caloriesSection}
          onPress={() => onTabChange('perfil')}
          activeOpacity={0.7}
        >
          <View style={dailyScreenStyles.caloriesLeft}>
            <Text style={dailyScreenStyles.caloriesConsumedNumber}>{totalCalories}</Text>
            <Text style={dailyScreenStyles.caloriesConsumedLabel}>Consumidas</Text>
          </View>
          
          <View style={dailyScreenStyles.caloriesCenter}>
            <CircularProgressBar
              progress={circleProgress}
              size={120}
              strokeWidth={4}
              color={Colors.textPrimary}
              backgroundColor="rgba(128, 128, 128, 0.1)"
            >
              <Text style={dailyScreenStyles.caloriesRemainingNumber}>{remainingCalories}</Text>
              <Text style={dailyScreenStyles.caloriesRemainingLabel}>kcal restantes</Text>
            </CircularProgressBar>
          </View>
          
          <View style={dailyScreenStyles.caloriesRight}>
            <Text style={dailyScreenStyles.caloriesGoalNumber}>{calorieGoal}</Text>
            <Text style={dailyScreenStyles.caloriesGoalLabel}>Objetivo</Text>
          </View>
        </TouchableOpacity>

        {/* Sección de Macros */}
        <TouchableOpacity 
          style={dailyScreenStyles.macrosCard}
          onPress={() => onTabChange('perfil')}
          activeOpacity={0.7}
        >
          <MacroProgressBars
            proteinProgress={Math.min((totalProtein / proteinGoal) * 100, 100)}
            fatProgress={Math.min((totalFat / fatGoal) * 100, 100)}
            carbsProgress={Math.min((totalCarbs / carbsGoal) * 100, 100)}
            proteinValue={totalProtein}
            fatValue={totalFat}
            carbsValue={totalCarbs}
            proteinGoal={proteinGoal}
            fatGoal={fatGoal}
            carbsGoal={carbsGoal}
            textColor="#2c3e50"
          />
        </TouchableOpacity>

        {/* Banner Ad debajo de la sección de Macros */}
        <BannerAdComponent 
          style={{ marginHorizontal: 16, marginTop: 8 }}
        />

        {/* Sección de Comidas y Agua lado a lado */}
        <View style={dailyScreenStyles.splitSectionContainer}>
          <View style={dailyScreenStyles.splitSectionLeft}>
            <CollapsibleMealsSection
              isExpanded={isMealTypesExpanded}
              onToggle={() => setIsMealTypesExpanded(!isMealTypesExpanded)}
              onMealTypeSelect={handleMealTypeSelect}
              onMealClick={handleMealItemClick}
              onDeleteMeal={deleteMeal}
              meals={meals}
              selectedDate={selectedDate}
              nutritionGoals={nutritionGoals}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
            />
          </View>
          <View style={dailyScreenStyles.splitSectionRight}>
            <WaterSection
              waterGoal={waterGoal}
              waterConsumed={waterConsumed}
              onAddWater={addWaterGlass}
              onRemoveWater={removeWaterGlass}
              onUpdateGoal={updateWaterGoal}
              onOpenGoalPicker={() => setShowWaterGoalPicker(true)}
            />
          </View>
        </View>

        {/* Sección de Seguimiento de Progreso */}
        <ProgressTracking
          onPress={() => onTabChange('perfil')}
          onChartPress={() => {
            if (onProgressPress) {
              onProgressPress();
            }
          }}
          onCaloriesBurnedChange={handleCaloriesBurnedChange}
          selectedDate={selectedDate}
          healthSummary={healthSummary}
          onHealthSync={performHealthSync}
          isHealthSyncing={isHealthSyncing}
        />

        {/* Sección de Historial de Comidas */}
        <MealHistory
          historyItems={getRecentMeals(12)}
          onMealPress={handleHistoryMealPress}
          onDeleteMeal={handleDeleteHistoryMeal}
        />
        
        {/* Espacio adicional para scroll */}
        <View style={{ height: 150 }} />
      </ScrollView>

      {/* Modal de selección de tipo de comida */}
      <MealTypeSelector
        visible={showMealTypeSelector}
        onClose={() => setShowMealTypeSelector(false)}
        onMealTypeSelect={handleMealTypeSelect}
      />

      {/* Modal de selección de objetivo de agua */}
      <WaterGoalPicker
        visible={showWaterGoalPicker}
        onClose={() => setShowWaterGoalPicker(false)}
        onConfirm={updateWaterGoal}
        currentGoal={waterGoal}
      />

      {/* Pantalla de búsqueda de comida */}
      {showFoodSearch && (
        <FoodSearchScreen
          visible={showFoodSearch}
          onClose={closeFoodSearch}
          onFoodSelect={handleFoodSelect}
          selectedMealType={selectedMealType}
          currentMeals={meals.map(meal => ({
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
          }))}
          onBarcodeScan={openBarcodeScanner}
          onAIScan={openFoodScanner}
        />
      )}

      {/* Escáner de código de barras */}
      {showBarcodeScanner && (
        <BarcodeScanner
          visible={showBarcodeScanner}
          onClose={closeBarcodeScanner}
          onBarcodeScanned={handleBarcodeScanned}
        />
      )}

      {/* Escáner de comida con IA */}
      {showFoodScanner && (
        <FoodScanner
          visible={showFoodScanner}
          onClose={closeFoodScanner}
          onFoodDetected={handleFoodDetected}
        />
      )}

      {/* Modal de resultado de escaneo de código de barras */}
      {showBarcodeResult && (
        <FoodResultModal
          visible={showBarcodeResult}
          onClose={closeBarcodeResult}
          product={scannedProduct}
          foodAnalysis={scannedFood}
          onConfirm={handleBarcodeProductConfirm}
          isLoading={isLoadingBarcode || scanLoading}
        />
      )}

      {/* Modal de análisis de comida con IA */}
      {showFoodAnalysis && scannedFood && (
        <FoodAnalysisModal
          visible={showFoodAnalysis}
          onClose={closeFoodAnalysis}
          foodAnalysis={scannedFood}
          onConfirm={handleFoodAnalysisConfirm}
        />
      )}

      {/* Modal de cantidad para edición de alimentos de base de datos */}
      <QuantityModal
        visible={showQuantityModal}
        onClose={handleQuantityModalClose}
        onConfirm={handleQuantityConfirm}
        food={selectedFoodForEdit}
        initialQuantity={initialQuantity}
        mode={editingMeal ? 'edit' : 'add'}
        currentMeals={meals
          .filter(meal => !editingMeal || meal.id !== editingMeal.id)
          .map(meal => ({
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
          }))}
      />

      {/* Bottom Navigation */}
      {/* Banner Ad */}
      <BannerAd style={dailyScreenStyles.bannerAd} />

      <BottomNavigation 
        activeTab="diario" 
        onTabChange={onTabChange}
        onAddPress={handleAddButtonPress}
        onProgressPress={() => {
          if (onProgressPress) {
            onProgressPress();
          }
        }}
        nutritionGoals={nutritionGoals}
        consumed={{
          calories: totalCalories,
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat,
        }}
      />

      {/* La pantalla de ProgressTracking ahora se maneja globalmente en App.tsx */}
    </LinearGradient>
  );
}

// Los estilos ahora están en dailyScreenStyles importado