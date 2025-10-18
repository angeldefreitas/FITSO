#!/bin/bash

echo "🚀 Instalando dependencias para funcionalidades avanzadas de escaneo..."

# Instalar dependencias principales
npm install @react-native-community/netinfo@^11.2.1
npm install react-native-compressor@^1.0.0
npm install react-native-image-crop-picker@^0.40.2
npm install react-native-reanimated@^3.6.2
npm install react-native-vision-camera@^3.8.2

# Para iOS, necesitamos instalar pods
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📱 Instalando pods para iOS..."
    cd ios && pod install && cd ..
fi

echo "✅ Dependencias instaladas correctamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura tu API key de Claude en src/services/claudeService.ts"
echo "2. Ejecuta 'npx expo start' para probar la aplicación"
echo "3. Las nuevas funcionalidades estarán disponibles en el modal de agregar comida"
