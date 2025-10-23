import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useFoodTranslation } from '../hooks/useFoodTranslation';
import { frutasFrescas } from '../database/FitsoDatabase/frutas/frutasFrescas';

/**
 * Componente simple para probar las traducciones
 */
export const SimpleTranslationTest: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const { translateFoods } = useFoodTranslation();
  const [translatedFoods, setTranslatedFoods] = useState<any[]>([]);

  useEffect(() => {
    console.log('🧪 SimpleTranslationTest - Idioma actual:', currentLanguage);
    const translated = translateFoods(frutasFrescas.slice(0, 3)); // Solo las primeras 3 frutas
    setTranslatedFoods(translated);
    console.log('🧪 Alimentos traducidos:', translated.map(f => ({ 
      original: frutasFrescas.find(orig => orig.id === f.id)?.name, 
      translated: f.name 
    })));
  }, [currentLanguage, translateFoods]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prueba de Traducción Simple</Text>
      <Text style={styles.subtitle}>Idioma: {currentLanguage}</Text>
      
      {translatedFoods.map((food, index) => (
        <View key={food.id} style={styles.foodItem}>
          <Text style={styles.foodName}>{food.name}</Text>
          {food.description && (
            <Text style={styles.foodDescription}>{food.description}</Text>
          )}
          {food.tags && food.tags.length > 0 && (
            <Text style={styles.foodTags}>
              Tags: {food.tags.join(', ')}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  foodItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  foodName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  foodDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  foodTags: {
    fontSize: 12,
    color: '#007AFF',
  },
});

export default SimpleTranslationTest;
