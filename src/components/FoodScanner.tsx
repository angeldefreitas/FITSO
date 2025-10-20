import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { useScan } from '../hooks/useScan';
import { FoodAnalysis } from '../types/food';

interface FoodScannerProps {
  visible: boolean;
  onClose: () => void;
  onFoodDetected: (food: FoodAnalysis) => void;
  onGalleryPress?: () => void;
  lastGalleryImage?: string | null;
  onPremiumPress?: () => void;
  canUseAIScan?: () => Promise<boolean>;
  recordAIScan?: () => Promise<void>;
  isPremium?: boolean;
}

export default function FoodScanner({ 
  visible, 
  onClose, 
  onFoodDetected, 
  onGalleryPress, 
  lastGalleryImage,
  onPremiumPress,
  canUseAIScan,
  recordAIScan,
  isPremium
}: FoodScannerProps) {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const { scanPicture, scanLoading } = useScan();
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);

  React.useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
  }, [visible]);

  const capturePhoto = async () => {
    if (!cameraRef || isCapturing) return;
    
    setIsCapturing(true);
    try {
      const photo = await cameraRef.takePictureAsync();
      
      console.log('📸 Foto capturada:', photo.uri);
      
      // Validar límites antes de procesar la imagen
      if (!isPremium && canUseAIScan) {
        const canUse = await canUseAIScan();
        if (!canUse) {
          // Usos agotados, mostrar mensaje de premium
          Alert.alert(
            t('premium.scanLimitTitle'),
            t('premium.scanLimitMessage'),
            [
              { text: t('modals.cancel'), style: 'cancel' },
              { text: t('premium.viewPremium'), onPress: onPremiumPress }
            ]
          );
          setIsCapturing(false);
          return;
        }
      }
      
      // Procesar la imagen con Claude
      const foodAnalysis = await scanPicture(photo.uri);
      
      if (foodAnalysis) {
        // Registrar uso de escaneo si no es premium
        if (!isPremium && recordAIScan) {
          await recordAIScan();
        }
        
        onFoodDetected(foodAnalysis);
        onClose();
      }
      
    } catch (error) {
      console.error('Error capturando foto:', error);
      Alert.alert('Error', 'Error al capturar la foto');
    } finally {
      setIsCapturing(false);
    }
  };

  if (!visible) return null;

  if (!permission) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#DC143C', '#2c2c2c', '#1a1a1a', '#000000']}
          locations={[0, 0.3, 0.7, 1]}
          style={styles.gradient}
        >
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>Solicitando permisos de cámara...</Text>
            <ActivityIndicator size="large" color={Colors.textPrimary} />
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#DC143C', '#2c2c2c', '#1a1a1a', '#000000']}
          locations={[0, 0.3, 0.7, 1]}
          style={styles.gradient}
        >
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionTitle}>Permisos de Cámara</Text>
            <Text style={styles.permissionText}>
              Necesitamos acceso a tu cámara para escanear comida
            </Text>
            <TouchableOpacity 
              style={styles.permissionButton}
              onPress={onClose}
            >
              <Text style={styles.permissionButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#DC143C', '#2c2c2c', '#1a1a1a', '#000000']}
          locations={[0, 0.3, 0.7, 1]}
          style={styles.gradient}
        >
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionTitle}>Permisos de Cámara</Text>
            <Text style={styles.permissionText}>
              Necesitamos acceso a tu cámara para escanear comida
            </Text>
            <TouchableOpacity 
              style={styles.permissionButton}
              onPress={onClose}
            >
              <Text style={styles.permissionButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#DC143C', '#2c2c2c', '#1a1a1a', '#000000']}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('food.scanPhoto')}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Camera */}
        <View style={styles.cameraContainer}>
          <CameraView
            ref={setCameraRef}
            style={styles.camera}
            facing="back"
          />
          
          {/* Overlay con marco de escaneo */}
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          {/* Loading indicator */}
          {(scanLoading || isCapturing) && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.textPrimary} />
              <Text style={styles.loadingText}>
                {isCapturing ? 'Capturando...' : 'Analizando...'}
              </Text>
            </View>
          )}

        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>{t('modals.instructions') || 'Instructions'}</Text>
          <Text style={styles.instructionsText}>
            • {t('food.scanInstruction1') || 'Point the camera at your food'}
          </Text>
          <Text style={styles.instructionsText}>
            • {t('food.scanInstruction2') || 'Keep the food inside the frame'}
          </Text>
          <Text style={styles.instructionsText}>
            • {t('food.scanInstruction3') || 'Tap the button to capture'}
          </Text>
        </View>

        {/* Camera controls */}
        <View style={styles.cameraControls}>
          {/* Gallery button - positioned absolutely */}
          {onGalleryPress && (
            <TouchableOpacity 
              style={styles.galleryButtonAbsolute}
              onPress={onGalleryPress}
              disabled={scanLoading || isCapturing}
            >
              <View style={styles.galleryThumbnail}>
                {lastGalleryImage ? (
                  <Image 
                    source={{ uri: lastGalleryImage }} 
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.galleryIcon}>📷</Text>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* Capture button - truly centered */}
          <TouchableOpacity 
            style={[styles.captureButton, (scanLoading || isCapturing) && styles.captureButtonDisabled]}
            onPress={capturePhoto}
            disabled={scanLoading || isCapturing}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  
  gradient: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  
  placeholder: {
    width: 32,
  },
  
  cameraContainer: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  
  camera: {
    flex: 1,
  },
  
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  scanFrame: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
  },
  
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.textPrimary,
    borderWidth: 3,
  },
  
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    color: Colors.textPrimary,
    fontSize: 16,
    marginTop: 10,
  },
  
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  
  permissionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  
  permissionButton: {
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  
  permissionButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  
  instructionsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 5,
    lineHeight: 20,
  },
  
  cameraControls: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 30,
    height: 100,
  },

  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.textPrimary,
  },
  
  captureButtonDisabled: {
    opacity: 0.5,
  },
  
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.textPrimary,
  },

  simulatorPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },

  simulatorText: {
    fontSize: 48,
    marginBottom: 16,
  },

  simulatorMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },

  simulatorSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  galleryButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  galleryButtonAbsolute: {
    position: 'absolute',
    left: 40,
    top: 20,
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  galleryThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  galleryIcon: {
    fontSize: 24,
  },

  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },

  cameraSwitchPlaceholder: {
    width: 60,
    height: 60,
  },
});
