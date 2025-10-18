import { useState } from 'react';
import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MediaData } from '../types/food';

const useImagePicker = () => {
  const [localImageUriArray, setLocalImageUriArray] = useState<MediaData[]>([]);
  const [imageModal, setImageModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const accessGallery = async (
    cropperCircleOverlay: boolean = true,
    crooper: boolean = true,
    mediaType: 'photo' | 'video' | 'any' = 'any',
  ): Promise<MediaData[] | undefined> => {
    setLoading(true);
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        setLoading(false);
        Alert.alert(
          'Permisos de Galería',
          'Necesitamos acceso a tu galería para seleccionar fotos. Por favor, permite el acceso en Configuración.',
          [
            {
              text: 'Cancelar',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {
              text: 'Ir a Configuración',
              onPress: async () => {
                Linking.openSettings();
              },
            },
          ],
          { cancelable: false },
        );
        return undefined;
      }
      
      // Abrir selector de imágenes
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: false,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        const mediaData: MediaData = {
          data: null,
          height: asset.height || 0,
          width: asset.width || 0,
          filename: asset.fileName || 'image.jpg',
          mime: 'image/jpeg',
          path: asset.uri,
          image: asset.uri,
          uri: asset.uri,
          success: true,
          error: false,
        };

        setLocalImageUriArray([mediaData]);
        setLoading(false);
        return [mediaData];
      }
      
      setLoading(false);
      return undefined;
    } catch (err: any) {
      console.error('Error al seleccionar imagen:', err);
      Alert.alert('Error', 'Error al seleccionar imagen de la galería');
      setLoading(false);
      return undefined;
    }
  };

  const accessCamera = async (
    cropperCircleOverlay: boolean = true,
    mediaType: 'photo' | 'video' | 'any' = 'any',
  ): Promise<MediaData[] | undefined> => {
    try {
      // Solicitar permisos de cámara
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos',
          'Permiso de cámara no concedido.',
          [
            {
              text: 'Ok',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {
              text: 'Configuración',
              onPress: async () => {
                Linking.openSettings();
              },
            },
          ],
          { cancelable: false },
        );
        return;
      }

      // Abrir cámara
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: cropperCircleOverlay,
        aspect: cropperCircleOverlay ? [1, 1] : undefined,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        const mediaData: MediaData = {
          data: null,
          height: asset.height || 0,
          width: asset.width || 0,
          filename: asset.fileName || 'camera_image.jpg',
          mime: 'image/jpeg',
          path: asset.uri,
          image: asset.uri,
          uri: asset.uri,
          success: true,
          error: false,
        };

        setLocalImageUriArray([mediaData]);
        return [mediaData];
      }
      
      return undefined;
    } catch (error: any) {
      console.log(error.message);
      Alert.alert('Error', 'Error al abrir la cámara');
      return undefined;
    }
  };

  const compressSingleImage = async (
    imageUrls: MediaData[],
  ): Promise<MediaData[]> => {
    // Para Expo, no necesitamos compresión adicional
    return imageUrls;
  };

  const compressImageSize = async (image: MediaData): Promise<MediaData> => {
    // Para Expo, no necesitamos compresión adicional
    return image;
  };

  return {
    accessGallery,
    accessCamera,
    setLocalImageUriArray,
    localImageUriArray,
    loading,
    setImageModal,
    imageModal,
  };
};

export default useImagePicker;
