import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Dimensions, 
  Alert 
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import AgePicker from '../components/AgePicker';
import WeightPicker from '../components/WeightPicker';
import HeightPicker from '../components/HeightPicker';
import LoseWeightPicker from '../components/LoseWeightPicker';
import GainWeightPicker from '../components/GainWeightPicker';

const { width } = Dimensions.get('window');

type Props = { 
  onCompleted: () => void;
};

export default function SimpleOnboardingScreen({ onCompleted }: Props) {
  const { user } = useAuth();
  console.log('🔄 SimpleOnboardingScreen montado - user:', user?.id);
  console.log('🔄 SimpleOnboardingScreen - onCompleted function:', typeof onCompleted);
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [gender, setGender] = useState<'masculino' | 'femenino' | ''>('');
  const [activityLevel, setActivityLevel] = useState<'sedentario' | 'ligero' | 'moderado' | 'intenso' | ''>('');
  const [goal, setGoal] = useState<'lose_weight' | 'gain_weight' | 'maintain_weight'>('lose_weight');
  const [weightGoalAmount, setWeightGoalAmount] = useState(0.5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) {
      if (!isFormValid) {
        Alert.alert('Error', 'Por favor completa todos los campos');
      }
      return;
    }

    setIsSubmitting(true);
    console.log('🔄 Guardando datos biométricos...');
    
    try {
      const biometricData = {
        age: age,
        heightCm: height,
        weightKg: weight,
        gender: gender === 'masculino' ? 'male' : 'female',
        activityLevel: activityLevel === 'sedentario' ? 'sedentary' :
                      activityLevel === 'ligero' ? 'light' :
                      activityLevel === 'moderado' ? 'moderate' :
                      activityLevel === 'intenso' ? 'very_active' : 'moderate',
        goal: goal,
        weightGoalAmount: goal !== 'maintain_weight' ? 0.5 : 0.5
      };

      const { default: profileService } = await import('../services/profileService');
      await profileService.updateBiometricData(biometricData);
      
      console.log('✅ Datos guardados exitosamente');
      onCompleted();
      
    } catch (error) {
      console.error('❌ Error guardando datos:', error);
      Alert.alert('Error', 'Error al guardar los datos. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = age >= 13 && age <= 120 &&
                     weight >= 20 && weight <= 300 &&
                     height >= 100 && height <= 250 &&
                     gender !== '' &&
                     activityLevel !== '' &&
                     (goal === 'maintain_weight' || (weightGoalAmount >= 0.1 && weightGoalAmount <= 2.0));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header con título FITSO */}
      <View style={styles.appHeader}>
        <Text style={styles.appTitle}>FITSO</Text>
      </View>

      <Text style={styles.title}>Completa tu perfil</Text>
      <Text style={styles.subtitle}>Necesitamos algunos datos para personalizar tu experiencia</Text>

      {/* Edad */}
      <AgePicker
        value={age}
        onValueChange={setAge}
      />

      {/* Peso */}
      <WeightPicker
        value={weight}
        onValueChange={setWeight}
      />

      {/* Altura */}
      <HeightPicker
        value={height}
        onValueChange={setHeight}
      />

      {/* Género */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Género</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity 
            style={[styles.genderButton, gender === 'masculino' && styles.genderButtonSelected]}
            onPress={() => setGender('masculino')}
          >
            <Text style={[styles.genderButtonText, gender === 'masculino' && styles.genderButtonTextSelected]}>
              Masculino
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.genderButton, gender === 'femenino' && styles.genderButtonSelected]}
            onPress={() => setGender('femenino')}
          >
            <Text style={[styles.genderButtonText, gender === 'femenino' && styles.genderButtonTextSelected]}>
              Femenino
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Nivel de actividad */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nivel de actividad</Text>
        <View style={styles.activityContainer}>
          {[
            { key: 'sedentario', label: 'Sedentario' },
            { key: 'ligero', label: 'Ligero' },
            { key: 'moderado', label: 'Moderado' },
            { key: 'intenso', label: 'Intenso' }
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.activityButton, activityLevel === item.key && styles.activityButtonSelected]}
              onPress={() => setActivityLevel(item.key as any)}
            >
              <Text style={[styles.activityButtonText, activityLevel === item.key && styles.activityButtonTextSelected]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Meta */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tu meta</Text>
        <View style={styles.goalContainer}>
          <TouchableOpacity 
            style={[styles.goalButton, goal === 'lose_weight' && styles.goalButtonSelected]}
            onPress={() => setGoal('lose_weight')}
          >
            <Text style={[styles.goalButtonText, goal === 'lose_weight' && styles.goalButtonTextSelected]}>
              Perder peso
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.goalButton, goal === 'maintain_weight' && styles.goalButtonSelected]}
            onPress={() => setGoal('maintain_weight')}
          >
            <Text style={[styles.goalButtonText, goal === 'maintain_weight' && styles.goalButtonTextSelected]}>
              Mantener peso
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.goalButton, goal === 'gain_weight' && styles.goalButtonSelected]}
            onPress={() => setGoal('gain_weight')}
          >
            <Text style={[styles.goalButtonText, goal === 'gain_weight' && styles.goalButtonTextSelected]}>
              Ganar peso
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cantidad de peso objetivo */}
      {goal === 'lose_weight' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>¿Cuánto peso quieres perder por semana?</Text>
          <View style={styles.weightOptionsContainer}>
            {[1.0, 0.8, 0.5, 0.2].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.weightOptionButton, weightGoalAmount === option && styles.weightOptionButtonSelected]}
                onPress={() => setWeightGoalAmount(option)}
              >
                <Text style={[styles.weightOptionText, weightGoalAmount === option && styles.weightOptionTextSelected]}>
                  {option} kg
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      {goal === 'gain_weight' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>¿Cuánto peso quieres ganar por semana?</Text>
          <View style={styles.weightOptionsContainer}>
            {[0.2, 0.5].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.weightOptionButton, weightGoalAmount === option && styles.weightOptionButtonSelected]}
                onPress={() => setWeightGoalAmount(option)}
              >
                <Text style={[styles.weightOptionText, weightGoalAmount === option && styles.weightOptionTextSelected]}>
                  {option} kg
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Botón de continuar */}
      <TouchableOpacity
        style={[styles.continueButton, !isFormValid && styles.continueButtonDisabled]}
        onPress={handleSubmit}
        disabled={!isFormValid || isSubmitting}
      >
        <Text style={styles.continueButtonText}>
          {isSubmitting ? 'Guardando...' : 'Continuar'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  appHeader: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#ffffff',
    letterSpacing: 2,
    textAlign: 'center' as const,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 15,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    padding: 15,
  },
  pickerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DC143C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  pickerValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginHorizontal: 30,
    minWidth: 80,
    textAlign: 'center',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: '#DC143C',
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  genderButtonTextSelected: {
    color: '#ffffff',
  },
  activityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityButton: {
    width: (width - 60) / 2,
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    alignItems: 'center',
  },
  activityButtonSelected: {
    backgroundColor: '#DC143C',
  },
  activityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  activityButtonTextSelected: {
    color: '#ffffff',
  },
  goalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalButton: {
    width: (width - 60) / 3,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    alignItems: 'center',
  },
  goalButtonSelected: {
    backgroundColor: '#DC143C',
  },
  goalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  goalButtonTextSelected: {
    color: '#ffffff',
  },
  continueButton: {
    backgroundColor: '#DC143C',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonDisabled: {
    backgroundColor: '#666666',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  weightOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  weightOptionButton: {
    width: (width - 60) / 2,
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  weightOptionButtonSelected: {
    backgroundColor: '#DC143C',
    borderColor: '#DC143C',
  },
  weightOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  weightOptionTextSelected: {
    color: '#ffffff',
  },
});
