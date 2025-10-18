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
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { Colors } from '../constants/colors';
import { CommonStyles } from '../constants/styles';
import BannerAd from '../components/BannerAd';
import { foodService } from '../services/foodService';
import { FoodItem, FoodCategory, FoodSubcategory } from '../types/food';
import QuantityModal from '../components/QuantityModal';
import ColoredMacros from '../components/ColoredMacros';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Nuevo componente extraído
import CreateFoodModal from '../components/modals/CreateFoodModal';

// Nuevo hook extraído
import { useCustomFoods } from '../hooks/custom/useCustomFoods';

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
}

export default function FoodSearchScreen({ 
  visible, 
  onClose, 
  onFoodSelect, 
  selectedMealType,
  currentMeals = [],
  onBarcodeScan,
  onAIScan,
}: FoodSearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFoods, setFilteredFoods] = useState<FoodItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | '' | 'Creado'>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<FoodSubcategory | ''>('');
  const [availableSubcategories, setAvailableSubcategories] = useState<FoodSubcategory[]>([]);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [showCreateFoodModal, setShowCreateFoodModal] = useState(false);

  // Nuevo hook para gestionar comidas personalizadas
  const { customFoods, saveCustomFood, deleteCustomFood } = useCustomFoods();

  useEffect(() => {
    filterFoods();
  }, [searchQuery, selectedCategory, selectedSubcategory, customFoods]);

  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'Creado') {
      const subcategories = foodService.getSubcategoriesByCategory(selectedCategory as FoodCategory);
      setAvailableSubcategories(subcategories);
      setSelectedSubcategory(''); // Reset subcategory when category changes
    } else {
      setAvailableSubcategories([]);
      setSelectedSubcategory('');
    }
  }, [selectedCategory]);

  const filterFoods = () => {
    // Si se selecciona "Creado", mostrar solo alimentos personalizados
    if (selectedCategory === 'Creado') {
      let customResults = customFoods;
      if (searchQuery.trim()) {
        customResults = customFoods.filter(food => 
          food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (food.description && food.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      if (selectedSubcategory) {
        customResults = customResults.filter(food => food.subcategory === selectedSubcategory);
      }
      setFilteredFoods(customResults);
      return;
    }

    // Lógica normal para otras categorías
    const filters = {
      searchQuery: searchQuery.trim() || undefined,
      category: selectedCategory || undefined,
      subcategory: selectedSubcategory || undefined,
    };

    const databaseResults = foodService.searchFoods(filters);
    
    // Filtrar comidas personalizadas
    let customResults = customFoods;
    if (searchQuery.trim()) {
      customResults = customFoods.filter(food => 
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (food.description && food.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (selectedCategory) {
      customResults = customResults.filter(food => food.category === selectedCategory);
    }
    if (selectedSubcategory) {
      customResults = customResults.filter(food => food.subcategory === selectedSubcategory);
    }

    // Combinar resultados de base de datos y comidas personalizadas
    const allResults = [...databaseResults, ...customResults];
    setFilteredFoods(allResults);
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
    await saveCustomFood(food);
    setShowCreateFoodModal(false);
    Alert.alert('¡Perfecto!', 'Comida personalizada creada exitosamente');
  };

  const categories = ['Todos', 'Creado', ...foodService.getCategories()];

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
                  'Eliminar Comida Personalizada',
                  `¿Estás seguro de que quieres eliminar "${item.name}"?`,
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { 
                      text: 'Eliminar', 
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
            <Text style={foodSearchScreenStyles.customLabel}> • Creado por ti</Text>
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
        {category === 'Todos' ? 'Todos' : category === 'Creado' ? 'Creado' : category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
          <Text style={foodSearchScreenStyles.title}>Buscar Comida</Text>
        </View>

        <View style={foodSearchScreenStyles.searchContainer}>
          <View style={foodSearchScreenStyles.searchInputContainer}>
            <TextInput
              style={foodSearchScreenStyles.searchInput}
              placeholder="Buscar alimento o crear uno nuevo"
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
              <Text style={foodSearchScreenStyles.scanButtonSubtext}>Escanear Código</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={foodSearchScreenStyles.scanButtonVertical}
              onPress={onAIScan}
            >
              <LottieView
                source={require('../../assets/Food-Carousel.json')}
                autoPlay
                loop
                style={foodSearchScreenStyles.scanButtonMainAnimation}
              />
              <Text style={foodSearchScreenStyles.scanButtonSubtext}>Escanear con IA</Text>
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
            {filteredFoods.length} alimentos encontrados
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
