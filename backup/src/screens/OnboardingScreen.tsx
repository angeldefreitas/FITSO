import React, { useState } from 'react';
import { Alert, Text, TextInput, View, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { saveUserProfile, UserProfile } from '../lib/userProfile';
import { Colors } from '../constants/colors';
import { CommonStyles } from '../constants/styles';
import AgePicker from '../components/AgePicker';
import WeightPicker from '../components/WeightPicker';
import HeightPicker from '../components/HeightPicker';
import LoseWeightPicker from '../components/LoseWeightPicker';
import GainWeightPicker from '../components/GainWeightPicker';
import GenderPicker from '../components/GenderPicker';
import ActivityLevelPicker from '../components/ActivityLevelPicker';

type Props = { 
  onCompleted: (profile: UserProfile) => void;
};

export default function OnboardingScreen({ onCompleted }: Props) {
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [gender, setGender] = useState<'masculino' | 'femenino' | ''>('');
  const [activityLevel, setActivityLevel] = useState<'sedentario' | 'ligero' | 'moderado' | 'intenso' | ''>('');
  const [goal, setGoal] = useState<'lose_weight' | 'gain_weight' | 'maintain_weight'>('lose_weight');
  const [weightGoalAmount, setWeightGoalAmount] = useState(0.5);
  const [loading, setLoading] = useState(false);

  const goals = [
    { key: 'lose_weight', label: 'Perder peso', emoji: '🔥' },
    { key: 'gain_weight', label: 'Ganar peso', emoji: '💪' },
    { key: 'maintain_weight', label: 'Mantener peso', emoji: '⚖️' },
  ];

  async function handleSave() {
    setLoading(true);
    try {
      console.log('💾 Guardando perfil del usuario...');
      
      const profile: UserProfile = {
        id: '', // Se generará automáticamente
        name: name.trim(),
        age: age,
        weight: weight,
        height: height,
        gender: gender as 'masculino' | 'femenino',
        activityLevel: activityLevel as 'sedentario' | 'ligero' | 'moderado' | 'intenso',
        goal: goal,
        weightGoalAmount: goal !== 'maintain_weight' ? weightGoalAmount : undefined,
        createdAt: '',
        lastUpdated: '',
      };
      
      const result = await saveUserProfile(profile);
      
      if (result.success) {
        console.log('✅ Perfil guardado exitosamente');
        onCompleted(profile);
      } else {
        console.log('❌ Error al guardar:', result.error);
        Alert.alert('Error', result.error || 'Error al guardar el perfil');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      Alert.alert('Error', 'Error inesperado al guardar');
      setLoading(false);
    }
  }

  const isFormValid = name.trim().length >= 2 && 
                     age >= 10 && age <= 90 &&
                     weight >= 30 && weight <= 200 &&
                     height >= 100 && height <= 250 &&
                     gender !== '' &&
                     activityLevel !== '' &&
                     (goal === 'maintain_weight' || (weightGoalAmount >= 0.1 && weightGoalAmount <= 2.0));

  return (
    <KeyboardAvoidingView 
      style={CommonStyles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>¡Bienvenido a FITSO!</Text>
            <Text style={styles.subtitle}>Cuéntanos sobre ti para personalizar tu experiencia</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Nombre */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Tu nombre"
                placeholderTextColor={Colors.textMuted}
                style={[CommonStyles.input, styles.input]}
              />
            </View>

            {/* Edad */}
            <AgePicker
              value={age}
              onValueChange={setAge}
            />

            {/* Peso y Altura */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <WeightPicker
                  value={weight}
                  onValueChange={setWeight}
                />
              </View>
              
              <View style={styles.halfWidth}>
                <HeightPicker
                  value={height}
                  onValueChange={setHeight}
                />
              </View>
            </View>

            {/* Sexo biológico */}
            <GenderPicker
              value={gender}
              onValueChange={setGender}
            />

            {/* Nivel de actividad física */}
            <ActivityLevelPicker
              value={activityLevel}
              onValueChange={setActivityLevel}
            />

            {/* Objetivo */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>¿Cuál es tu objetivo principal?</Text>
              <View style={styles.goalsContainer}>
                {goals.map((goalOption) => (
                  <TouchableOpacity
                    key={goalOption.key}
                    style={[
                      styles.goalButton,
                      goal === goalOption.key && styles.goalButtonActive
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
              <LoseWeightPicker
                value={weightGoalAmount}
                onValueChange={setWeightGoalAmount}
              />
            )}
            
            {goal === 'gain_weight' && (
              <GainWeightPicker
                value={weightGoalAmount}
                onValueChange={setWeightGoalAmount}
              />
            )}

            {/* Save Button */}
            <TouchableOpacity
              style={[
                CommonStyles.buttonPrimary, 
                styles.saveButton,
                !isFormValid && styles.saveButtonDisabled
              ]}
              onPress={handleSave}
              disabled={!isFormValid || loading}
            >
              <Text style={CommonStyles.buttonText}>
                {loading ? 'Guardando...' : 'Comenzar mi viaje fitness'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  
  header: {
    alignItems: 'center' as const,
    marginBottom: 40,
  },
  
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.accent,
    textAlign: 'center' as const,
    marginBottom: 12,
  },
  
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  
  form: {
    flex: 1,
  },
  
  inputContainer: {
    marginBottom: 20,
  },
  
  row: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  
  halfWidth: {
    width: '48%' as const,
  },
  
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  
  input: {
    fontSize: 16,
  },
  
  goalsContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-around' as const,
    marginTop: 8,
  },
  
  goalButton: {
    width: '48%' as const,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center' as const,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  goalButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  
  goalEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  
  goalText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  
  goalTextActive: {
    color: Colors.textPrimary,
  },
  
  saveButton: {
    marginTop: 32,
  },
  
  saveButtonDisabled: {
    opacity: 0.5,
  },
};
