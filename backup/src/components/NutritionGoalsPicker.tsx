import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../constants/colors';
import { CommonStyles } from '../constants/styles';
import { calculateNutritionGoals, validateCustomGoals, getCalorieRecommendations } from '../lib/nutritionCalculator';
import { UserProfile } from '../lib/userProfile';

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isCustom: boolean;
}

interface Props {
  profile: UserProfile;
  onGoalsChange: (goals: NutritionGoals) => void;
  currentGoal?: 'lose_weight' | 'gain_weight' | 'maintain_weight';
  currentWeightGoalAmount?: number;
}

export default function NutritionGoalsPicker({ profile, onGoalsChange, currentGoal, currentWeightGoalAmount }: Props) {
  const [useCustomGoals, setUseCustomGoals] = useState(false);
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Calcular objetivos automáticos con valores actuales
  const getCurrentAutoGoals = () => {
    const currentProfile = {
      ...profile,
      goal: currentGoal || profile.goal,
      weightGoalAmount: currentWeightGoalAmount !== undefined ? currentWeightGoalAmount : profile.weightGoalAmount
    };
    return calculateNutritionGoals(currentProfile);
  };

  const autoGoals = getCurrentAutoGoals();
  const recommendations = getCalorieRecommendations(profile);

  useEffect(() => {
    // Cargar objetivos personalizados si existen
    if (profile.customNutritionGoals) {
      setUseCustomGoals(true);
      setCustomCalories(profile.customNutritionGoals.calories.toString());
      setCustomProtein(profile.customNutritionGoals.protein.toString());
      setCustomCarbs(profile.customNutritionGoals.carbs.toString());
      setCustomFat(profile.customNutritionGoals.fat.toString());
    } else {
      // Usar objetivos automáticos por defecto
      onGoalsChange(autoGoals);
    }
  }, [profile]);

  // Recalcular automáticamente cuando cambien el objetivo o la cantidad
  useEffect(() => {
    if (!useCustomGoals) {
      const updatedGoals = getCurrentAutoGoals();
      onGoalsChange(updatedGoals);
    }
  }, [currentGoal, currentWeightGoalAmount, useCustomGoals]);

  const handleToggleCustomGoals = () => {
    const newUseCustom = !useCustomGoals;
    setUseCustomGoals(newUseCustom);
    
    if (newUseCustom) {
      // Al activar objetivos personalizados, usar valores automáticos como base
      setCustomCalories(autoGoals.calories.toString());
      setCustomProtein(autoGoals.protein.toString());
      setCustomCarbs(autoGoals.carbs.toString());
      setCustomFat(autoGoals.fat.toString());
    } else {
      // Al desactivar, usar objetivos automáticos
      onGoalsChange(autoGoals);
    }
  };

  const handleCustomGoalsChange = () => {
    const goals = {
      calories: parseInt(customCalories) || 0,
      protein: parseInt(customProtein) || 0,
      carbs: parseInt(customCarbs) || 0,
      fat: parseInt(customFat) || 0,
      isCustom: true,
    };

    const validation = validateCustomGoals(goals);
    
    if (!validation.isValid) {
      Alert.alert('Datos inválidos', validation.errors.join('\n'));
      return;
    }

    onGoalsChange(goals);
  };

  const resetToAutoGoals = () => {
    setCustomCalories(autoGoals.calories.toString());
    setCustomProtein(autoGoals.protein.toString());
    setCustomCarbs(autoGoals.carbs.toString());
    setCustomFat(autoGoals.fat.toString());
    onGoalsChange(autoGoals);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Objetivos Nutricionales Diarios</Text>
      
      {/* Toggle para objetivos personalizados */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !useCustomGoals && styles.toggleButtonActive]}
          onPress={() => setUseCustomGoals(false)}
        >
          <Text style={[styles.toggleText, !useCustomGoals && styles.toggleTextActive]}>
            🧮 Automático
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.toggleButton, useCustomGoals && styles.toggleButtonActive]}
          onPress={() => setUseCustomGoals(true)}
        >
          <Text style={[styles.toggleText, useCustomGoals && styles.toggleTextActive]}>
            ⚙️ Personalizar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Objetivos automáticos */}
      {!useCustomGoals && (
        <View style={styles.autoGoalsContainer}>
          <View style={styles.goalsCard}>
            <Text style={styles.goalsTitle}>Objetivos Calculados</Text>
            <Text style={styles.goalsSubtitle}>
              Basados en tu perfil: {profile.name}, {profile.age} años, {profile.weight}kg, {profile.height}cm
            </Text>
            
            <View style={styles.goalsGrid}>
              <View style={styles.goalItem}>
                <Text style={styles.goalValue}>{autoGoals.calories}</Text>
                <Text style={styles.goalLabel}>Calorías</Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalValue}>{autoGoals.protein}g</Text>
                <Text style={styles.goalLabel}>Proteína</Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalValue}>{autoGoals.carbs}g</Text>
                <Text style={styles.goalLabel}>Carbohidratos</Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalValue}>{autoGoals.fat}g</Text>
                <Text style={styles.goalLabel}>Grasas</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.recommendationsButton}
              onPress={() => setShowRecommendations(!showRecommendations)}
            >
              <Text style={styles.recommendationsButtonText}>
                {showRecommendations ? 'Ocultar' : 'Ver'} recomendaciones
              </Text>
            </TouchableOpacity>

            {showRecommendations && (
              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>Recomendaciones</Text>
                <Text style={styles.recommendationsText}>
                  • Calorías de mantenimiento: {recommendations.maintenance} cal
                </Text>
                <Text style={styles.recommendationsText}>
                  • Objetivo actual: {recommendations.current} cal
                </Text>
                <Text style={styles.recommendationsText}>
                  • Cambio semanal: {recommendations.weeklyChange}kg
                </Text>
                <Text style={styles.recommendationsDescription}>
                  {recommendations.recommendation}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Objetivos personalizados */}
      {useCustomGoals && (
        <View style={styles.customGoalsContainer}>
          <View style={styles.goalsCard}>
            <Text style={styles.goalsTitle}>Configuración Personalizada</Text>
            <Text style={styles.goalsSubtitle}>
              Define tus propios objetivos nutricionales
            </Text>

            <View style={styles.inputRow}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Calorías</Text>
                <TextInput
                  value={customCalories}
                  onChangeText={setCustomCalories}
                  placeholder="2000"
                  keyboardType="numeric"
                  style={[styles.input]}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Proteína (g)</Text>
                <TextInput
                  value={customProtein}
                  onChangeText={setCustomProtein}
                  placeholder="150"
                  keyboardType="numeric"
                  style={[styles.input]}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Carbohidratos (g)</Text>
                <TextInput
                  value={customCarbs}
                  onChangeText={setCustomCarbs}
                  placeholder="250"
                  keyboardType="numeric"
                  style={[styles.input]}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Grasas (g)</Text>
                <TextInput
                  value={customFat}
                  onChangeText={setCustomFat}
                  placeholder="67"
                  keyboardType="numeric"
                  style={[styles.input]}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.buttonSecondary, styles.button]}
                onPress={resetToAutoGoals}
              >
                <Text style={styles.buttonTextSecondary}>
                  Usar automático
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.buttonPrimary, styles.button]}
                onPress={handleCustomGoalsChange}
              >
                <Text style={styles.buttonText}>
                  Aplicar cambios
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = {
  container: {
    marginBottom: 24,
  },
  
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1f2937',
    marginBottom: 16,
  },
  
  toggleContainer: {
    flexDirection: 'row' as const,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  
  toggleButtonActive: {
    backgroundColor: '#DC143C',
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  toggleText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1f2937',
  },
  
  toggleTextActive: {
    color: '#ffffff',
  },
  
  autoGoalsContainer: {
    // Estilos para objetivos automáticos
  },
  
  customGoalsContainer: {
    // Estilos para objetivos personalizados
  },
  
  goalsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 0,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  goalsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1f2937',
    marginBottom: 4,
  },
  
  goalsSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 16,
  },
  
  goalsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  
  goalItem: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center' as const,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  goalValue: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#1f2937',
    marginBottom: 2,
  },
  
  goalLabel: {
    fontSize: 10,
    color: '#374151',
    textAlign: 'center' as const,
    fontWeight: '600' as const,
  },
  
  recommendationsButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignSelf: 'flex-start' as const,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  recommendationsButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  
  recommendationsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  
  recommendationsText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  
  recommendationsDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic' as const,
    marginTop: 8,
    lineHeight: 18,
  },
  
  inputRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  halfInput: {
    width: '48%',
  },
  
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1f2937',
    marginBottom: 8,
  },
  
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  buttonRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  
  buttonPrimary: {
    backgroundColor: '#DC143C',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#DC143C',
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  buttonSecondary: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  buttonTextSecondary: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
  },
};
