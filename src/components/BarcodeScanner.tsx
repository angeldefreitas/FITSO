import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors } from '../constants/colors';
import { useTranslation } from 'react-i18next';

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onBarcodeScanned: (barcode: string) => void;
}

export default function BarcodeScanner({ 
  visible, 
  onClose, 
  onBarcodeScanned 
}: BarcodeScannerProps) {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
    // Resetear el estado cuando el scanner se vuelve visible
    if (visible) {
      setScanned(false);
      setIsLoading(false);
    }
  }, [visible]);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setIsLoading(true);
    
    console.log('📱 Código de barras escaneado:', data);
    
    try {
      // Simular un pequeño delay para mostrar el feedback visual
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onBarcodeScanned(data);
      // No cerramos aquí - dejamos que el componente padre maneje el cierre
      // onClose();
    } catch (error) {
      console.error('Error processing barcode:', error);
      Alert.alert('Error', 'Error al procesar el código de barras');
    } finally {
      setIsLoading(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
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
              Necesitamos acceso a tu cámara para escanear códigos de barras
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
          <Text style={styles.title}>{t('food.scanBarcode')}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Scanner */}
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.scanner}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: [
                'ean13',
                'ean8',
                'upc_a',
                'upc_e',
                'code128',
                'code39',
              ],
            }}
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
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.textPrimary} />
              <Text style={styles.loadingText}>Procesando...</Text>
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>{t('modals.instructions') || 'Instructions'}</Text>
          <Text style={styles.instructionsText}>
            • {t('food.barcodeInstruction1') || 'Point the camera at the product barcode'}
          </Text>
          <Text style={styles.instructionsText}>
            • {t('food.barcodeInstruction2') || 'Keep the code inside the scan frame'}
          </Text>
          <Text style={styles.instructionsText}>
            • {t('food.barcodeInstruction3') || 'Scanning will happen automatically'}
          </Text>
        </View>

        {/* Reset button */}
        {scanned && (
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetScanner}
          >
            <Text style={styles.resetButtonText}>Escanear Otro Código</Text>
          </TouchableOpacity>
        )}
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
  
  scannerContainer: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  
  scanner: {
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
  
  resetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  resetButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
});


