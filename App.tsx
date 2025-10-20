import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

// Importar configuración de i18next
import './src/config/i18n';
// Import condicional de Google Mobile Ads
let mobileAds: any = null;
try {
  mobileAds = require('react-native-google-mobile-ads').default;
} catch (error) {
  console.log('Google Mobile Ads no disponible en Expo Go');
}
import SimpleOnboardingScreen from './src/screens/SimpleOnboardingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DailyScreen from './src/screens/DailyScreen';
import ProgressTrackingScreen from './src/screens/ProgressTrackingScreen';
import SplashScreen from './src/components/SplashScreen';
import CircularLoadingWheel from './src/components/CircularLoadingWheel';
import LoadingScreen from './src/components/LoadingScreen';
import AuthStack from './src/navigation/AuthStack';
import { getAppState, UserProfile } from './src/lib/userProfile';
import { Colors } from './src/constants/colors';
import { CommonStyles } from './src/constants/styles';
import { ProfileProvider } from './src/contexts/ProfileContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { PremiumProvider } from './src/contexts/PremiumContext';
import { LanguageProvider } from './src/contexts/LanguageContext';

// Componente interno para manejar la lógica de la app
const AppContent = () => {
  // Todos los hooks deben ejecutarse en el mismo orden siempre
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [step, setStep] = useState<'splash' | 'onboarding' | 'profile' | 'daily'>('splash');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldOpenAddModal, setShouldOpenAddModal] = useState(false);
  const [showProgressTracking, setShowProgressTracking] = useState(false);
  
  // useAuth debe ejecutarse siempre, sin importar las condiciones de render
  const { user, loading: authLoading, isNewUser, resetIsNewUser } = useAuth();


  // Inicializar step basado en el estado del usuario
  useEffect(() => {
    if (!authLoading && !hasInitialized) {
      console.log('🔄 Inicializando app - user:', !!user, 'isNewUser:', isNewUser);
      
      if (user) {
        if (isNewUser) {
          console.log('🆕 Usuario nuevo, yendo a onboarding');
          setStep('onboarding');
        } else {
          console.log('👤 Usuario existente, yendo a daily');
          setStep('daily');
        }
      } else {
        console.log('❌ No hay usuario, quedando en splash');
        setStep('splash');
      }
      
      setHasInitialized(true);
    }
  }, [user, authLoading, hasInitialized]); // Removí isNewUser de las dependencias

  // Forzar onboarding cuando isNewUser cambie a true
  useEffect(() => {
    if (hasInitialized && isNewUser && step !== 'onboarding') {
      console.log('🔄 isNewUser cambió a true, forzando onboarding');
      setStep('onboarding');
    }
  }, [isNewUser, hasInitialized, step]);

  // Manejar transición de onboarding a daily cuando se complete
  useEffect(() => {
    if (step === 'onboarding' && !isNewUser && hasInitialized) {
      console.log('🔄 Onboarding completado, yendo a daily');
      setStep('daily');
    }
  }, [isNewUser, step, hasInitialized]);

  // Todos los useCallback deben ejecutarse antes de cualquier return
  const handleTabChange = useCallback((tab: 'diario' | 'perfil') => {
    if (tab === 'diario') {
      setStep('daily');
    } else if (tab === 'perfil') {
      setStep('profile');
    }
  }, []);

  const handleAddFromProfile = useCallback(() => {
    console.log('➕ Navegando desde ProfileScreen a DailyScreen con modal automático');
    setShouldOpenAddModal(true);
    setStep('daily');
  }, []);

  const handleModalOpened = useCallback(() => {
    setShouldOpenAddModal(false);
  }, []);

  const handleProgressTrackingClose = useCallback(() => {
    setShowProgressTracking(false);
  }, []);

  const handleProgressPress = useCallback(() => {
    setShowProgressTracking(true);
  }, []);

  useEffect(() => {
    // Inicializar AdMob (solo si está disponible)
    const initializeAdMob = async () => {
      if (mobileAds) {
        try {
          await mobileAds().initialize();
          console.log('✅ AdMob initialized successfully');
        } catch (error) {
          console.error('❌ Error initializing AdMob:', error);
        }
      } else {
        console.log('⚠️ AdMob no disponible en Expo Go - usando modo desarrollo');
      }
    };


    // Verificar estado de la app al iniciar
  const checkAppState = async () => {
    console.log('🔍 Verificando estado de la app...');
    console.log('👤 Usuario actual:', user);
    setIsLoading(true);
    
    try {
      // Si hay usuario autenticado, ir directo a DailyScreen
      if (user?.id) {
        console.log('✅ Usuario autenticado, yendo a DailyScreen');
        setStep('daily');
        setUserProfile(null); // Se cargará desde ProfileContext
      } else {
        console.log('❌ No hay usuario autenticado, mostrando onboarding');
        setStep('onboarding');
        setUserProfile(null);
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
  }, [user?.id]);

  // Mostrar splash screen
  if (step === 'splash') {
    return <SplashScreen onAnimationComplete={() => setStep('onboarding')} />;
  }

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading || isLoading) {
    return <LoadingScreen />;
  }

  // Si no hay usuario autenticado, mostrar pantallas de autenticación
  if (!user) {
    return (
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    );
  }

  // Log del estado actual
  if (user) {
    console.log('🔍 Usuario autenticado - isNewUser:', isNewUser, 'step:', step, 'hasInitialized:', hasInitialized, 'authLoading:', authLoading);
  }

  if (step === 'onboarding') {
    return <SimpleOnboardingScreen 
      onCompleted={() => {
        console.log('🎉 Onboarding completado');
        resetIsNewUser();
      }} 
    />;
  }

  console.log('🔍 Renderizando App - step:', step, 'user:', !!user);
  
  return (
    <ProfileProvider userId={user?.id}>
      <SafeAreaView style={CommonStyles.safeArea}>
        <StatusBar style="light" backgroundColor={Colors.background} />
        
        {step === 'profile' ? (
          <ProfileScreen 
            onTabChange={handleTabChange}
            onAddFromProfile={handleAddFromProfile}
            onProgressPress={handleProgressPress}
          />
        ) : (
          <DailyScreen 
            onTabChange={handleTabChange}
            shouldOpenAddModal={shouldOpenAddModal}
            onModalOpened={handleModalOpened}
            showProgressTracking={showProgressTracking}
            onProgressTrackingClose={handleProgressTrackingClose}
            onProgressPress={handleProgressPress}
          />
        )}

        {/* Pantalla de Seguimiento de Progreso - Renderizada globalmente */}
        {showProgressTracking && (
          <ProgressTrackingScreen
            onClose={handleProgressTrackingClose}
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

// Componente principal de la app con AuthProvider
export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <PremiumProvider>
          <AppContent />
        </PremiumProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
