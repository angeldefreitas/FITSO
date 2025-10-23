import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  Modal,
  StyleSheet,
  Dimensions 
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { Colors } from '../constants/colors';
import { CommonStyles } from '../constants/styles';
import BannerAd from '../components/BannerAd';
import { useAuth } from '../contexts/AuthContext';
import { usePremium } from '../contexts/PremiumContext';
import { FoodItem, FoodCategory, FoodSubcategory } from '../types/food';
import QuantityModal from '../components/QuantityModal';
import ColoredMacros from '../components/ColoredMacros';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalFoodService } from '../services/localFoodService';
import { useFoodTranslation } from '../hooks/useFoodTranslation';
import { TranslatedFoodItem } from '../services/foodTranslationService';
import { useCategoryTranslations } from '../utils/categoryTranslations';

// Nuevo componente extraído
import CreateFoodModal from '../components/modals/CreateFoodModal';

// Nuevos estilos extraídos
import { foodSearchScreenStyles } from '../styles/screens/FoodSearchScreenStyles';

interface FoodSearchScreenProps {
  visible: boolean;
  onClose: () => void;
  onFoodSelect: (food: TranslatedFoodItem, quantity: number) => void;
  selectedMealType: string;
  currentMeals?: Array<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  onBarcodeScan?: () => void;
  onAIScan?: () => void;
  onPremiumPress?: () => void;
}

export default function FoodSearchScreen({ 
  visible, 
  onClose, 
  onFoodSelect, 
  selectedMealType,
  currentMeals = [],
  onBarcodeScan,
  onAIScan,
  onPremiumPress,
}: FoodSearchScreenProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isPremium, dailyScansUsed, canUseAIScan } = usePremium();
  const { searchFoods: searchFoodsWithTranslation, translateFoods, currentLanguage } = useFoodTranslation();
  const { translateCategory, translateSubcategory, translateCategoryAndSubcategory } = useCategoryTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFoods, setFilteredFoods] = useState<TranslatedFoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debug: Log del idioma actual
  console.log(`🔍 FoodSearchScreen - Idioma actual: ${currentLanguage}`);
  
  // Forzar re-render cuando cambie el estado premium
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [isPremium, dailyScansUsed]);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | '' | 'Creado' | 'Todos'>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<FoodSubcategory | ''>('');
  const [availableSubcategories, setAvailableSubcategories] = useState<FoodSubcategory[]>([]);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState<TranslatedFoodItem | null>(null);
  const [showCreateFoodModal, setShowCreateFoodModal] = useState(false);
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [localFoods, setLocalFoods] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar comidas personalizadas y base de datos local
  useEffect(() => {
    const loadFoods = async () => {
      try {
        setIsLoading(true);
        
        // Cargar comidas personalizadas
        const storageKey = `@fitso_custom_foods_${user?.id || 'default'}`;
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          const parsedFoods = JSON.parse(stored);
          setCustomFoods(parsedFoods);
          console.log('✅ Comidas personalizadas cargadas:', parsedFoods.length);
        }

        // Verificar si la base de datos necesita actualización
        const needsUpdate = await LocalFoodService.needsUpdate();
        let localFoodsData;
        if (needsUpdate) {
          console.log('🔄 Base de datos necesita actualización, forzando recarga...');
          localFoodsData = await LocalFoodService.forceReloadDatabase();
        } else {
          // Inicializar y cargar base de datos local
          localFoodsData = await LocalFoodService.initializeLocalDatabase();
        }
        
        setLocalFoods(localFoodsData);
        console.log('✅ Base de datos local cargada:', localFoodsData.length);
        console.log('🔍 Primeros 5 alimentos:', localFoodsData.slice(0, 5).map(f => ({ name: f.name, category: f.category })));
        
      } catch (error) {
        console.error('❌ Error cargando alimentos:', error);
        setCustomFoods([]);
        setLocalFoods([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadFoods();
  }, []);

  // Guardar comidas personalizadas
  const saveCustomFood = async (food: FoodItem) => {
    try {
      const newCustomFoods = [...customFoods, food];
      setCustomFoods(newCustomFoods);
      const storageKey = `@fitso_custom_foods_${user?.id || 'default'}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(newCustomFoods));
      console.log('✅ Comida personalizada guardada:', food.name);
    } catch (error) {
      console.error('❌ Error guardando comida personalizada:', error);
      Alert.alert('Error', 'No se pudo guardar la comida personalizada');
    }
  };

  // Eliminar comidas personalizadas
  const deleteCustomFood = async (foodId: string) => {
    try {
      const newCustomFoods = customFoods.filter(food => food.id !== foodId);
      setCustomFoods(newCustomFoods);
      const storageKey = `@fitso_custom_foods_${user?.id || 'default'}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(newCustomFoods));
      console.log('✅ Comida personalizada eliminada:', foodId);
    } catch (error) {
      console.error('❌ Error eliminando comida personalizada:', error);
      Alert.alert('Error', 'No se pudo eliminar la comida personalizada');
    }
  };

  // Ya no cargamos alimentos del servidor

  // Ya no buscamos en el servidor

  useEffect(() => {
    filterFoods();
  }, [searchQuery, selectedCategory, selectedSubcategory, customFoods, localFoods]);

  // Cargar subcategorías cuando cambie la categoría
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'Creado' && selectedCategory !== 'Todos') {
      // Combinar alimentos locales y personalizados para obtener subcategorías
      const allFoods = [...localFoods, ...customFoods];
      const subcategories = [...new Set(
        allFoods
          .filter(food => food.category === selectedCategory)
          .map(food => food.subcategory)
          .filter(sub => sub && sub.trim() !== '')
      )] as FoodSubcategory[];
      
      setAvailableSubcategories(subcategories);
      if (subcategories.length > 0 && selectedSubcategory && !subcategories.includes(selectedSubcategory)) {
        setSelectedSubcategory('');
      }
    } else {
      setAvailableSubcategories([]);
      setSelectedSubcategory('');
    }
  }, [selectedCategory, customFoods, localFoods]);

  const filterFoods = () => {
    try {
      let results: TranslatedFoodItem[] = [];

      // Combinar alimentos locales y personalizados
      const allFoods = [...localFoods, ...customFoods];

      if (selectedCategory === 'Creado') {
        // Solo mostrar comidas personalizadas con traducción
        results = translateFoods(customFoods);
      } else if (selectedCategory === 'Todos' || selectedCategory === '') {
        // Mostrar todos los alimentos con traducción
        if (searchQuery.trim().length >= 2) {
          results = searchFoodsWithTranslation(allFoods, searchQuery);
        } else {
          // Sin búsqueda, solo traducir todos los alimentos
          results = translateFoods(allFoods);
        }
      } else {
        // Filtrar por categoría seleccionada con traducción
        if (searchQuery.trim().length >= 2) {
          results = searchFoodsWithTranslation(allFoods, searchQuery, selectedCategory);
        } else {
          // Sin búsqueda, filtrar por categoría y traducir
          const categoryFoods = allFoods.filter(food => food.category === selectedCategory);
          results = translateFoods(categoryFoods);
        }
      }

      // Filtrar por subcategoría si está seleccionada
      if (selectedSubcategory) {
        results = results.filter(food => food.subcategory === selectedSubcategory);
      }

      setFilteredFoods(results);
      console.log(`🔍 Filtrados ${results.length} alimentos (${localFoods.length} locales + ${customFoods.length} personalizados) en idioma ${currentLanguage}`);
      console.log(`📊 Categorías disponibles: ${[...new Set(allFoods.map(f => f.category))].join(', ')}`);
      console.log(`📊 Subcategorías de ${selectedCategory}: ${[...new Set(allFoods.filter(f => f.category === selectedCategory).map(f => f.subcategory))].join(', ')}`);
    } catch (error) {
      console.error('❌ Error filtrando alimentos:', error);
      setFilteredFoods([]);
    }
  };

  const handleFoodSelect = (food: TranslatedFoodItem) => {
    setSelectedFood(food);
    setShowQuantityModal(true);
  };

  const handleQuantityConfirm = (food: TranslatedFoodItem, quantity: number) => {
    onFoodSelect(food, quantity);
    setShowQuantityModal(false);
    setSelectedFood(null);
    onClose();
  };

  const handleQuantityModalClose = () => {
    setShowQuantityModal(false);
    setSelectedFood(null);
  };

  const onCreateFood = () => {
    setShowCreateFoodModal(true);
  };

  const handleSaveCustomFood = async (food: FoodItem) => {
    try {
      // Validar datos requeridos
      if (!food.name || !food.calories) {
        Alert.alert('Error', 'Nombre y calorías son requeridos');
        return;
      }

      const customFood: FoodItem = {
        id: food.id || `custom_${Date.now()}`,
        name: food.name.trim(),
        description: food.description?.trim() || '',
        calories: Number(food.calories) || 0,
        protein: Number(food.protein) || 0,
        carbs: Number(food.carbs) || 0,
        fat: Number(food.fat) || 0,
        fiber: Number(food.fiber) || 0,
        sugar: Number(food.sugar) || 0,
        sodium: Number(food.sodium) || 0,
        servingSize: food.servingSize || '100g',
        tags: food.tags || [],
        category: 'otros' as FoodCategory,
        subcategory: 'otros' as FoodSubcategory,
        isCustom: true
      };

      await saveCustomFood(customFood);
      setShowCreateFoodModal(false);
      Alert.alert('¡Perfecto!', 'Comida personalizada creada exitosamente');
    } catch (error) {
      console.error('❌ Error guardando comida personalizada:', error);
      Alert.alert('Error', 'No se pudo crear la comida personalizada');
    }
  };

  const handleAIScanPress = () => {
    // Siempre abrir el escáner, la validación se hace al tomar la foto
    onAIScan?.();
  };

  // Categorías dinámicas basadas en los datos disponibles
  const [availableCategories, setAvailableCategories] = useState<string[]>(['Todos', 'Creado']);

  // Cargar categorías disponibles cuando se carguen los alimentos
  useEffect(() => {
    if (localFoods.length > 0) {
      const localCategories = [...new Set(localFoods.map(food => food.category))];
      const allCategories = ['Todos', 'Creado', ...localCategories];
      setAvailableCategories(allCategories);
    }
  }, [localFoods]);

  const renderFoodItem = ({ item }: { item: TranslatedFoodItem }) => (
    <TouchableOpacity
      style={foodSearchScreenStyles.foodItem}
      onPress={() => handleFoodSelect(item)}
    >
      <View style={foodSearchScreenStyles.foodItemLeft}>
        <View style={foodSearchScreenStyles.foodNameRow}>
          <Text style={foodSearchScreenStyles.foodName}>{item.name}</Text>
          {item.isCustom && (
            <TouchableOpacity
              style={foodSearchScreenStyles.deleteCustomButton}
              onPress={(e) => {
                e.stopPropagation();
                Alert.alert(
                  t('alerts.deleteMeal'),
                  t('alerts.deleteMealMessage'),
                  [
                    { text: t('modals.cancel'), style: 'cancel' },
                    { 
                      text: t('modals.delete'), 
                      style: 'destructive',
                      onPress: () => deleteCustomFood(item.id)
                    }
                  ]
                );
              }}
            >
              <Text style={foodSearchScreenStyles.deleteCustomButtonText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
            <Text style={foodSearchScreenStyles.foodCategory}>
          {item.translatedCategory} • {item.translatedSubcategory}
              {item.isCustom && (
                <Text style={foodSearchScreenStyles.customLabel}> • {t('food.customCreatedByYou')}</Text>
              )}
        </Text>
        {item.description && (
          <Text style={foodSearchScreenStyles.foodDescription}>{item.description}</Text>
        )}
        {item.tags && item.tags.length > 0 && (
          <View style={foodSearchScreenStyles.foodTags}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <Text key={index} style={foodSearchScreenStyles.foodTag}>#{tag}</Text>
            ))}
          </View>
        )}
      </View>
      <View style={foodSearchScreenStyles.foodItemRight}>
        <Text style={foodSearchScreenStyles.foodCalories}>{item.calories} kcal</Text>
        <Text style={foodSearchScreenStyles.servingSize}>{item.servingSize}</Text>
        <ColoredMacros
          protein={item.protein}
          carbs={item.carbs}
          fat={item.fat}
          style={foodSearchScreenStyles.foodMacros}
          textStyle={foodSearchScreenStyles.macroText}
        />
      </View>
    </TouchableOpacity>
  );

  const renderCategoryButton = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        foodSearchScreenStyles.categoryButton,
        selectedCategory === category && foodSearchScreenStyles.categoryButtonSelected
      ]}
      onPress={() => {
        if (category === 'Todos') {
          setSelectedCategory('');
        } else if (category === 'Creado') {
          setSelectedCategory('Creado');
        } else {
          setSelectedCategory(category as FoodCategory);
        }
      }}
    >
      <Text style={[
        foodSearchScreenStyles.categoryButtonText,
        selectedCategory === category && foodSearchScreenStyles.categoryButtonTextSelected
      ]}>
        {translateCategory(category)}
      </Text>
    </TouchableOpacity>
  );

  const renderSubcategoryButton = (subcategory: FoodSubcategory) => (
    <TouchableOpacity
      key={subcategory}
      style={[
        foodSearchScreenStyles.subcategoryButton,
        selectedSubcategory === subcategory && foodSearchScreenStyles.subcategoryButtonSelected
      ]}
      onPress={() => setSelectedSubcategory(selectedSubcategory === subcategory ? '' : subcategory)}
    >
      <Text style={[
        foodSearchScreenStyles.subcategoryButtonText,
        selectedSubcategory === subcategory && foodSearchScreenStyles.subcategoryButtonTextSelected
      ]}>
        {translateSubcategory(subcategory)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={['#DC143C', '#2c2c2c', '#1a1a1a', '#000000']}
        locations={[0, 0.3, 0.7, 1]}
        style={foodSearchScreenStyles.container}
      >
        <View style={foodSearchScreenStyles.header}>
          <TouchableOpacity onPress={onClose} style={foodSearchScreenStyles.closeButton}>
            <Text style={foodSearchScreenStyles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={foodSearchScreenStyles.title}>{t('food.search')}</Text>
        </View>

        <View style={foodSearchScreenStyles.searchContainer}>
          <View style={foodSearchScreenStyles.searchInputContainer}>
            <TextInput
              style={foodSearchScreenStyles.searchInput}
              placeholder={t('food.searchPlaceholder')}
              placeholderTextColor="#6c757d"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={onCreateFood} style={foodSearchScreenStyles.createButtonInSearch}>
              <Text style={foodSearchScreenStyles.createButtonInSearchText}>+</Text>
            </TouchableOpacity>
          </View>
          
          {/* Botones de escaneo */}
          <View style={foodSearchScreenStyles.scanButtonsContainer}>
            <TouchableOpacity 
              style={foodSearchScreenStyles.scanButtonVertical}
              onPress={onBarcodeScan}
            >
              <LottieView
                source={require('../../assets/barcode-scan.json')}
                autoPlay
                loop
                style={foodSearchScreenStyles.scanButtonMainAnimation}
              />
              <Text style={foodSearchScreenStyles.scanButtonSubtext}>{t('food.scanBarcode')}</Text>
            </TouchableOpacity>
            
            {/* Botón de IA siempre igual */}
            <TouchableOpacity 
              style={foodSearchScreenStyles.scanButtonVertical}
              onPress={handleAIScanPress}
            >
              <View style={foodSearchScreenStyles.scanButtonContent}>
                <LottieView
                  source={require('../../assets/Food-Carousel.json')}
                  autoPlay
                  loop
                  style={foodSearchScreenStyles.scanButtonMainAnimation}
                />
                <Text style={foodSearchScreenStyles.scanButtonSubtext}>{t('food.scanPhoto')}</Text>
                
                {/* Icono premium en esquina izquierda para usuarios no premium */}
                {!isPremium && (
                  <TouchableOpacity 
                    style={foodSearchScreenStyles.premiumIconContainerLeft}
                    onPress={onPremiumPress}
                  >
                    <LottieView
                      source={require('../../assets/premiumbadge.json')}
                      autoPlay
                      loop
                      style={foodSearchScreenStyles.premiumIconLeft}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Banner Ad */}
          <BannerAd style={foodSearchScreenStyles.bannerAd} />
          
        </View>

        <View style={foodSearchScreenStyles.categoriesContainer}>
          <FlatList
            data={availableCategories}
            renderItem={({ item }) => renderCategoryButton(item)}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={foodSearchScreenStyles.categoriesList}
          />
        </View>

        {availableSubcategories.length > 0 && (
          <View style={foodSearchScreenStyles.subcategoriesContainer}>
            <FlatList
              data={availableSubcategories}
              renderItem={({ item }) => renderSubcategoryButton(item)}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={foodSearchScreenStyles.subcategoriesList}
            />
          </View>
        )}

        <View style={foodSearchScreenStyles.resultsContainer}>
          <Text style={foodSearchScreenStyles.resultsTitle}>
            {isLoading ? t('common.loading') :
             isSearching ? t('food.searching') : 
             filteredFoods.length === 0 ? 
             t('food.noResults') + '. ' + t('food.tryDifferentSearch') :
             `${filteredFoods.length} ${t('food.foodsFound')}`}
          </Text>
          <FlatList
            data={filteredFoods}
            renderItem={renderFoodItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={foodSearchScreenStyles.foodList}
          />
        </View>
      </LinearGradient>

      {/* Modal de cantidad */}
      <QuantityModal
        visible={showQuantityModal}
        onClose={handleQuantityModalClose}
        onConfirm={handleQuantityConfirm}
        food={selectedFood}
        currentMeals={currentMeals}
      />

      {/* Modal de crear comida personalizada */}
      <CreateFoodModal
        visible={showCreateFoodModal}
        onClose={() => setShowCreateFoodModal(false)}
        onSave={handleSaveCustomFood}
      />
    </Modal>
  );
}

// Los estilos ahora están en foodSearchScreenStyles importado
// El componente CreateFoodModal ahora está importado desde components/modals/CreateFoodModal
