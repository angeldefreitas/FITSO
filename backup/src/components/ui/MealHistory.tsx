import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { MealHistoryItem } from '../../hooks/custom/useMealHistory';

interface MealHistoryProps {
  historyItems: MealHistoryItem[];
  onMealPress: (meal: MealHistoryItem) => void;
  onDeleteMeal: (mealId: string) => void;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 2 columnas con padding

export default function MealHistory({ historyItems, onMealPress, onDeleteMeal }: MealHistoryProps) {
  const renderMealCard = ({ item }: { item: MealHistoryItem }) => {
    const handleMealPress = () => {
      onMealPress(item);
    };

    const handleDeletePress = () => {
      Alert.alert(
        'Eliminar del historial',
        `¿Estás seguro de que quieres eliminar "${item.name}" del historial?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Eliminar', 
            style: 'destructive',
            onPress: () => onDeleteMeal(item.id)
          }
        ]
      );
    };

    // Verificar si hay imagen disponible (solo para IA y Scanner)
    const hasImage = (item.source === 'ai' || item.source === 'barcode') && 
                    (item.sourceData?.image?.uri || 
                     item.sourceData?.image?.thumbnail || 
                     item.sourceData?.image);

    const imageUri = item.sourceData?.image?.uri || 
                    item.sourceData?.image?.thumbnail || 
                    item.sourceData?.image;

    const CardContent = () => (
      <>
        {/* Botón de eliminar */}
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDeletePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>

        {/* Overlay de contraste para mejorar legibilidad - solo cuando hay imagen */}
        {hasImage && <View style={styles.contrastOverlay} />}

        {/* Nombre de la comida */}
        <Text style={hasImage ? styles.mealNameWithImage : styles.mealName} numberOfLines={2}>
          {item.name}
        </Text>

        {/* Información nutricional */}
        <View style={styles.nutritionInfo}>
          <Text style={hasImage ? styles.caloriesTextWithImage : styles.caloriesText}>{item.calories} kcal</Text>
          <View style={styles.macrosRow}>
            <Text style={[hasImage ? styles.macroTextWithImage : styles.macroText, { color: '#FF6B35' }]}>P: {item.protein}g</Text>
            <Text style={[hasImage ? styles.macroTextWithImage : styles.macroText, { color: '#2196F3' }]}>C: {item.carbs}g</Text>
            <Text style={[hasImage ? styles.macroTextWithImage : styles.macroText, { color: '#4CAF50' }]}>G: {item.fat}g</Text>
          </View>
        </View>

        {/* Indicador de veces usado */}
        {item.timesUsed > 1 && (
          <View style={styles.usageIndicator}>
            <Text style={styles.usageText}>{item.timesUsed}x</Text>
          </View>
        )}
      </>
    );

    return (
      <TouchableOpacity 
        style={styles.mealCard}
        onPress={handleMealPress}
        activeOpacity={0.7}
      >
        {hasImage ? (
          <ImageBackground
            source={{ uri: imageUri }}
            style={styles.cardContainerWithImage}
            imageStyle={styles.cardImage}
            resizeMode="cover"
          >
            <CardContent />
          </ImageBackground>
        ) : (
          <View style={styles.cardContainerSolid}>
            <CardContent />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (historyItems.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Historial</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No hay comidas en el historial
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Las comidas que agregues aparecerán aquí
          </Text>
        </View>
      </View>
    );
  }

  // Crear filas de 2 elementos para el ScrollView
  const createRows = (items: MealHistoryItem[]) => {
    const rows = [];
    for (let i = 0; i < items.length; i += 2) {
      rows.push(items.slice(i, i + 2));
    }
    return rows;
  };

  const rows = createRows(historyItems);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Historial</Text>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        nestedScrollEnabled={true}
      >
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((item) => (
              <React.Fragment key={item.id}>
                {renderMealCard({ item })}
              </React.Fragment>
            ))}
            {/* Añadir espacio vacío si la fila no está completa */}
            {row.length === 1 && <View key={`empty-${rowIndex}`} style={styles.emptyCard} />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 10,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mealCard: {
    width: cardWidth,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardContainerSolid: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    position: 'relative',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContainerWithImage: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    position: 'relative',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardImage: {
    borderRadius: 12,
  },
  contrastOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderWidth: 1,
    borderColor: '#6c757d',
  },
  deleteButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  mealName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 8,
    marginBottom: 8,
    flex: 1,
  },
  mealNameWithImage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 8,
    marginBottom: 8,
    flex: 1,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  nutritionInfo: {
    marginBottom: 4,
  },
  caloriesText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6c757d',
    marginBottom: 4,
  },
  caloriesTextWithImage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6c757d',
    marginBottom: 4,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroText: {
    fontSize: 10,
    fontWeight: '500',
  },
  macroTextWithImage: {
    fontSize: 10,
    fontWeight: '500',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  usageIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(220, 20, 60, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  usageText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    opacity: 0.7,
  },
  emptyCard: {
    width: cardWidth,
    height: 140,
  },
});

