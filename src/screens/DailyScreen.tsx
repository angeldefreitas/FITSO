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
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { usePremium } from '../contexts/PremiumContext';
import { useTranslation } from 'react-i18next';
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
// SyncStatus eliminado - todo funciona localmente
import ProgressTrackingScreen from './ProgressTrackingScreen';
import MealTypeSelector from '../components/modals/MealTypeSelector';
import WaterGoalPicker from '../components/modals/WaterGoalPicker';
import PremiumScreen from './PremiumScreen';

// Nuevos hooks extraídos
import { useMeals, Meal } from '../hooks/custom/useMeals';
import { useWaterTracking } from '../hooks/custom/useWaterTracking';
import { useDateNavigation } from '../hooks/custom/useDateNavigation';
import { useMealHistory, MealHistoryItem } from '../hooks/custom/useMealHistory';
// useSync eliminado - todo funciona localmente
// localMealService eliminado - todo funciona con useMeals

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
  const { user, profileData, getProfileData } = useAuth();
  const { profile } = useProfile();
  const { isPremium, canUseAIScan, recordAIScan, dailyScansUsed } = usePremium();
  const { t } = useTranslation();
  
  // Mapeo de tipos de comida a traducciones
  const getMealTypeTranslation = (mealType: string) => {
    const translations: { [key: string]: string } = {
      'Desayuno': t('daily.breakfast'),
      'Almuerzo': t('daily.lunch'),
      'Snacks': t('daily.snacks'),
      'Cena': t('daily.dinner')
    };
    return translations[mealType] || mealType;
  };
  
  // Estados locales
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
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
  const [lastGalleryImage, setLastGalleryImage] = useState<string | null>(null);
  
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
  const [showPremiumScreen, setShowPremiumScreen] = useState(false);
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
  const { meals, loading, addMeal, updateMeal, deleteMeal, getMealsByType, getMealTotals, getTotalNutrients } = useMeals(selectedDate, user?.id);
  const { waterGoal, waterConsumed, addWaterGlass, removeWaterGlass, updateWaterGoal } = useWaterTracking(selectedDate, user?.id);
  const { history, addToHistory, removeFromHistory, getRecentMeals } = useMealHistory(user?.id);
  // Sincronización eliminada - todo funciona localmente
  
  // Variables de salud eliminadas - ya no se usan
  const healthSummary = null;
  // healthSyncStatus eliminado
  const isHealthSyncing = false;
  const performHealthSync = () => Promise.resolve([]);


  // Cargar datos del perfil cuando el usuario esté autenticado
  useEffect(() => {
    if (user && !profileData && !loadingProfile) {
      console.log('🔄 Cargando datos del perfil para DailyScreen');
      setLoadingProfile(true);
      getProfileData().finally(() => {
        setLoadingProfile(false);
      });
    }
  }, [user, profileData, loadingProfile, getProfileData]);

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

  // Efecto para actualizar los objetivos nutricionales cuando cambien los datos del perfil
  useEffect(() => {
    // Priorizar el contexto de perfil para actualizaciones en tiempo real
    const currentProfile = profile || profileData;
    
    if (currentProfile) {
      // Usar objetivos personalizados si existen, sino calcular automáticamente
      if (profileData?.goalsData?.nutritionGoals && profileData.goalsData.nutritionGoals.isCustom) {
        setNutritionGoals({
          calories: profileData.goalsData.nutritionGoals.calories,
          protein: profileData.goalsData.nutritionGoals.protein,
          carbs: profileData.goalsData.nutritionGoals.carbs,
          fat: profileData.goalsData.nutritionGoals.fat,
          isCustom: true,
        });
      } else if (profile) {
        // Usar el perfil del contexto de perfil para cálculos automáticos
        const autoGoals = calculateNutritionGoals(profile);
        setNutritionGoals(autoGoals);
        console.log('🔄 Objetivos nutricionales actualizados desde contexto de perfil:', autoGoals);
      } else if (profileData?.biometricData) {
        // Fallback al contexto de autenticación si no hay perfil
        const tempProfile = {
          id: 'temp',
          name: 'Usuario',
          age: profileData.biometricData.age,
          height: profileData.biometricData.heightCm,
          weight: profileData.biometricData.weightKg,
          gender: profileData.biometricData.gender === 'male' ? 'masculino' as const : 'femenino' as const,
          activityLevel: profileData.biometricData.activityLevel === 'sedentary' ? 'sedentario' as const :
                        profileData.biometricData.activityLevel === 'light' ? 'ligero' as const :
                        profileData.biometricData.activityLevel === 'moderate' ? 'moderado' as const :
                        profileData.biometricData.activityLevel === 'active' ? 'intenso' as const : 'intenso' as const,
          goal: profileData.goalsData?.goal || 'lose_weight',
          weightGoalAmount: profileData.goalsData?.weightGoalAmount || 0.5,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        };
        
        const autoGoals = calculateNutritionGoals(tempProfile);
        setNutritionGoals(autoGoals);
        console.log('🔄 Objetivos nutricionales actualizados desde contexto de auth:', autoGoals);
      }
    }
  }, [profile, profileData]);

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

    try {
      const success = await addMeal(mealData);
      if (success) {
        // Agregar al historial usando el hook
        await addToHistory(mealData as Meal);
        
        if (editingMeal) {
          setEditingMeal(null);
        } else {
          // Limpiar formulario solo si no estamos editando
          setName('');
          setCalories('');
          setProtein('');
          setCarbs('');
          setFat('');
        }
      }
    } catch (error) {
      console.error('❌ Error agregando comida manual:', error);
      Alert.alert('Error', 'Error al agregar la comida');
    }
  }

  // La función deleteMeal ahora está en el hook useMeals

  // Las funciones de agua ahora están en el hook useWaterTracking

  // Estados para los totales de nutrientes
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFat, setTotalFat] = useState(0);

  // Calcular totales cuando cambien las comidas
  useEffect(() => {
    const totals = getTotalNutrients();
    console.log('📊 Calculando totales:', totals);
    setTotalCalories(totals.calories);
    setTotalProtein(totals.protein);
    setTotalCarbs(totals.carbs);
    setTotalFat(totals.fat);
  }, [meals, getTotalNutrients]);
  
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

  const handlePremiumPress = () => {
    if (!isPremium) {
      setShowPremiumScreen(true);
    }
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
      
      // Abrir galería directamente, la validación se hace después
      const images = await accessGallery(false, false, 'photo');
      
      if (images && images.length > 0) {
        const imageUri = images[0].path || images[0].uri;
        
        if (!imageUri) {
          console.log('❌ No se pudo obtener la URI de la imagen');
          Alert.alert('Error', 'No se pudo obtener la imagen seleccionada');
          return;
        }
        
        console.log('📸 Imagen seleccionada:', imageUri);
        
        // Validar límites antes de procesar la imagen
        const canUse = await canUseAIScan();
        if (!canUse) {
          Alert.alert(
            'Límite de Escaneos Alcanzado',
            'Has alcanzado el límite de 1 escaneo con IA por día. Suscríbete a Premium para escaneos ilimitados.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Ver Premium', onPress: () => setShowPremiumScreen(true) }
            ]
          );
          return;
        }
        
        // Guardar imagen para mostrar en el botón de galería
        setLastGalleryImage(imageUri);
        
        // Mostrar loading
        setIsLoadingBarcode(true);
        
        // Analizar imagen con Claude
        const foodAnalysis = await scanPicture(imageUri);
        
        if (foodAnalysis) {
          // Registrar uso de escaneo con IA
          await recordAIScan();
          
          setScannedFood(foodAnalysis);
          setShowFoodAnalysis(true);
          setShowFoodScanner(false); // Cerrar el escáner
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

      const success = await addMeal(mealData as Omit<Meal, 'id' | 'createdAt' | 'date'>);
      if (success) {
        // Agregar al historial usando el hook
        await addToHistory(mealData as Meal);
        console.log('✅ Comida agregada con mealType:', selectedMealType);
        
        if (editingMeal) {
          setEditingMeal(null);
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
      
      // Registrar uso de escaneo con IA
      await recordAIScan();
      
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

      const success = await addMeal(mealData as Omit<Meal, 'id' | 'createdAt' | 'date'>);
      if (success) {
        // Agregar al historial usando el hook
        await addToHistory(mealData as Meal);
        console.log('✅ Comida agregada con mealType:', selectedMealType);
        
        if (editingMeal) {
          setEditingMeal(null);
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
        source: 'database' as const, // Cambiar a database para usar la base de datos PostgreSQL
        sourceData: { 
          food: food, // Pasar el objeto food completo
          quantity: quantity
        },
      };

      console.log('🍽️ Agregando comida:', mealData);

      if (editingMeal) {
        // Modo edición
        const success = await updateMeal(editingMeal.id, mealData);
        if (success) {
          setEditingMeal(null);
          Alert.alert('¡Perfecto!', 'Comida actualizada correctamente');
        }
      } else {
        // Modo creación
        const success = await addMeal(mealData as Omit<Meal, 'id' | 'createdAt' | 'date'>);
        if (success) {
          // Agregar al historial usando el hook
          await addToHistory(mealData as Meal);
          console.log('✅ Comida agregada con mealType:', selectedMealType);
          
          // Mostrar alert solo si la operación fue exitosa
          Alert.alert('¡Perfecto!', 'Comida agregada correctamente');
        }
      }

      // Cerrar todos los modales con un pequeño delay
      setTimeout(() => {
        setShowFoodSearch(false);
        setSelectedMealType('');
      }, 100);

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
          // Agregar al historial usando el hook
          await addToHistory(mealData as Meal);

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

  // Funciones de sincronización eliminadas - todo funciona localmente

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
        <TouchableOpacity 
          style={dailyScreenStyles.appHeader}
          onPress={handlePremiumPress}
          activeOpacity={0.7}
        >
          <Text style={dailyScreenStyles.appTitle}>FITSO</Text>
          {!isPremium && (
            <LottieView
              source={require('../../assets/premiumicon.json')}
              autoPlay
              loop
              style={dailyScreenStyles.premiumBadge}
            />
          )}
        </TouchableOpacity>

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
            <Text style={dailyScreenStyles.caloriesConsumedLabel}>{t('daily.caloriesConsumed')}</Text>
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
              <Text style={dailyScreenStyles.caloriesRemainingLabel}>{t('daily.caloriesRemaining')}</Text>
            </CircularProgressBar>
          </View>
          
          <View style={dailyScreenStyles.caloriesRight}>
            <Text style={dailyScreenStyles.caloriesGoalNumber}>{calorieGoal}</Text>
            <Text style={dailyScreenStyles.caloriesGoalLabel}>{t('daily.caloriesGoal')}</Text>
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

        {/* Banner Ad debajo de la sección de Macros - Solo para usuarios no premium */}
        {!isPremium && (
          <BannerAdComponent 
            style={{ marginHorizontal: 16, marginTop: 8 }}
          />
        )}

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
        />

        {/* Sincronización eliminada - todo funciona localmente */}

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
          onPremiumPress={() => setShowPremiumScreen(true)}
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
          onGalleryPress={openImagePicker}
          lastGalleryImage={lastGalleryImage}
          onPremiumPress={() => setShowPremiumScreen(true)}
          canUseAIScan={canUseAIScan}
          recordAIScan={recordAIScan}
          isPremium={isPremium}
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
      {/* Banner Ad - Solo para usuarios no premium */}
      {!isPremium && <BannerAd style={dailyScreenStyles.bannerAd} />}

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

      {/* Modal de pantalla premium */}
      {showPremiumScreen && (
        <PremiumScreen
          onClose={() => setShowPremiumScreen(false)}
        />
      )}

      {/* La pantalla de ProgressTracking ahora se maneja globalmente en App.tsx */}
    </LinearGradient>
  );
}

// Los estilos ahora están en dailyScreenStyles importado