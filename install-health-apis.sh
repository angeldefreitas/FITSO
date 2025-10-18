#!/bin/bash

echo "🏥 Instalando APIs de Salud en Producción..."
echo "================================================"
echo ""
echo "📋 ESTADO ACTUAL:"
echo "✅ APIs Web (Fitbit, Garmin, Samsung) - LISTAS PARA USAR"
echo "⚠️  APIs Nativas (Apple Health, Google Fit) - REQUIEREN CONFIGURACIÓN ADICIONAL"
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instálalo primero."
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instálalo primero."
    exit 1
fi

echo "✅ Node.js y npm detectados"

# Instalar dependencias
echo "📦 Instalando dependencias de APIs de salud..."

npm install react-native-health@^1.19.0
npm install react-native-google-fit@^0.22.0
npm install axios@^1.6.0
npm install react-native-keychain@^8.1.3
npm install expo-auth-session@~5.5.2
npm install expo-crypto@~13.0.2
npm install expo-web-browser@~13.0.3

echo "✅ Dependencias instaladas"

# Configurar iOS (si está en macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Configurando iOS..."
    
    # Verificar si Xcode está instalado
    if command -v xcode-select &> /dev/null; then
        echo "✅ Xcode detectado"
        
        # Instalar CocoaPods si no está instalado
        if ! command -v pod &> /dev/null; then
            echo "📦 Instalando CocoaPods..."
            sudo gem install cocoapods
        fi
        
        # Instalar dependencias de iOS
        if [ -d "ios" ]; then
            cd ios
            pod install
            cd ..
            echo "✅ Dependencias de iOS instaladas"
        else
            echo "⚠️  Directorio ios no encontrado. Ejecuta 'expo run:ios' para crear el proyecto iOS."
        fi
    else
        echo "⚠️  Xcode no detectado. Instálalo desde el App Store para desarrollo iOS."
    fi
else
    echo "⚠️  No estás en macOS. La configuración de iOS se saltará."
fi

# Configurar Android
echo "🤖 Configurando Android..."

# Verificar si Android SDK está disponible
if [ -d "$ANDROID_HOME" ] || [ -d "$ANDROID_SDK_ROOT" ]; then
    echo "✅ Android SDK detectado"
else
    echo "⚠️  Android SDK no detectado. Asegúrate de tener Android Studio instalado."
fi

# Crear archivo .env de ejemplo
echo "📝 Creando archivo de configuración de ejemplo..."

cat > .env.example << EOF
# Configuración de APIs de Salud
# Copia este archivo a .env y reemplaza con tus credenciales reales

# Fitbit API
FITBIT_CLIENT_ID=YOUR_FITBIT_CLIENT_ID
FITBIT_CLIENT_SECRET=YOUR_FITBIT_CLIENT_SECRET
FITBIT_REDIRECT_URI=exp://127.0.0.1:19000/--/auth/fitbit

# Garmin Connect API
GARMIN_CONSUMER_KEY=YOUR_GARMIN_CONSUMER_KEY
GARMIN_CONSUMER_SECRET=YOUR_GARMIN_CONSUMER_SECRET

# Samsung Health API
SAMSUNG_CLIENT_ID=YOUR_SAMSUNG_CLIENT_ID
SAMSUNG_CLIENT_SECRET=YOUR_SAMSUNG_CLIENT_SECRET
EOF

# Crear archivo .gitignore si no existe
if [ ! -f ".gitignore" ]; then
    echo "📝 Creando .gitignore..."
    cat > .gitignore << EOF
# Dependencies
node_modules/
.expo/

# Environment variables
.env
.env.local
.env.production

# iOS
ios/build/
*.xcuserdata

# Android
android/app/build/
android/.gradle/
android/local.properties

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# next.js build output
.next
EOF
fi

echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo ""
echo "🚀 PARA EMPEZAR RÁPIDO (APIs Web):"
echo "1. Configura Fitbit API (más fácil):"
echo "   - Ve a https://dev.fitbit.com/apps"
echo "   - Crea una aplicación"
echo "   - Copia .env.example a .env y agrega tus credenciales"
echo ""
echo "2. Prueba la sincronización:"
echo "   - Ejecuta: npx expo start"
echo "   - Ve a Pasos → Sincronizar dispositivo → Fitbit"
echo "   - Completa la autenticación web"
echo ""
echo "📱 PARA APIS NATIVAS (Apple Health, Google Fit):"
echo "3. Lee HEALTH_APIS_REAL_SETUP.md para instrucciones detalladas"
echo "4. Configura development build o ejecta el proyecto"
echo ""
echo "📚 DOCUMENTACIÓN:"
echo "- HEALTH_APIS_REAL_SETUP.md - Guía paso a paso"
echo "- HEALTH_APIS_SETUP.md - Documentación completa"
echo ""
echo "⚠️  IMPORTANTE:"
echo "- Las APIs web (Fitbit, Garmin, Samsung) funcionan inmediatamente"
echo "- Las APIs nativas requieren configuración adicional"
echo "- Prueba primero con Fitbit para verificar que todo funciona"
echo ""
echo "🚀 ¡Tu app ahora puede sincronizar con APIs reales de salud!"
