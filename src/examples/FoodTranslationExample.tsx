import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
import { useFoodTranslation } from '../hooks/useFoodTranslation';
import { fitsoFoodDatabase } from '../database/FitsoDatabase';
import { TranslatedFoodItem } from '../services/foodTranslationService';

/**
 * Ejemplo de cómo usar el sistema de traducción de alimentos
 * Este componente muestra cómo buscar y mostrar alimentos en el idioma actual
 */
export const FoodTranslationExample: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TranslatedFoodItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const {
    searchFoods,
    getFoodsByCategory,
    getAllCategories,
    currentLanguage
  } = useFoodTranslation();

  const categories = getAllCategories(fitsoFoodDatabase);

  // Buscar alimentos cuando cambie la consulta o la categoría
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const results = searchFoods(fitsoFoodDatabase, searchQuery, selectedCategory);
      setSearchResults(results);
    } else if (selectedCategory) {
      const results = getFoodsByCategory(fitsoFoodDatabase, selectedCategory);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedCategory, searchFoods, getFoodsByCategory]);

  const renderFoodItem = ({ item }: { item: TranslatedFoodItem }) => (
    <View style={styles.foodItem}>
      <Text style={styles.foodName}>{item.name}</Text>
      {item.description && (
        <Text style={styles.foodDescription}>{item.description}</Text>
      )}
      <Text style={styles.foodCalories}>
        {item.calories} cal por {item.servingSize}
      </Text>
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <Text key={index} style={styles.tag}>
              {tag}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Búsqueda de Alimentos - {currentLanguage.toUpperCase()}
      </Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar alimentos..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.categoriesContainer}>
        <Text style={styles.categoriesTitle}>Categorías:</Text>
        <View style={styles.categoriesList}>
          <Text
            style={[
              styles.categoryButton,
              selectedCategory === '' && styles.selectedCategory
            ]}
            onPress={() => setSelectedCategory('')}
          >
            Todas
          </Text>
          {categories.map((category) => (
            <Text
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategory
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              {category}
            </Text>
          ))}
        </View>
      </View>

      <FlatList
        data={searchResults}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id}
        style={styles.resultsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
    color: 'white',
    borderColor: '#007AFF',
  },
  resultsList: {
    flex: 1,
  },
  foodItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  foodName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  foodDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  foodCalories: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: '#666',
  },
});

export default FoodTranslationExample;
