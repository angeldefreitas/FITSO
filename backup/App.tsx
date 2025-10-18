import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import mobileAds from 'react-native-google-mobile-ads';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DailyScreen from './src/screens/DailyScreen';
import ProgressTrackingScreen from './src/screens/ProgressTrackingScreen';
import SplashScreen from './src/components/SplashScreen';
import CircularLoadingWheel from './src/components/CircularLoadingWheel';
import { getAppState, UserProfile } from './src/lib/userProfile';
import { Colors } from './src/constants/colors';
import { CommonStyles } from './src/constants/styles';
import { ProfileProvider } from './src/contexts/ProfileContext';

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [step, setStep] = useState<'splash' | 'onboarding' | 'profile' | 'daily'>('splash');
  const [isLoading, setIsLoading] = useState(true);
  const [shouldOpenAddModal, setShouldOpenAddModal] = useState(false);
  const [showProgressTracking, setShowProgressTracking] = useState(false);

  useEffect(() => {
    // Inicializar AdMob
    const initializeAdMob = async () => {
      try {
        await mobileAds().initialize();
        console.log('✅ AdMob initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing AdMob:', error);
      }
    };

    // Verificar estado de la app al iniciar
    const checkAppState = async () => {
      console.log('🔍 Verificando estado de la app...');
      setIsLoading(true);
      
      try {
        const appState = await getAppState();
        console.log('📱 Estado de la app:', appState.isFirstTime ? 'Primera vez' : 'Usuario existente');
        
        if (appState.isFirstTime || !appState.userProfile) {
          console.log('👋 Usuario nuevo, mostrando onboarding');
          setStep('onboarding');
          setUserProfile(null);
        } else {
          console.log('✅ Usuario existente:', appState.userProfile.name);
          setUserProfile(appState.userProfile);
          setStep('daily');
        }
      } catch (error) {
        console.error('❌ Error checking app state:', error);
        setStep('onboarding');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Inicializar AdMob y verificar estado de la app
    const initializeApp = async () => {
      await initializeAdMob();
      await checkAppState();
    };
    
    // Mostrar splash screen por 3.5 segundos antes de verificar el estado
    const splashTimer = setTimeout(() => {
      initializeApp();
    }, 3500);
    
    return () => clearTimeout(splashTimer);
  }, []);

  // Mostrar splash screen
  if (step === 'splash') {
    return <SplashScreen onAnimationComplete={() => setStep('onboarding')} />;
  }

  if (isLoading) {
    return (
      <SafeAreaView style={CommonStyles.safeArea}>
        <View style={styles.loadingContainer}>
          <CircularLoadingWheel 
            size={140}
            strokeWidth={8}
            duration={2000}
            onAnimationComplete={() => {
              // La animación se completa cuando la carga termina
              console.log('🎯 Animación de carga completada');
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'onboarding') {
    return <OnboardingScreen onCompleted={(profile) => {
      console.log('🎉 Onboarding completado:', profile.name);
      setUserProfile(profile);
      setStep('daily');
    }} />;
  }

  const handleTabChange = (tab: 'diario' | 'perfil') => {
    if (tab === 'diario') {
      setStep('daily');
    } else if (tab === 'perfil') {
      setStep('profile');
    }
  };

  const handleAddFromProfile = () => {
    console.log('➕ Navegando desde ProfileScreen a DailyScreen con modal automático');
    setShouldOpenAddModal(true);
    setStep('daily');
  };

  return (
    <ProfileProvider>
      <SafeAreaView style={CommonStyles.safeArea}>
        <StatusBar style="light" backgroundColor={Colors.background} />
        
        {step === 'profile' ? (
          <ProfileScreen 
            onSaved={() => setStep('daily')} 
            onTabChange={handleTabChange}
            onAddFromProfile={handleAddFromProfile}
            onProgressPress={() => setShowProgressTracking(true)}
          />
        ) : (
          <DailyScreen 
            onTabChange={handleTabChange}
            shouldOpenAddModal={shouldOpenAddModal}
            onModalOpened={() => setShouldOpenAddModal(false)}
            showProgressTracking={showProgressTracking}
            onProgressTrackingClose={() => setShowProgressTracking(false)}
            onProgressPress={() => setShowProgressTracking(true)}
          />
        )}

        {/* Pantalla de Seguimiento de Progreso - Renderizada globalmente */}
        {showProgressTracking && (
          <ProgressTrackingScreen
            onClose={() => setShowProgressTracking(false)}
            onTabChange={handleTabChange}
            onAddPress={handleAddFromProfile}
            currentTab={step === 'profile' ? 'perfil' : 'diario'}
          />
        )}
      </SafeAreaView>
    </ProfileProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
