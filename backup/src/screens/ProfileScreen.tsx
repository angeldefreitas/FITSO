import React, { useState, useEffect, useRef } from 'react';
import { Alert, ScrollView, Text, TextInput, View, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getUserProfile, updateUserProfile, UserProfile } from '../lib/userProfile';
import { Colors } from '../constants/colors';
import { CommonStyles } from '../constants/styles';
import { useProfile } from '../contexts/ProfileContext';
import AgePicker from '../components/AgePicker';
import WeightPicker from '../components/WeightPicker';
import HeightPicker from '../components/HeightPicker';
import LoseWeightPicker from '../components/LoseWeightPicker';
import GainWeightPicker from '../components/GainWeightPicker';
import GenderPicker from '../components/GenderPicker';
import ActivityLevelPicker from '../components/ActivityLevelPicker';
import NutritionGoalsPicker from '../components/NutritionGoalsPicker';
import BottomNavigation from '../components/BottomNavigation';
import BannerAd from '../components/BannerAd';
import { NutritionGoals } from '../lib/nutritionCalculator';

// Nuevo componente extraído
import CollapsibleSection from '../components/ui/CollapsibleSection';

// Nuevos estilos extraídos
import { profileScreenStyles } from '../styles/screens/ProfileScreenStyles';

type Props = { 
  onSaved: () => void;
  onTabChange: (tab: 'diario' | 'perfil') => void;
  onAddFromProfile?: () => void;
  onProgressPress?: () => void;
};

// El componente CollapsibleSection ahora está importado desde components/ui/CollapsibleSection

export default function ProfileScreen({ onSaved, onTabChange, onAddFromProfile, onProgressPress }: Props) {
  const { profile: contextProfile, refreshProfile } = useProfile();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);
  const [gender, setGender] = useState<'masculino' | 'femenino' | ''>('');
  const [activityLevel, setActivityLevel] = useState<'sedentario' | 'ligero' | 'moderado' | 'intenso' | ''>('');
  const [goal, setGoal] = useState<'lose_weight' | 'gain_weight' | 'maintain_weight'>('lose_weight');
  const [weightGoalAmount, setWeightGoalAmount] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals | null>(null);
  
  // Estados para secciones colapsables
  const [isPersonalExpanded, setIsPersonalExpanded] = useState(false);
  const [isGoalsExpanded, setIsGoalsExpanded] = useState(false);

  // Función para manejar el botón +
  const handleAddButtonPress = () => {
    console.log('➕ Botón + presionado desde ProfileScreen, navegando a DailyScreen con modal automático');
    // Usar la función especial para navegar con modal automático
    if (onAddFromProfile) {
      onAddFromProfile();
    } else {
      // Fallback: navegación normal
      onTabChange('diario');
    }
  };
  

  useEffect(() => {
    loadProfile();
  }, []);

  // Sincronizar con el contexto cuando cambie
  useEffect(() => {
    if (contextProfile) {
      setProfile(contextProfile);
      setName(contextProfile.name || '');
      setAge(contextProfile.age || 25);
      setHeightCm(contextProfile.height || 175);
      setWeightKg(contextProfile.weight || 70);
      setGender(contextProfile.gender || '');
      setActivityLevel(contextProfile.activityLevel || '');
      setGoal(contextProfile.goal || 'lose_weight');
      setWeightGoalAmount(contextProfile.weightGoalAmount || 0.5);
    }
  }, [contextProfile]);

  async function loadProfile() {
    try {
      const userProfile = await getUserProfile();
      if (userProfile) {
        setProfile(userProfile);
        setName(userProfile.name || '');
        setAge(userProfile.age || 25);
        setHeightCm(userProfile.height || 175);
        setWeightKg(userProfile.weight || 70);
        setGender(userProfile.gender || '');
        setActivityLevel(userProfile.activityLevel || '');
        setGoal(userProfile.goal || 'lose_weight');
        setWeightGoalAmount(userProfile.weightGoalAmount || 0.5);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  async function saveProfile() {
    setLoading(true);
    try {
      console.log('💾 Actualizando perfil del usuario...');
      
      const updates: any = {
        name: name.trim(),
        age: age,
        height: heightCm,
        weight: weightKg,
        gender: gender as 'masculino' | 'femenino',
        activityLevel: activityLevel as 'sedentario' | 'ligero' | 'moderado' | 'intenso',
        goal: goal,
        weightGoalAmount: goal !== 'maintain_weight' ? weightGoalAmount : undefined,
      };

      // Agregar objetivos nutricionales personalizados si existen
      if (nutritionGoals && nutritionGoals.isCustom) {
        updates.customNutritionGoals = {
          calories: nutritionGoals.calories,
          protein: nutritionGoals.protein,
          carbs: nutritionGoals.carbs,
          fat: nutritionGoals.fat,
        };
      } else if (nutritionGoals && !nutritionGoals.isCustom) {
        // Si se cambió a automático, eliminar objetivos personalizados
        updates.customNutritionGoals = undefined;
      }
      
      const result = await updateUserProfile(updates);
      
      if (result.success) {
        console.log('✅ Perfil actualizado exitosamente');
        Alert.alert('¡Perfecto!', 'Tu perfil ha sido actualizado', [
          { text: 'Continuar', onPress: () => onSaved() }
        ]);
      } else {
        console.log('❌ Error al actualizar:', result.error);
        Alert.alert('Error', result.error || 'Error al actualizar el perfil');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      Alert.alert('Error', 'Error inesperado al actualizar');
      setLoading(false);
    }
  }

  const goals = [
    { key: 'lose_weight', label: 'Perder peso', emoji: '🔥', color: '#e74c3c' },
    { key: 'gain_weight', label: 'Ganar peso', emoji: '💪', color: '#3498db' },
    { key: 'maintain_weight', label: 'Mantener peso', emoji: '⚖️', color: '#2ecc71' },
  ];

  // Función para generar información resumida del perfil
  const getPersonalInfoSummary = () => {
    const parts: string[] = [];
    
    if (name.trim()) {
      parts.push(name.trim());
    }
    
    if (age) {
      parts.push(`${age} años`);
    }
    
    if (weightKg && heightCm) {
      parts.push(`${weightKg}kg, ${heightCm}cm`);
    } else if (weightKg) {
      parts.push(`${weightKg}kg`);
    } else if (heightCm) {
      parts.push(`${heightCm}cm`);
    }
    
    if (gender) {
      parts.push(gender === 'masculino' ? '♂' : '♀');
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'Completa tu información';
  };

  // Función para generar información resumida de objetivos
  const getGoalsSummary = () => {
    const parts: string[] = [];
    
    // Objetivo principal
    const goalOption = goals.find(g => g.key === goal);
    if (goalOption) {
      parts.push(`${goalOption.emoji} ${goalOption.label}`);
    }
    
    // Cantidad de peso objetivo
    if (goal === 'lose_weight') {
      parts.push(`Perder ${weightGoalAmount} kg/semana`);
    } else if (goal === 'gain_weight') {
      parts.push(`Ganar ${weightGoalAmount} kg/semana`);
    } else if (goal === 'maintain_weight') {
      parts.push('Mantener peso actual');
    }
    
    // Objetivos nutricionales
    if (nutritionGoals) {
      parts.push(`${Math.round(nutritionGoals.calories)} cal/día`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'Configura tus objetivos';
  };

  return (
    <View style={profileScreenStyles.container}>
      <LinearGradient
        colors={['#DC143C', '#2c2c2c', '#1a1a1a', '#000000']}
        locations={[0, 0.3, 0.7, 1]}
        style={profileScreenStyles.gradientBackground}
      >
        <ScrollView style={profileScreenStyles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header con título FITSO */}
        <View style={profileScreenStyles.appHeader}>
          <Text style={profileScreenStyles.appTitle}>FITSO</Text>
        </View>
        
        <View style={profileScreenStyles.header}>
          <Text style={profileScreenStyles.title}>Mi Perfil</Text>
          <Text style={profileScreenStyles.subtitle}>Actualiza tu información personal</Text>
        </View>

        <View style={profileScreenStyles.form}>
          {/* Sección de Información Personal */}
          <CollapsibleSection
            title="Información Personal"
            icon="👤"
            isExpanded={isPersonalExpanded}
            onToggle={() => setIsPersonalExpanded(!isPersonalExpanded)}
            summaryInfo={getPersonalInfoSummary()}
            userData={{
              name,
              age,
              weightKg,
              heightCm,
              gender,
              activityLevel
            }}
          >
            {/* Nombre */}
            <View style={profileScreenStyles.inputGroup}>
              <Text style={profileScreenStyles.inputLabel}>Nombre</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Tu nombre completo"
                placeholderTextColor="#9ca3af"
                style={profileScreenStyles.input}
              />
            </View>

            {/* Edad */}
            <View style={profileScreenStyles.inputGroup}>
              <Text style={profileScreenStyles.inputLabel}>Edad</Text>
              <AgePicker
                value={age}
                onValueChange={setAge}
              />
            </View>

            {/* Peso y Altura en una fila */}
            <View style={profileScreenStyles.row}>
              <View style={profileScreenStyles.halfWidth}>
                <Text style={profileScreenStyles.inputLabel}>Peso (kg)</Text>
                <WeightPicker
                  value={weightKg}
                  onValueChange={setWeightKg}
                />
              </View>
              
              <View style={profileScreenStyles.halfWidth}>
                <Text style={profileScreenStyles.inputLabel}>Altura (cm)</Text>
                <HeightPicker
                  value={heightCm}
                  onValueChange={setHeightCm}
                />
              </View>
            </View>

            {/* Sexo biológico */}
            <View style={profileScreenStyles.inputGroup}>
              <Text style={profileScreenStyles.inputLabel}>Sexo biológico</Text>
              <View style={profileScreenStyles.genderContainer}>
                <TouchableOpacity
                  style={[
                    profileScreenStyles.genderButton,
                    gender === 'masculino' && profileScreenStyles.genderButtonActive
                  ]}
                  onPress={() => setGender('masculino')}
                >
                  <Text style={profileScreenStyles.genderIcon}>♂</Text>
                  <Text style={[
                    profileScreenStyles.genderText,
                    gender === 'masculino' && profileScreenStyles.genderTextActive
                  ]}>
                    Masculino
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    profileScreenStyles.genderButton,
                    gender === 'femenino' && profileScreenStyles.genderButtonActive
                  ]}
                  onPress={() => setGender('femenino')}
                >
                  <Text style={profileScreenStyles.genderIcon}>♀</Text>
                  <Text style={[
                    profileScreenStyles.genderText,
                    gender === 'femenino' && profileScreenStyles.genderTextActive
                  ]}>
                    Femenino
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Nivel de actividad física */}
            <View style={profileScreenStyles.inputGroup}>
              <Text style={profileScreenStyles.inputLabel}>Nivel de actividad física</Text>
              <View style={profileScreenStyles.activityGrid}>
                <TouchableOpacity
                  style={[
                    profileScreenStyles.activityButton,
                    activityLevel === 'sedentario' && profileScreenStyles.activityButtonActive
                  ]}
                  onPress={() => setActivityLevel('sedentario')}
                >
                  <Text style={profileScreenStyles.activityIcon}>🛋️</Text>
                  <Text style={[
                    profileScreenStyles.activityTitle,
                    activityLevel === 'sedentario' && profileScreenStyles.activityTitleActive
                  ]}>
                    Sedentario
                  </Text>
                  <Text style={[
                    profileScreenStyles.activitySubtitle,
                    activityLevel === 'sedentario' && profileScreenStyles.activitySubtitleActive
                  ]}>
                    Trabajo de escritorio, poco ejercicio
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    profileScreenStyles.activityButton,
                    activityLevel === 'ligero' && profileScreenStyles.activityButtonActive
                  ]}
                  onPress={() => setActivityLevel('ligero')}
                >
                  <Text style={profileScreenStyles.activityIcon}>🚶</Text>
                  <Text style={[
                    profileScreenStyles.activityTitle,
                    activityLevel === 'ligero' && profileScreenStyles.activityTitleActive
                  ]}>
                    Ligeramente activo
                  </Text>
                  <Text style={[
                    profileScreenStyles.activitySubtitle,
                    activityLevel === 'ligero' && profileScreenStyles.activitySubtitleActive
                  ]}>
                    Ejercicio ligero 1-3 días/semana
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    profileScreenStyles.activityButton,
                    activityLevel === 'moderado' && profileScreenStyles.activityButtonActive
                  ]}
                  onPress={() => setActivityLevel('moderado')}
                >
                  <Text style={profileScreenStyles.activityIcon}>🏃</Text>
                  <Text style={[
                    profileScreenStyles.activityTitle,
                    activityLevel === 'moderado' && profileScreenStyles.activityTitleActive
                  ]}>
                    Moderadamente activo
                  </Text>
                  <Text style={[
                    profileScreenStyles.activitySubtitle,
                    activityLevel === 'moderado' && profileScreenStyles.activitySubtitleActive
                  ]}>
                    Ejercicio moderado 3-5 días/semana
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    profileScreenStyles.activityButton,
                    activityLevel === 'intenso' && profileScreenStyles.activityButtonActive
                  ]}
                  onPress={() => setActivityLevel('intenso')}
                >
                  <Text style={profileScreenStyles.activityIcon}>💪</Text>
                  <Text style={[
                    profileScreenStyles.activityTitle,
                    activityLevel === 'intenso' && profileScreenStyles.activityTitleActive
                  ]}>
                    Muy activo
                  </Text>
                  <Text style={[
                    profileScreenStyles.activitySubtitle,
                    activityLevel === 'intenso' && profileScreenStyles.activitySubtitleActive
                  ]}>
                    Ejercicio intenso 6-7 días/semana
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </CollapsibleSection>

          {/* Sección de Metas y Objetivos */}
          <CollapsibleSection
            title="Metas y Objetivos"
            icon="🎯"
            isExpanded={isGoalsExpanded}
            onToggle={() => setIsGoalsExpanded(!isGoalsExpanded)}
            goalsData={{
              goal,
              weightGoalAmount,
              nutritionGoals
            }}
          >
            {/* Objetivo principal */}
            <View style={profileScreenStyles.inputGroup}>
              <Text style={profileScreenStyles.inputLabel}>Objetivo principal</Text>
              <View style={profileScreenStyles.goalsGrid}>
                {goals.map((goalOption) => (
                  <TouchableOpacity
                    key={goalOption.key}
                    style={[
                      profileScreenStyles.goalCard,
                      goal === goalOption.key && profileScreenStyles.goalCardActive
                    ]}
                    onPress={() => setGoal(goalOption.key as any)}
                  >
                    <Text style={profileScreenStyles.goalEmoji}>{goalOption.emoji}</Text>
                    <Text style={[
                      profileScreenStyles.goalText,
                      goal === goalOption.key && profileScreenStyles.goalTextActive
                    ]}>
                      {goalOption.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Cantidad de peso objetivo */}
            {goal === 'lose_weight' && (
              <View style={profileScreenStyles.inputGroup}>
                <Text style={profileScreenStyles.inputLabel}>Cantidad a perder (kg/semana)</Text>
                <View style={profileScreenStyles.pickerWrapper}>
                  <LoseWeightPicker
                    value={weightGoalAmount}
                    onValueChange={setWeightGoalAmount}
                  />
                </View>
              </View>
            )}
            
            {goal === 'gain_weight' && (
              <View style={profileScreenStyles.inputGroup}>
                <Text style={profileScreenStyles.inputLabel}>Cantidad a ganar (kg/semana)</Text>
                <View style={profileScreenStyles.pickerWrapper}>
                  <GainWeightPicker
                    value={weightGoalAmount}
                    onValueChange={setWeightGoalAmount}
                  />
                </View>
              </View>
            )}

            {/* Objetivos Nutricionales */}
            {profile && (
              <View style={profileScreenStyles.inputGroup}>
                <Text style={profileScreenStyles.inputLabel}>Objetivos nutricionales</Text>
                <View style={profileScreenStyles.pickerWrapper}>
                  <NutritionGoalsPicker
                    profile={profile}
                    onGoalsChange={setNutritionGoals}
                    currentGoal={goal}
                    currentWeightGoalAmount={weightGoalAmount}
                  />
                </View>
              </View>
            )}
          </CollapsibleSection>

          {/* Botón de Guardar */}
          <TouchableOpacity
            style={[profileScreenStyles.saveButton, loading && profileScreenStyles.saveButtonDisabled]}
            onPress={saveProfile}
            disabled={loading}
          >
            <Text style={profileScreenStyles.saveButtonText}>
              {loading ? 'Guardando...' : 'Actualizar Perfil'}
            </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>

        {/* Banner Ad */}
        <BannerAd style={profileScreenStyles.bannerAd} />

        {/* Bottom Navigation */}
        <BottomNavigation 
          activeTab="perfil" 
          onTabChange={onTabChange}
          onAddPress={handleAddButtonPress}
          onProgressPress={onProgressPress}
        />
      </LinearGradient>
    </View>
  );
}

// Los estilos ahora están en profileScreenStyles importado