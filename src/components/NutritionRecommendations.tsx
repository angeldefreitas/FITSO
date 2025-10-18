import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Colors } from '../constants/colors';
import { CommonStyles } from '../constants/styles';
import { NutritionGoals, calculateNutritionProgress } from '../lib/nutritionCalculator';

interface Props {
  goals: NutritionGoals;
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export default function NutritionRecommendations({ goals, consumed }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const progress = calculateNutritionProgress(goals, consumed);
  
  // Función para manejar el toggle del componente
  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  
  // Generar recomendaciones basadas en el progreso
  const getRecommendations = () => {
    const recommendations = [];
    
    // Recomendación de calorías
    if (progress.calories.percentage < 50) {
      recommendations.push({
        type: 'calories',
        icon: '🍽️',
        title: 'Necesitas más calorías',
        message: `Te faltan ${progress.calories.remaining} calorías para alcanzar tu objetivo diario.`,
        color: Colors.warning,
      });
    } else if (progress.calories.percentage > 100) {
      recommendations.push({
        type: 'calories',
        icon: '⚠️',
        title: 'Has excedido las calorías',
        message: `Has consumido ${Math.abs(progress.calories.remaining)} calorías más de tu objetivo.`,
        color: Colors.error,
      });
    } else if (progress.calories.percentage >= 90) {
      recommendations.push({
        type: 'calories',
        icon: '🎯',
        title: '¡Excelente progreso!',
        message: `Solo te faltan ${progress.calories.remaining} calorías para alcanzar tu meta.`,
        color: Colors.success,
      });
    }
    
    // Recomendación de proteína
    if (progress.protein.percentage < 70) {
      recommendations.push({
        type: 'protein',
        icon: '🥩',
        title: 'Aumenta tu proteína',
        message: `Te faltan ${progress.protein.remaining}g de proteína. Considera agregar carne, pescado o legumbres.`,
        color: Colors.warning,
      });
    } else if (progress.protein.percentage >= 90) {
      recommendations.push({
        type: 'protein',
        icon: '💪',
        title: 'Proteína óptima',
        message: `¡Excelente! Has alcanzado ${Math.round(progress.protein.percentage)}% de tu objetivo de proteína.`,
        color: Colors.success,
      });
    }
    
    // Recomendación de carbohidratos
    if (progress.carbs.percentage < 50) {
      recommendations.push({
        type: 'carbs',
        icon: '🍞',
        title: 'Necesitas más carbohidratos',
        message: `Te faltan ${progress.carbs.remaining}g de carbohidratos. Agrega arroz, pasta o frutas.`,
        color: Colors.warning,
      });
    } else if (progress.carbs.percentage > 120) {
      recommendations.push({
        type: 'carbs',
        icon: '📉',
        title: 'Reduce los carbohidratos',
        message: `Has excedido tu objetivo de carbohidratos en ${Math.abs(progress.carbs.remaining)}g.`,
        color: Colors.error,
      });
    }
    
    // Recomendación de grasas
    if (progress.fat.percentage < 60) {
      recommendations.push({
        type: 'fat',
        icon: '🥑',
        title: 'Aumenta las grasas saludables',
        message: `Te faltan ${progress.fat.remaining}g de grasas. Agrega aguacate, nueces o aceite de oliva.`,
        color: Colors.warning,
      });
    } else if (progress.fat.percentage >= 90) {
      recommendations.push({
        type: 'fat',
        icon: '✨',
        title: 'Grasas equilibradas',
        message: `¡Perfecto! Has alcanzado ${Math.round(progress.fat.percentage)}% de tu objetivo de grasas.`,
        color: Colors.success,
      });
    }
    
    return recommendations;
  };
  
  const recommendations = getRecommendations();
  
  // Calcular la altura máxima del contenido desplegable
  const maxHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1000], // Ajusta este valor según el contenido
  });
  
  return (
    <View style={styles.container}>
      {/* Header clickeable */}
      <TouchableOpacity 
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconEmoji}>💡</Text>
          </View>
          <Text style={styles.headerTitle}>Recomendaciones del día</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerCount}>{recommendations.length}</Text>
          <Text style={[styles.chevron, { transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }]}>
            ▼
          </Text>
        </View>
      </TouchableOpacity>
      
      {/* Contenido desplegable */}
      <Animated.View style={[styles.expandableContent, { maxHeight }]}>
        {recommendations.length > 0 ? (
          <>
            {recommendations.map((rec, index) => (
              <View key={index} style={[styles.recommendationCard, { borderLeftColor: rec.color }]}>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationIcon}>{rec.icon}</Text>
                  <Text style={styles.recommendationTitle}>{rec.title}</Text>
                </View>
                <Text style={styles.recommendationMessage}>{rec.message}</Text>
              </View>
            ))}
            
          </>
        ) : (
          <View style={styles.noRecommendations}>
            <Text style={styles.noRecommendationsText}>🎉 ¡Excelente! Estás cumpliendo todos tus objetivos nutricionales.</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = {
  container: {
    backgroundColor: '#e3f2fd',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden' as const,
  },
  
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 16,
    backgroundColor: '#e3f2fd',
  },
  
  headerLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#bbdefb',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  
  headerIconEmoji: {
    fontSize: 20,
  },
  
  headerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#2c3e50',
    flex: 1,
  },
  
  headerRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  
  headerCount: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#1976d2',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  
  chevron: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '600' as const,
  },
  
  expandableContent: {
    overflow: 'hidden' as const,
  },
  
  noRecommendations: {
    padding: 20,
    alignItems: 'center' as const,
  },
  
  noRecommendationsText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center' as const,
    lineHeight: 24,
  },
  
  recommendationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  recommendationHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  
  recommendationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#2c3e50',
    flex: 1,
  },
  
  recommendationMessage: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  
};
