import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/colors';
import LoseWeightPicker from '../LoseWeightPicker';
import GainWeightPicker from '../GainWeightPicker';
import NutritionGoalsPicker from '../NutritionGoalsPicker';

interface GoalsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: GoalsData) => void;
  initialData?: GoalsData;
  loading?: boolean;
  biometricData?: {
    age: number;
    height: number;
    weight: number;
    gender: string;
    activityLevel: string;
  };
}

export interface GoalsData {
  goal: 'lose_weight' | 'gain_weight' | 'maintain_weight';
  weightGoalAmount: number;
  nutritionGoals?: any;
}

const GoalsModal: React.FC<GoalsModalProps> = ({
  visible,
  onClose,
  onSave,
  initialData,
  loading = false,
  biometricData,
}) => {
  const [goal, setGoal] = useState<'lose_weight' | 'gain_weight' | 'maintain_weight'>('lose_weight');
  const [weightGoalAmount, setWeightGoalAmount] = useState(0.5);
  const [nutritionGoals, setNutritionGoals] = useState<any>(null);
  const [useCustomGoals, setUseCustomGoals] = useState(false);

  useEffect(() => {
    if (initialData) {
      setGoal(initialData.goal);
      setWeightGoalAmount(initialData.weightGoalAmount);
      setNutritionGoals(initialData.nutritionGoals);
      
      // Si hay objetivos nutricionales personalizados, activar el modo personalizado
      if (initialData.nutritionGoals && initialData.nutritionGoals.isCustom) {
        setUseCustomGoals(true);
      }
    }
  }, [initialData]);

  const handleNutritionGoalsChange = useCallback((goals: any) => {
    setNutritionGoals(goals);
  }, []);

  // Mapear nivel de actividad del frontend al backend
  const mapActivityLevel = (level: string) => {
    const activityMap: { [key: string]: string } = {
      'sedentary': 'sedentario',
      'light': 'ligero',
      'moderate': 'moderado',
      'active': 'intenso',
      'very_active': 'intenso'
    };
    return activityMap[level] || 'moderado';
  };

  const handleSave = () => {
    const data: GoalsData = {
      goal,
      weightGoalAmount,
      nutritionGoals,
    };
    onSave(data);
  };

  const handleCancel = () => {
    Alert.alert(
      'Descartar Cambios',
      '¿Estás seguro de que quieres descartar los cambios?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí', style: 'destructive', onPress: onClose },
      ]
    );
  };

  const goalsOptions = [
    { key: 'lose_weight', label: 'Perder peso', emoji: '🔥', color: '#e74c3c' },
    { key: 'gain_weight', label: 'Ganar peso', emoji: '💪', color: '#3498db' },
    { key: 'maintain_weight', label: 'Mantener peso', emoji: '⚖️', color: '#2ecc71' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Metas y Objetivos</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveButton, loading && styles.disabledButton]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            Define tus objetivos de salud y fitness
          </Text>

          {/* Objetivo principal */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Objetivo principal</Text>
            <View style={styles.goalsGrid}>
              {goalsOptions.map((goalOption) => (
                <TouchableOpacity
                  key={goalOption.key}
                  style={[
                    styles.goalCard,
                    goal === goalOption.key && styles.goalCardActive
                  ]}
                  onPress={() => setGoal(goalOption.key as any)}
                >
                  <Text style={styles.goalEmoji}>{goalOption.emoji}</Text>
                  <Text style={[
                    styles.goalText,
                    goal === goalOption.key && styles.goalTextActive
                  ]}>
                    {goalOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Cantidad de peso objetivo */}
          {goal === 'lose_weight' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cantidad a perder (kg/semana)</Text>
              <View style={styles.pickerWrapper}>
                <LoseWeightPicker
                  value={weightGoalAmount}
                  onValueChange={setWeightGoalAmount}
                />
              </View>
            </View>
          )}

          {goal === 'gain_weight' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cantidad a ganar (kg/semana)</Text>
              <View style={styles.pickerWrapper}>
                <GainWeightPicker
                  value={weightGoalAmount}
                  onValueChange={setWeightGoalAmount}
                />
              </View>
            </View>
          )}

          {/* Objetivos Nutricionales */}
          {biometricData && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Objetivos nutricionales</Text>
              <View style={styles.pickerWrapper}>
                <NutritionGoalsPicker
                  profile={{
                    id: 'temp',
                    name: 'Usuario',
                    age: biometricData.age,
                    height: biometricData.height,
                    weight: biometricData.weight,
                    gender: biometricData.gender === 'male' ? 'masculino' : 'femenino',
                    activityLevel: mapActivityLevel(biometricData.activityLevel),
                    goal,
                    weightGoalAmount,
                    createdAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                  }}
                  onGoalsChange={handleNutritionGoalsChange}
                  currentGoal={goal}
                  currentWeightGoalAmount={weightGoalAmount}
                  initialCustomGoals={nutritionGoals}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disabledButton: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalCard: {
    width: '31%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '20',
  },
  goalEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  goalText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  goalTextActive: {
    color: Colors.primary,
  },
  pickerWrapper: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
});

export default GoalsModal;
