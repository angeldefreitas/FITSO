import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configurar Google Sign-In
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    // Web Client ID de tu proyecto Firebase
    webClientId: '618032061515-5vm8cc5s7ggfubivel01n4gli352k8h2.apps.googleusercontent.com',
    // iOS Client ID específico para tu app
    iosClientId: '618032061515-hk18aqtbo7pjk6dntcdut5o47j1alhnk.apps.googleusercontent.com',
  });
};

// Inicializar Google Sign-In
export const initializeGoogleSignIn = () => {
  configureGoogleSignIn();
};
