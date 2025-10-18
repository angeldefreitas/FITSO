import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';

interface CollapsibleSectionProps {
  title: string;
  icon: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  summaryInfo?: string; // Información resumida para mostrar cuando está colapsado
  userData?: {
    name: string;
    age: number;
    weightKg: number;
    heightCm: number;
    gender: string;
    activityLevel: string;
  };
  goalsData?: {
    goal: string;
    weightGoalAmount: number;
    nutritionGoals: any;
  };
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  icon, 
  isExpanded, 
  onToggle, 
  children,
  summaryInfo,
  userData,
  goalsData
}) => {
  const [animatedHeight] = useState(new Animated.Value(1));
  const [animatedOpacity] = useState(new Animated.Value(1));
  const [animatedContentHeight] = useState(new Animated.Value(0));
  const [animatedContentOpacity] = useState(new Animated.Value(0));
  const [animatedHeaderPosition] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isExpanded) {
      // Fase 1: Expandir la sección verticalmente y mover header hacia arriba
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.timing(animatedHeaderPosition, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start(() => {
        // Fase 2: Desplegar el contenido después de que termine la primera animación
        Animated.parallel([
          Animated.timing(animatedContentHeight, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(animatedContentOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start();
      });
    } else {
      // Colapsar: primero ocultar contenido, luego reducir altura y centrar header
      Animated.parallel([
        Animated.timing(animatedContentHeight, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(animatedContentOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start(() => {
        Animated.parallel([
          Animated.timing(animatedHeight, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(animatedHeaderPosition, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start();
      });
    }
  }, [isExpanded]);

  return (
    <Animated.View 
      style={[
        styles.section,
        {
          maxHeight: animatedHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [200, 1200],
          }),
        }
      ]}
    >
      <View style={styles.header}>
        {/* Título y botón de editar en la misma línea superior */}
        <View style={styles.titleRow}>
          <View style={styles.titleWithIcon}>
            <Text style={styles.titleIcon}>{icon}</Text>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={onToggle}
          >
            <Text style={styles.editButtonIcon}>⚙️</Text>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* Contenido principal - información del usuario cuando colapsado */}
        <Animated.View 
          style={[
            styles.headerTouchable,
            {
              marginTop: animatedHeaderPosition.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            }
          ]}
        >
          {!isExpanded && userData && (
            // Vista colapsada compacta: toda la información en chips consistentes
            <View style={styles.compactUserInfo}>
              {/* Toda la información en chips para consistencia visual */}
              <View style={styles.physicalChips}>
                <View style={styles.nameChip}>
                  <Text style={styles.chipIcon}>👤</Text>
                  <Text style={styles.chipText}>
                    {userData.name || 'Usuario'}
                  </Text>
                </View>
                <View style={styles.infoChip}>
                  <Text style={styles.chipIcon}>🎂</Text>
                  <Text style={styles.chipText}>{userData.age} años</Text>
                </View>
                <View style={styles.infoChip}>
                  <Text style={styles.chipIcon}>⚖️</Text>
                  <Text style={styles.chipText}>{userData.weightKg}kg</Text>
                </View>
                <View style={styles.infoChip}>
                  <Text style={styles.chipIcon}>📏</Text>
                  <Text style={styles.chipText}>{userData.heightCm}cm</Text>
                </View>
                <View style={styles.infoChip}>
                  <Text style={styles.chipIcon}>
                    {userData.gender === 'masculino' ? '♂️' : userData.gender === 'femenino' ? '♀️' : '❓'}
                  </Text>
                  <Text style={styles.chipText}>
                    {userData.gender === 'masculino' ? 'Hombre' : userData.gender === 'femenino' ? 'Mujer' : 'No especificado'}
                  </Text>
                </View>
                <View style={styles.infoChip}>
                  <Text style={styles.chipIcon}>
                    {userData.activityLevel === 'sedentario' ? '🛋️' :
                     userData.activityLevel === 'ligero' ? '🚶' :
                     userData.activityLevel === 'moderado' ? '🏃' :
                     userData.activityLevel === 'intenso' ? '💪' : '❓'}
                  </Text>
                  <Text style={styles.chipText}>
                    {userData.activityLevel === 'sedentario' ? 'Sedentario' :
                     userData.activityLevel === 'ligero' ? 'Ligero' :
                     userData.activityLevel === 'moderado' ? 'Moderado' :
                     userData.activityLevel === 'intenso' ? 'Intenso' : 'No especificado'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {!isExpanded && goalsData && (
            // Vista colapsada compacta: información de objetivos en formato horizontal
            <View style={styles.compactGoalsInfo}>
              {/* Objetivo principal en una línea */}
              <View style={styles.goalInfoRow}>
                <View style={styles.goalChip}>
                  <Text style={styles.chipIcon}>
                    {goalsData.goal === 'lose_weight' ? '🔥' :
                     goalsData.goal === 'gain_weight' ? '💪' :
                     goalsData.goal === 'maintain_weight' ? '⚖️' : '🎯'}
                  </Text>
                  <Text style={styles.chipText}>
                    {goalsData.goal === 'lose_weight' ? 'Perder Peso' :
                     goalsData.goal === 'gain_weight' ? 'Ganar Peso' :
                     goalsData.goal === 'maintain_weight' ? 'Mantener Peso' : 'Objetivo'}
                  </Text>
                </View>
                <View style={styles.goalChip}>
                  <Text style={styles.chipIcon}>📊</Text>
                  <Text style={styles.chipText}>
                    {goalsData.goal === 'lose_weight' ? `${goalsData.weightGoalAmount} kg/sem` :
                     goalsData.goal === 'gain_weight' ? `${goalsData.weightGoalAmount} kg/sem` :
                     goalsData.goal === 'maintain_weight' ? 'Peso actual' : 'No especificado'}
                  </Text>
                </View>
              </View>
              
              {/* Objetivos nutricionales compactos */}
              {goalsData.nutritionGoals && (
                <View style={styles.nutritionChips}>
                  <View style={styles.nutritionChip}>
                    <Text style={styles.chipIcon}>🍎</Text>
                    <Text style={styles.chipText}>
                      {Math.round(goalsData.nutritionGoals.calories)} cal
                    </Text>
                  </View>
                  <View style={styles.nutritionChip}>
                    <Text style={styles.chipIcon}>🥩</Text>
                    <Text style={styles.chipText}>
                      {Math.round(goalsData.nutritionGoals.protein)}g P
                    </Text>
                  </View>
                  <View style={styles.nutritionChip}>
                    <Text style={styles.chipIcon}>🍞</Text>
                    <Text style={styles.chipText}>
                      {Math.round(goalsData.nutritionGoals.carbs)}g C
                    </Text>
                  </View>
                  <View style={styles.nutritionChip}>
                    <Text style={styles.chipIcon}>🥑</Text>
                    <Text style={styles.chipText}>
                      {Math.round(goalsData.nutritionGoals.fat)}g G
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </Animated.View>
      </View>
      
      <Animated.View 
        style={[
          styles.content,
          {
            maxHeight: animatedContentHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1000],
            }),
            opacity: animatedContentOpacity,
          }
        ]}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
};

const styles = {
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 200,
    overflow: 'hidden' as const,
  },
  
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    minHeight: 120,
  },
  
  headerTouchable: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  headerContent: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 10,
  },
  
  headerIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1f2937',
    textAlign: 'left' as const,
  },
  
  closeButton: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    fontSize: 20,
    color: '#6b7280',
    fontWeight: '600' as const,
  },
  
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    overflow: 'hidden' as const,
  },

  // Estilos para la fila del título
  titleRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 0,
  },

  titleWithIcon: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },

  titleIcon: {
    fontSize: 20,
    marginRight: 8,
  },

  // Estilos para la vista colapsada compacta
  compactUserInfo: {
    paddingHorizontal: 0,
    paddingVertical: 8,
    marginTop: -12,
  },

  compactGoalsInfo: {
    paddingHorizontal: 0,
    paddingVertical: 8,
    marginTop: -12,
  },

  // Chip especial para el nombre (más destacado)
  nameChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },

  // Chips de información física
  physicalChips: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 6,
  },

  // Chips de objetivos
  goalInfoRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 6,
    marginBottom: 8,
  },

  nutritionChips: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 6,
  },

  // Estilos para todos los chips
  infoChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  goalChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },

  nutritionChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },

  chipIcon: {
    fontSize: 12,
    marginRight: 4,
  },

  chipText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500' as const,
  },

  summaryInfo: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  summaryText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500' as const,
    textAlign: 'center' as const,
  },

  // Estilos para el botón de editar
  editButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },

  editButtonIcon: {
    fontSize: 12,
    marginRight: 4,
  },

  editButtonText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600' as const,
  },
};

export default CollapsibleSection;
