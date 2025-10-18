import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { Colors } from '../constants/colors';
import BiometricDataModal, { BiometricData } from '../components/modals/BiometricDataModal';
import GoalsModal, { GoalsData } from '../components/modals/GoalsModal';
import BottomNavigation from '../components/BottomNavigation';
import ChangePasswordScreen from './ChangePasswordScreen';

interface ProfileScreenProps {
  navigation?: any;
  onTabChange?: (tab: 'diario' | 'perfil') => void;
  onAddFromProfile?: () => void;
  onProgressPress?: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  navigation, 
  onTabChange, 
  onAddFromProfile, 
  onProgressPress 
}) => {
  const { user, logout, updateProfile, deleteAccount, loading: authLoading, profileData, getProfileData, updateBiometricData, updateGoalsData } = useAuth();
  const { profile, updateProfileData } = useProfile();
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Estados para los modales
  const [biometricModalVisible, setBiometricModalVisible] = useState(false);
  const [goalsModalVisible, setGoalsModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [savingBiometric, setSavingBiometric] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // Estados para los datos biométricos y metas
  const [biometricData, setBiometricData] = useState<BiometricData>({
    age: 25,
    heightCm: 175,
    weightKg: 70,
    gender: 'male',
    activityLevel: 'moderate',
  });

  const [goalsData, setGoalsData] = useState<GoalsData>({
    goal: 'lose_weight',
    weightGoalAmount: 0.5,
    nutritionGoals: null,
  });

  // Cargar datos del perfil solo una vez cuando el usuario esté disponible
  useEffect(() => {
    if (user && !profileData && !loadingProfile) {
      const loadData = async () => {
        try {
          setLoadingProfile(true);
          await getProfileData();
        } catch (error) {
          console.error('Error cargando datos de perfil:', error);
        } finally {
          setLoadingProfile(false);
        }
      };
      loadData();
    }
  }, [user, profileData, loadingProfile, getProfileData]);

  // Actualizar datos locales cuando profileData cambie
  useEffect(() => {
    if (profileData) {
      setBiometricData(profileData.biometricData);
      setGoalsData(profileData.goalsData);
    }
  }, [profileData]);

  // Actualizar datos biométricos cuando cambie el perfil del contexto de perfil
  useEffect(() => {
    if (profile) {
      console.log('🔄 Actualizando datos biométricos desde contexto de perfil:', profile.weight, 'kg');
      setBiometricData({
        age: profile.age,
        heightCm: profile.height,
        weightKg: profile.weight,
        gender: profile.gender === 'masculino' ? 'male' : 'female',
        activityLevel: profile.activityLevel === 'sedentario' ? 'sedentary' :
                      profile.activityLevel === 'ligero' ? 'light' :
                      profile.activityLevel === 'moderado' ? 'moderate' :
                      profile.activityLevel === 'intenso' ? 'active' : 'moderate'
      });
    }
  }, [profile]);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              if (navigation) {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            } catch (error: any) {
              Alert.alert('Error', 'Error al cerrar sesión');
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    setChangePasswordModalVisible(true);
  };

  const handleEditProfile = () => {
    if (navigation) {
      navigation.navigate('EditProfile');
    } else {
      Alert.alert('Info', 'Funcionalidad de editar perfil próximamente');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar Cuenta',
      'Esta acción no se puede deshacer. Se eliminarán todos tus datos permanentemente. ¿Estás completamente seguro?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar Permanentemente',
          style: 'destructive',
          onPress: () => {
            // Segundo alert de confirmación
            Alert.alert(
              'Confirmación Final',
              'Última oportunidad. ¿Realmente quieres eliminar tu cuenta y todos tus datos?',
              [
                {
                  text: 'No, cancelar',
                  style: 'cancel',
                },
                {
                  text: 'SÍ, ELIMINAR',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteAccount();
                      Alert.alert(
                        'Cuenta Eliminada',
                        'Tu cuenta ha sido eliminada exitosamente. Gracias por usar Fitso.',
                        [
                          {
                            text: 'OK',
                            onPress: () => {
                              if (navigation) {
                                navigation.reset({
                                  index: 0,
                                  routes: [{ name: 'Login' }],
                                });
                              }
                            },
                          },
                        ]
                      );
                    } catch (error: any) {
                      console.error('Error eliminando cuenta:', error);
                      Alert.alert('Error', error.message || 'Error al eliminar la cuenta');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  // Funciones para manejar los modales
  const handleBiometricSave = async (data: BiometricData) => {
    setSavingBiometric(true);
    try {
      console.log('🔄 Iniciando guardado de datos biométricos:', data);
      
      // Convertir datos biométricos al formato del perfil
      const profileUpdates = {
        age: data.age,
        height: data.heightCm,
        weight: data.weightKg,
        gender: (data.gender === 'male' ? 'masculino' : 'femenino') as 'masculino' | 'femenino',
        activityLevel: (data.activityLevel === 'sedentary' ? 'sedentario' :
                      data.activityLevel === 'light' ? 'ligero' :
                      data.activityLevel === 'moderate' ? 'moderado' :
                      data.activityLevel === 'active' ? 'intenso' : 'moderado') as 'sedentario' | 'ligero' | 'moderado' | 'intenso'
      };
      
      // Actualizar usando el contexto de perfil para sincronización en tiempo real
      await updateProfileData(profileUpdates);
      
      // También actualizar el backend via AuthContext para mantener compatibilidad
      await updateBiometricData(data);
      
      console.log('✅ Datos biométricos guardados exitosamente');
      setBiometricData(data);
      setBiometricModalVisible(false);
      Alert.alert('Éxito', 'Datos biométricos actualizados correctamente');
    } catch (error: any) {
      console.error('❌ Error guardando datos biométricos:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      Alert.alert('Error', error.message || 'Error al guardar los datos biométricos');
    } finally {
      setSavingBiometric(false);
    }
  };

  const handleGoalsSave = async (data: GoalsData) => {
    setSavingGoals(true);
    try {
      await updateGoalsData(data);
      setGoalsData(data);
      setGoalsModalVisible(false);
      Alert.alert('Éxito', 'Metas actualizadas correctamente');
    } catch (error: any) {
      console.error('Error guardando metas:', error);
      Alert.alert('Error', error.message || 'Error al guardar las metas');
    } finally {
      setSavingGoals(false);
    }
  };

  const getBiometricSummary = () => {
    // Verificar que biometricData existe antes de acceder a sus propiedades
    if (!biometricData) {
      return 'Completa tus datos biométricos';
    }
    
    const parts: string[] = [];
    if (biometricData.age) parts.push(`${biometricData.age} años`);
    if (biometricData.weightKg && biometricData.heightCm) {
      parts.push(`${biometricData.weightKg}kg, ${biometricData.heightCm}cm`);
    }
    if (biometricData.gender) {
      const genderEmoji = biometricData.gender === 'male' ? '♂' : 
                         biometricData.gender === 'female' ? '♀' : '⚧';
      parts.push(genderEmoji);
    }
    return parts.length > 0 ? parts.join(' • ') : 'Completa tus datos biométricos';
  };

  const getGoalsSummary = () => {
    // Verificar que goalsData existe antes de acceder a sus propiedades
    if (!goalsData) {
      return 'Configura tus objetivos';
    }
    
    const parts: string[] = [];
    const goalLabels = {
      lose_weight: '🔥 Perder peso',
      gain_weight: '💪 Ganar peso',
      maintain_weight: '⚖️ Mantener peso'
    };
    
    if (goalsData.goal) {
      parts.push(goalLabels[goalsData.goal]);
      
      if (goalsData.goal === 'lose_weight') {
        parts.push(`Perder ${goalsData.weightGoalAmount} kg/semana`);
      } else if (goalsData.goal === 'gain_weight') {
        parts.push(`Ganar ${goalsData.weightGoalAmount} kg/semana`);
      }
    }
    
    if (goalsData.nutritionGoals) {
      parts.push(`${Math.round(goalsData.nutritionGoals.calories || 0)} cal/día`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'Configura tus objetivos';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      setLoadingProfile(true);
      await getProfileData();
      Alert.alert('Actualización', 'Datos de perfil actualizados correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos del perfil.');
    } finally {
      setLoadingProfile(false);
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#DC143C', '#2c2c2c', '#1a1a1a', '#000000']}
      locations={[0, 0.3, 0.7, 1]}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header con título FITSO */}
        <View style={styles.appHeader}>
          <Text style={styles.appTitle}>FITSO</Text>
        </View>

        <View style={styles.content}>
          {/* Header del perfil */}
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <Text style={styles.name}>{user?.name || 'Usuario'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.verificationStatus}>
              <Text style={styles.verificationText}>
                {user?.is_verified ? '✅ Verificado' : '⚠️ No verificado'}
              </Text>
            </View>
          </View>

        {/* Profile Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de la Cuenta</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>{user?.name || 'No especificado'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Miembro desde:</Text>
            <Text style={styles.infoValue}>
              {user?.created_at ? formatDate(user.created_at) : 'No disponible'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Última actualización:</Text>
            <Text style={styles.infoValue}>
              {user?.updated_at ? formatDate(user.updated_at) : 'No disponible'}
            </Text>
          </View>
        </View>

        {/* Datos Biométricos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos Biométricos</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setBiometricModalVisible(true)}
          >
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonText}>📏 Ver/Actualizar Datos</Text>
              <Text style={styles.actionButtonSubtext}>{getBiometricSummary()}</Text>
            </View>
            <Text style={styles.actionButtonArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Metas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metas</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setGoalsModalVisible(true)}
          >
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonText}>🎯 Ver/Actualizar Metas</Text>
              <Text style={styles.actionButtonSubtext}>{getGoalsSummary()}</Text>
            </View>
            <Text style={styles.actionButtonArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.actionButtonText}>✏️ Editar Perfil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleChangePassword}
          >
            <Text style={styles.actionButtonText}>🔒 Cambiar Contraseña</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Info', 'Notificaciones próximamente')}
          >
            <Text style={styles.actionButtonText}>🔔 Notificaciones</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Info', 'Privacidad próximamente')}
          >
            <Text style={styles.actionButtonText}>🛡️ Privacidad</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zona de Peligro</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleDeleteAccount}
          >
            <Text style={[styles.actionButtonText, styles.dangerText]}>
              🗑️ Eliminar Cuenta
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Modales */}
      <BiometricDataModal
        visible={biometricModalVisible}
        onClose={() => setBiometricModalVisible(false)}
        onSave={handleBiometricSave}
        initialData={biometricData}
        loading={savingBiometric}
      />

      <GoalsModal
        visible={goalsModalVisible}
        onClose={() => setGoalsModalVisible(false)}
        onSave={handleGoalsSave}
        initialData={goalsData}
        loading={savingGoals}
        biometricData={biometricData ? {
          age: biometricData.age,
          height: biometricData.heightCm,
          weight: biometricData.weightKg,
          gender: biometricData.gender,
          activityLevel: biometricData.activityLevel,
        } : {
          age: 25,
          height: 175,
          weight: 70,
          gender: 'male' as const,
          activityLevel: 'moderate' as const,
        }}
      />

      {/* Modal de Cambio de Contraseña */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={changePasswordModalVisible}
        onRequestClose={() => setChangePasswordModalVisible(false)}
      >
        <ChangePasswordScreen
          navigation={{
            goBack: () => setChangePasswordModalVisible(false)
          }}
        />
      </Modal>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab="perfil"
        onTabChange={onTabChange}
        onAddPress={onAddFromProfile}
        onProgressPress={onProgressPress}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  appHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 2,
    textAlign: 'center',
  },
  content: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 120, // Espacio para el BottomNavigation
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  verificationStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  verificationText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 2,
    textAlign: 'right',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  actionButtonSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionButtonArrow: {
    fontSize: 20,
    color: Colors.textSecondary,
    fontWeight: '300',
  },
  dangerButton: {
    borderColor: '#F44336',
  },
  dangerText: {
    color: '#F44336',
  },
  logoutButton: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;