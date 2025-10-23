# 🚀 Desarrollo Local - Fitso MVP

Esta guía te ayudará a configurar y ejecutar el proyecto completo en tu máquina local para desarrollo.

## 📋 Prerrequisitos

- Node.js (versión 18 o superior)
- npm o yarn
- PostgreSQL (instalado y corriendo)
- Expo CLI (`npm install -g @expo/cli`)

## ⚡ Configuración Rápida

### 1. Configuración Automática
```bash
# Ejecutar el script de configuración automática
node setup-local-dev.js
```

### 2. Configuración Manual

#### Backend
```bash
# Instalar dependencias del backend
cd backend
npm install

# Configurar variables de entorno
cp env.local.example .env.local
# Editar .env.local con tus credenciales

# Inicializar base de datos
npm run init-db
```

#### Frontend
```bash
# Instalar dependencias del frontend
npm install
```

## 🚀 Comandos de Desarrollo

### Iniciar Todo (Recomendado)
```bash
# Inicia backend y frontend simultáneamente
npm run dev
```

### Comandos Individuales
```bash
# Solo backend
npm run backend

# Solo frontend
npm run frontend

# Frontend en modo localhost (para simuladores)
npm run dev:local
```

### Configuración de Base de Datos
```bash
# Configurar base de datos
npm run setup
```

## 🔧 Configuración de Base de Datos

### PostgreSQL Local
1. Instala PostgreSQL en tu sistema
2. Crea una base de datos llamada `fitso_dev`
3. Actualiza las credenciales en `backend/.env.local`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fitso_dev
DB_USER=tu_usuario
DB_PASSWORD=tu_password
```

### Variables de Entorno Importantes
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:8081
JWT_SECRET=tu_secret_key_aqui
```

## 📱 Uso con Simuladores

### iOS Simulator
```bash
npm run dev:local
# Luego presiona 'i' para abrir iOS Simulator
```

### Android Emulator
```bash
npm run dev:local
# Luego presiona 'a' para abrir Android Emulator
```

### Dispositivo Físico
```bash
npm run dev
# Escanea el código QR con Expo Go
```

## 🌐 URLs de Desarrollo

- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health
- **Frontend**: http://localhost:8081 (Expo DevTools)

## 🔍 Verificación

### Verificar Backend
```bash
curl http://localhost:3000/api/health
```

### Verificar Frontend
- Abre http://localhost:8081 en tu navegador
- Deberías ver la interfaz de Expo DevTools

## 🐛 Solución de Problemas

### Backend no inicia
1. Verifica que PostgreSQL esté corriendo
2. Revisa las credenciales en `.env.local`
3. Asegúrate de que el puerto 3000 esté libre

### Frontend no se conecta al backend
1. Verifica que el backend esté corriendo en puerto 3000
2. Revisa la consola para errores de CORS
3. Asegúrate de que `FRONTEND_URL` esté configurado correctamente

### Simulador no tiene internet
- Usa `npm run dev:local` en lugar de `npm run dev`
- O cambia a dispositivo físico con Expo Go

## 📊 Estructura del Proyecto

```
fit-mvp/
├── backend/                 # Servidor Node.js/Express
│   ├── src/
│   │   ├── routes/         # Rutas de la API
│   │   ├── models/         # Modelos de base de datos
│   │   ├── controllers/    # Controladores
│   │   └── server.js       # Servidor principal
│   └── .env.local         # Variables de entorno
├── src/                    # Aplicación React Native
│   ├── components/         # Componentes reutilizables
│   ├── screens/           # Pantallas de la app
│   ├── services/          # Servicios (API, etc.)
│   └── contexts/          # Contextos de React
└── package.json           # Scripts de desarrollo
```

## 🎯 Funcionalidades Disponibles en Local

- ✅ Registro de usuarios
- ✅ Login/Logout
- ✅ Perfil de usuario
- ✅ Progreso de peso y agua
- ✅ Búsqueda de alimentos
- ✅ Escaneo de códigos de barras
- ✅ Base de datos local completa

## 🚀 Próximos Pasos

1. Ejecuta `node setup-local-dev.js`
2. Configura tu base de datos PostgreSQL
3. Ejecuta `npm run dev`
4. ¡Comienza a desarrollar! 🎉

---

**Nota**: Este setup está optimizado para desarrollo local. Para producción, usa la configuración de Render.

