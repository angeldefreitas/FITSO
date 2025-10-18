import { useState } from 'react';
import { Alert } from 'react-native';
import claudeService from '../services/claudeService';
import { FoodAnalysis, ImageType } from '../types/food';

export const useScan = () => {
  const [scanLoading, setScanLoading] = useState(false);
  
  const scanPicture = async (localimgUrl: string): Promise<FoodAnalysis | null> => {
    setScanLoading(true);
    
    try {
      console.log('🔍 Iniciando proceso de escaneo de comida con Claude...');
      console.log('URI de imagen local:', localimgUrl);
      
      // Analizar la imagen con Claude
      const foodAnalysis = await claudeService.analyzeFoodImage(localimgUrl);
      console.log('✅ Resultado del análisis:', foodAnalysis);
      
      // Verificar si Claude detectó comida
      if (foodAnalysis.message === "noFood") {
        Alert.alert(
          'No se detectó comida',
          'No se detectó comida en la imagen proporcionada. Intenta con otra foto.'
        );
        return null;
      }

      // Agregar imagen al análisis
      const completeFood: FoodAnalysis = {
        ...foodAnalysis,
        image: {
          uri: localimgUrl,
          thumbnail: localimgUrl
        }
      };
      
      return completeFood;
      
    } catch (err) {
      console.error('❌ Error en flujo de escaneo:', err);
      Alert.alert(
        'Error',
        'Error al procesar la imagen. Intenta nuevamente.'
      );
      return null;
    } finally {
      setScanLoading(false);
    }
  };
  
  return { scanPicture, scanLoading };
};
