import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/colors';
import { Food } from '../services/foodService';
import foodService from '../services/foodService';

interface FoodSearchBackendProps {
  visible: boolean;
  onClose: () => void;
  onFoodSelect: (food: Food) => void;
  selectedMealType?: string;
  currentMeals?: any[];
  onBarcodeScan?: () => void;
  onAIScan?: () => void;
}

const FoodSearchBackend: React.FC<FoodSearchBackendProps> = ({
  visible,
  onClose,
  onFoodSelect,
  selectedMealType,
  currentMeals = [],
  onBarcodeScan,
  onAIScan,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar alimentos
  const searchFoods = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await foodService.searchFoods(query.trim());
      setSearchResults(response.foods);
    } catch (err: any) {
      console.error('Error buscando alimentos:', err);
      setError(err.message || 'Error buscando alimentos');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchFoods(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchFoods]);

  // Limpiar búsqueda al cerrar
  useEffect(() => {
    if (!visible) {
      setSearchQuery('');
      setSearchResults([]);
      setError(null);
    }
  }, [visible]);

  const handleFoodSelect = (food: Food) => {
    onFoodSelect(food);
    onClose();
  };

  const renderFoodItem = ({ item }: { item: Food }) => (
    <TouchableOpacity
      style={styles.foodItem}
      onPress={() => handleFoodSelect(item)}
    >
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        {item.brand && (
          <Text style={styles.foodBrand}>{item.brand}</Text>
        )}
        <Text style={styles.foodCalories}>
          {item.calories_per_100g} cal/100g
        </Text>
      </View>
      <View style={styles.foodMacros}>
        <Text style={styles.macroText}>
          {t('food.proteinShort')}: {item.protein_per_100g}g
        </Text>
        <Text style={styles.macroText}>
          {t('food.carbsShort')}: {item.carbs_per_100g}g
        </Text>
        <Text style={styles.macroText}>
          {t('food.fatShort')}: {item.fat_per_100g}g
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.emptyText}>Buscando alimentos...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => searchFoods(searchQuery)}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (searchQuery.length > 0 && searchResults.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No se encontraron alimentos para "{searchQuery}"
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>
          Escribe al menos 2 caracteres para buscar
        </Text>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Buscar Alimento</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar alimento..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
        {loading && (
          <ActivityIndicator size="small" color={Colors.primary} />
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onBarcodeScan}
        >
          <Text style={styles.actionButtonText}>📷 Código de Barras</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAIScan}
        >
          <Text style={styles.actionButtonText}>🤖 IA Scan</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={renderFoodItem}
        ListEmptyComponent={renderEmptyState}
        style={styles.resultsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: Colors.white,
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  resultsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  foodItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
  },
  foodBrand: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  foodCalories: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '500',
  },
  foodMacros: {
    alignItems: 'flex-end',
  },
  macroText: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
});

export default FoodSearchBackend;
