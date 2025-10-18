# Configuración de Firebase para Fitso

## Pasos para configurar Firebase

### 1. Crear proyecto en Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto llamado "Fitso"
3. Habilita Google Analytics (opcional)

### 2. Configurar Authentication
1. En el panel lateral, ve a "Authentication"
2. Ve a la pestaña "Sign-in method"
3. Habilita "Email/Password"
4. Habilita "Google" (opcional)
5. Habilita "Apple" (opcional)

### 3. Configurar Firestore Database
1. En el panel lateral, ve a "Firestore Database"
2. Crea una base de datos en modo de prueba
3. Configura las reglas de seguridad:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Los usuarios solo pueden leer y escribir sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Configurar Android
1. En Firebase Console, ve a "Project Settings" > "General"
2. En "Your apps", haz clic en "Add app" > "Android"
3. Ingresa el package name: `com.fitso.app` (o el que uses)
4. Descarga el archivo `google-services.json`
5. Coloca el archivo en `android/app/google-services.json`

### 5. Configurar iOS
1. En Firebase Console, ve a "Project Settings" > "General"
2. En "Your apps", haz clic en "Add app" > "iOS"
3. Ingresa el bundle ID: `com.fitso.app` (o el que uses)
4. Descarga el archivo `GoogleService-Info.plist`
5. Coloca el archivo en `ios/Fitso/GoogleService-Info.plist`

### 6. Configurar Google Sign-In (Opcional)
1. En Firebase Console, ve a "Authentication" > "Sign-in method"
2. Habilita "Google"
3. Obtén el Web Client ID
4. Actualiza `src/config/googleSignIn.ts` con tu Web Client ID

### 7. Instalar dependencias
```bash
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
```

### 8. Configurar iOS (CocoaPods)
```bash
cd ios && pod install
```

### 9. Configurar Android (Gradle)
El archivo `android/app/build.gradle` ya debería estar configurado con el plugin de Google Services.

## Estructura de datos en Firestore

### Colección: users
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  createdAt: timestamp,
  lastLoginAt: timestamp,
  isActive: boolean,
  provider: string // 'email', 'google', 'apple'
}
```

## Próximos pasos

1. Configura Firebase siguiendo los pasos anteriores
2. Actualiza las claves de configuración en los archivos correspondientes
3. Prueba la autenticación en la app
4. Configura las reglas de seguridad de Firestore según tus necesidades
