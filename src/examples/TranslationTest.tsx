import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useFoodTranslation } from '../hooks/useFoodTranslation';
import { fitsoFoodDatabase } from '../database/FitsoDatabase';

/**
 * Componente de prueba para verificar el sistema de traducción
 * Este componente muestra cómo los alimentos se traducen automáticamente
 */
export const TranslationTest: React.FC = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const { searchFoods, translateFoods, currentLanguage: translationLanguage } = useFoodTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allFoods, setAllFoods] = useState<any[]>([]);

  // Cargar todos los alimentos traducidos
  useEffect(() => {
    const translatedFoods = translateFoods(fitsoFoodDatabase);
    setAllFoods(translatedFoods);
  }, [translateFoods]);

  // Buscar alimentos cuando cambie la consulta
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const results = searchFoods(fitsoFoodDatabase, searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchFoods]);

  const handleLanguageChange = (lang: 'es' | 'en' | 'pt') => {
    changeLanguage(lang);
  };

  const renderFoodItem = (food: any, index: number) => (
    <View key={food.id || index} style={styles.foodItem}>
      <Text style={styles.foodName}>{food.name}</Text>
      {food.description && (
        <Text style={styles.foodDescription}>{food.description}</Text>
      )}
      {food.tags && food.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {food.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
            <Text key={tagIndex} style={styles.tag}>#{tag}</Text>
          ))}
        </View>
      )}
      <Text style={styles.foodCalories}>{food.calories} cal</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Prueba de Traducción de Alimentos</Text>
      
      <View style={styles.languageSection}>
        <Text style={styles.sectionTitle}>Idioma Actual: {currentLanguage.toUpperCase()}</Text>
        <View style={styles.languageButtons}>
          <Button title="ES" onPress={() => handleLanguageChange('es')} />
          <Button title="EN" onPress={() => handleLanguageChange('en')} />
          <Button title="PT" onPress={() => handleLanguageChange('pt')} />
        </View>
      </View>

      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Búsqueda (en {currentLanguage}):</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={`Buscar en ${currentLanguage}...`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.resultsSection}>
        <Text style={styles.sectionTitle}>
          {searchQuery.trim().length >= 2 
            ? `Resultados de búsqueda (${searchResults.length})`
            : `Todos los alimentos (${allFoods.length})`
          }
        </Text>
        
        {(searchQuery.trim().length >= 2 ? searchResults : allFoods)
          .slice(0, 10)
          .map((food, index) => renderFoodItem(food, index))}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Información del Sistema:</Text>
        <Text style={styles.infoText}>• Idioma de traducción: {translationLanguage}</Text>
        <Text style={styles.infoText}>• Total de alimentos: {fitsoFoodDatabase.length}</Text>
        <Text style={styles.infoText}>• Alimentos con traducciones: {fitsoFoodDatabase.filter(f => f.nameTranslations).length}</Text>
      </View>
    </ScrollView>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  languageSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  searchSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  resultsSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  foodItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  foodDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  foodCalories: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  infoSection: {
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
});

export default TranslationTest;
