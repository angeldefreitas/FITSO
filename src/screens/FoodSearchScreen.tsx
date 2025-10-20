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
import foodService from '../services/foodService';
import QuantityModal from '../components/QuantityModal';
import ColoredMacros from '../components/ColoredMacros';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Nuevo componente extraído
import CreateFoodModal from '../components/modals/CreateFoodModal';

// Nuevos estilos extraídos
import { foodSearchScreenStyles } from '../styles/screens/FoodSearchScreenStyles';

interface FoodSearchScreenProps {
  visible: boolean;
  onClose: () => void;
  onFoodSelect: (food: FoodItem, quantity: number) => void;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFoods, setFilteredFoods] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [serverFoods, setServerFoods] = useState<FoodItem[]>([]);
  
  // Forzar re-render cuando cambie el estado premium
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [isPremium, dailyScansUsed]);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | '' | 'Creado' | 'Todos'>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<FoodSubcategory | ''>('');
  const [availableSubcategories, setAvailableSubcategories] = useState<FoodSubcategory[]>([]);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [showCreateFoodModal, setShowCreateFoodModal] = useState(false);
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);

  // Cargar comidas personalizadas desde AsyncStorage
  useEffect(() => {
    const loadCustomFoods = async () => {
      try {
        const storageKey = `@fitso_custom_foods_${user?.id || 'default'}`;
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          const parsedFoods = JSON.parse(stored);
          setCustomFoods(parsedFoods);
          console.log('✅ Comidas personalizadas cargadas:', parsedFoods.length);
        }
      } catch (error) {
        console.error('❌ Error cargando comidas personalizadas:', error);
        setCustomFoods([]);
      }
    };
    loadCustomFoods();
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

  // Cargar alimentos aleatorios cuando se abra la pantalla
  useEffect(() => {
    const loadInitialFoods = async () => {
      if (visible && searchQuery.trim().length < 2 && !selectedCategory) {
        console.log('🎲 Cargando alimentos aleatorios iniciales...');
        setIsSearching(true);
        try {
          const response = await foodService.getRandomFoods(undefined, 30);
          console.log('📡 Alimentos aleatorios cargados:', response.foods.length);
          const serverResults = response.foods.map(food => ({
            id: food.id,
            name: food.name,
            description: food.description || '',
            calories: food.calories_per_100g,
            protein: food.protein_per_100g,
            carbs: food.carbs_per_100g,
            fat: food.fat_per_100g,
            fiber: food.fiber_per_100g || 0,
            sugar: food.sugar_per_100g || 0,
            sodium: food.sodium_per_100g || 0,
            category: (food.category || 'otros') as FoodCategory,
            subcategory: (food.subcategory || 'otros') as FoodSubcategory,
            tags: food.tags || [],
            brand: food.brand || '',
            servingSize: '100g',
            barcode: !!food.barcode,
            dataSource: 'local' as const,
            isCustom: false
          }));
          setServerFoods(serverResults);
        } catch (error) {
          console.error('❌ Error cargando alimentos aleatorios:', error);
          setServerFoods([]);
        } finally {
          setIsSearching(false);
        }
      }
    };
    loadInitialFoods();
  }, [visible, selectedCategory]);

  // Buscar en el servidor cuando cambie la query
  useEffect(() => {
    const searchServerFoods = async () => {
      if (searchQuery.trim().length >= 2) {
        console.log('🔍 Buscando en servidor:', searchQuery.trim());
        console.log('👤 Usuario autenticado:', !!user);
        setIsSearching(true);
        try {
          const response = await foodService.searchFoods(searchQuery.trim(), 20);
          console.log('📡 Respuesta del servidor:', response);
          const serverResults = response.foods.map(food => ({
            id: food.id,
            name: food.name,
            description: food.description || '',
            calories: food.calories_per_100g,
            protein: food.protein_per_100g,
            carbs: food.carbs_per_100g,
            fat: food.fat_per_100g,
            fiber: food.fiber_per_100g || 0,
            sugar: food.sugar_per_100g || 0,
            sodium: food.sodium_per_100g || 0,
            category: (food.category || 'otros') as FoodCategory,
            subcategory: (food.subcategory || 'otros') as FoodSubcategory,
            tags: food.tags || [],
            brand: food.brand || '',
            servingSize: '100g',
            barcode: !!food.barcode,
            dataSource: 'local' as const,
            isCustom: false
          }));
          setServerFoods(serverResults);
        } catch (error) {
          console.error('❌ Error buscando alimentos en servidor:', error);
          console.error('❌ Detalles del error:', error.message);
          setServerFoods([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setServerFoods([]);
      }
    };

    searchServerFoods();
  }, [searchQuery]);

  useEffect(() => {
    filterFoods();
  }, [searchQuery, selectedCategory, selectedSubcategory, customFoods, serverFoods]);

  // Cargar alimentos por categoría cuando se seleccione una
  useEffect(() => {
    const loadFoodsByCategory = async () => {
      if (selectedCategory && selectedCategory !== 'Creado' && selectedCategory !== 'Todos' && searchQuery.trim().length < 2) {
        console.log('🏷️ Cargando alimentos por categoría:', selectedCategory);
        setIsSearching(true);
        try {
          const response = await foodService.getRandomFoods(selectedCategory, 30);
          console.log('📡 Alimentos de categoría cargados:', response.foods.length);
          const serverResults = response.foods.map(food => ({
            id: food.id,
            name: food.name,
            description: food.description || '',
            calories: food.calories_per_100g,
            protein: food.protein_per_100g,
            carbs: food.carbs_per_100g,
            fat: food.fat_per_100g,
            fiber: food.fiber_per_100g || 0,
            sugar: food.sugar_per_100g || 0,
            sodium: food.sodium_per_100g || 0,
            category: (food.category || 'otros') as FoodCategory,
            subcategory: (food.subcategory || 'otros') as FoodSubcategory,
            tags: food.tags || [],
            brand: food.brand || '',
            servingSize: '100g',
            barcode: !!food.barcode,
            dataSource: 'local' as const,
            isCustom: false
          }));
          setServerFoods(serverResults);
        } catch (error) {
          console.error('❌ Error cargando alimentos por categoría:', error);
          setServerFoods([]);
        } finally {
          setIsSearching(false);
        }
      } else if (selectedCategory === 'Todos' || selectedCategory === '') {
        // Si se selecciona "Todos" o se limpia, cargar aleatorios
        const loadRandomFoods = async () => {
          console.log('🎲 Recargando alimentos aleatorios...');
          setIsSearching(true);
          try {
            const response = await foodService.getRandomFoods(undefined, 30);
            const serverResults = response.foods.map(food => ({
              id: food.id,
              name: food.name,
              description: food.description || '',
              calories: food.calories_per_100g,
              protein: food.protein_per_100g,
              carbs: food.carbs_per_100g,
              fat: food.fat_per_100g,
              fiber: food.fiber_per_100g || 0,
              sugar: food.sugar_per_100g || 0,
              sodium: food.sodium_per_100g || 0,
              category: (food.category || 'otros') as FoodCategory,
              subcategory: (food.subcategory || 'otros') as FoodSubcategory,
              tags: food.tags || [],
              brand: food.brand || '',
              servingSize: '100g',
              barcode: !!food.barcode,
              dataSource: 'local' as const,
              isCustom: false
            }));
            setServerFoods(serverResults);
          } catch (error) {
            console.error('❌ Error recargando alimentos aleatorios:', error);
            setServerFoods([]);
          } finally {
            setIsSearching(false);
          }
        };
        loadRandomFoods();
      }
    };
    loadFoodsByCategory();
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'Creado' && selectedCategory !== 'Todos') {
      // Obtener subcategorías únicas de la categoría seleccionada desde serverFoods
      const subcategories = [...new Set(
        serverFoods
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
  }, [selectedCategory, serverFoods]);

  const filterFoods = () => {
    try {
      let results: FoodItem[] = [];

      // Si hay una búsqueda activa, usar resultados del servidor
      if (searchQuery.trim().length >= 2) {
        results = [...serverFoods];
        
        // Filtrar por categoría si está seleccionada
        if (selectedCategory && selectedCategory !== 'Todos') {
          results = results.filter(food => food.category === selectedCategory);
        }
        
        // Filtrar por subcategoría si está seleccionada
        if (selectedSubcategory) {
          results = results.filter(food => food.subcategory === selectedSubcategory);
        }
      } else {
        // Sin búsqueda activa, mostrar comidas personalizadas o todas
        if (selectedCategory === 'Creado') {
          results = [...customFoods];
        } else {
          // Mostrar mensaje de "Escribe para buscar" o comidas personalizadas
          results = [...customFoods];
        }
      }

      setFilteredFoods(results);
      console.log(`🔍 Filtrados ${results.length} alimentos`);
    } catch (error) {
      console.error('❌ Error filtrando alimentos:', error);
      setFilteredFoods([]);
    }
  };

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    setShowQuantityModal(true);
  };

  const handleQuantityConfirm = (food: FoodItem, quantity: number) => {
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

  // Categorías reales de los datos
  const categories = ['Todos', 'Creado', 'frutas', 'verduras', 'carnes', 'pescados', 'lacteos', 'cereales', 'legumbres', 'frutos-secos', 'aceites', 'bebidas', 'snacks', 'condimentos', 'mariscos'];

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
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
          {item.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {item.subcategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
        {category === 'Todos' ? t('food.all') : category === 'Creado' ? t('food.addCustom') : category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
        {subcategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
            data={categories}
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
            {isSearching ? t('food.searching') : `${filteredFoods.length} ${t('food.search')}`}
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
