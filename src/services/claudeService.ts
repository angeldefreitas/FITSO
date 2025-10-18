import { FoodAnalysis, ImageType } from '../types/food';
import * as FileSystem from 'expo-file-system/legacy';

class ClaudeService {
  private readonly CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
  private readonly API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;

  async analyzeFoodImage(imageUri: string): Promise<FoodAnalysis> {
    try {
      console.log('🔍 Analizando imagen con Claude...');
      
      // Convertir imagen a base64
      const base64Image = await this.convertImageToBase64(imageUri);
      
      console.log('🌐 Enviando petición a Claude API...');
      console.log('🌐 URL:', this.CLAUDE_API_URL);
      
      const requestBody = {
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analiza esta imagen de comida y proporciona información nutricional detallada. 
                  Responde en formato JSON con la siguiente estructura:
                  {
                    "name": "nombre del plato",
                    "description": "descripción breve",
                    "ingredients": [
                      {
                        "name": "ingrediente",
                        "per100g": {
                          "calories": 0,
                          "proteins": 0,
                          "carbs": 0,
                          "fats": 0
                        },
                        "estimatedWeight": 0,
                        "totalValues": {
                          "calories": 0,
                          "proteins": 0,
                          "carbs": 0,
                          "fats": 0
                        }
                      }
                    ],
                    "totalNutrients": {
                      "calories": 0,
                      "proteins": 0,
                      "carbs": 0,
                      "fats": 0
                    },
                    "message": "success"
                  }
                  
                  Si no detectas comida en la imagen, responde con: {"message": "noFood"}`
                },
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/jpeg',
                    data: base64Image
                  }
                }
              ]
            }
          ]
        };
      
      console.log('📤 Request body (primeros 500 chars):', JSON.stringify(requestBody).substring(0, 500));
      
      const response = await fetch(this.CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error de API: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.content[0].text;
      
      // Parsear la respuesta JSON
      const analysis = JSON.parse(content);
      
      if (analysis.message === 'noFood') {
        return {
          name: '',
          description: '',
          ingredients: [],
          totalNutrients: { calories: 0, proteins: 0, carbs: 0, fats: 0 },
          message: 'noFood'
        };
      }

      return {
        id: `claude_${Date.now()}`,
        name: analysis.name || 'Comida detectada',
        description: analysis.description || '',
        ingredients: analysis.ingredients || [],
        totalNutrients: analysis.totalNutrients || { calories: 0, proteins: 0, carbs: 0, fats: 0 },
        message: analysis.message || 'success',
        isIngredientBased: true,
        createdAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error en análisis de Claude:', error);
      throw new Error('Error al analizar la imagen con Claude');
    }
  }

  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      console.log('📸 Convirtiendo imagen a base64...');
      console.log('📸 URI:', imageUri);
      
      // Usar expo-file-system para leer la imagen en React Native
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });
      
      console.log('✅ Imagen convertida a base64 (tamaño:', base64.length, 'caracteres)');
      return base64;
    } catch (error) {
      console.error('❌ Error convirtiendo imagen a base64:', error);
      throw new Error('Error procesando la imagen');
    }
  }
}

export default new ClaudeService();
