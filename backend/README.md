# Fitso Backend API

Backend para la aplicación Fitso MVP - Sistema de seguimiento de fitness y nutrición.

## 🚀 Características

- **Autenticación JWT** - Login, registro, recuperación de contraseña
- **Gestión de perfiles** - Datos biométricos y objetivos del usuario
- **Seguimiento de progreso** - Peso y agua (datos se almacenan en el backend)
- **Base de datos PostgreSQL** - Almacenamiento seguro de datos esenciales
- **Validación de datos** - Con Joi para validación robusta
- **Seguridad** - Helmet, CORS, validación de entrada
- **Estructura modular** - Fácil mantenimiento y escalabilidad

## 📝 Nota Importante

**Sistema de Alimentos Simplificado**: Los alimentos y comidas ahora se manejan completamente en el frontend usando AsyncStorage local. Esto simplifica el sistema y elimina la complejidad de sincronización entre frontend y backend.

## 📋 Requisitos

- Node.js >= 18.0.0
- PostgreSQL >= 12
- npm o yarn

## 🛠️ Instalación

1. **Clonar e instalar dependencias:**
```bash
cd backend
npm install
```

2. **Configurar variables de entorno:**
```bash
cp env.example .env
# Editar .env con tus credenciales
```

3. **Configurar PostgreSQL:**
```bash
# Crear base de datos y usuario
sudo -u postgres psql
CREATE DATABASE fitso_db;
CREATE USER fitso_user WITH PASSWORD 'fitso_password';
GRANT ALL PRIVILEGES ON DATABASE fitso_db TO fitso_user;
\q
```

4. **Inicializar base de datos:**
```bash
npm run init-db
```

5. **Iniciar servidor:**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🔧 Scripts Disponibles

- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar servidor en desarrollo con nodemon
- `npm run init-db` - Inicializar base de datos
- `npm test` - Ejecutar tests

## 📚 API Endpoints

### Autenticación

#### POST `/api/auth/register`
Registrar nuevo usuario
```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "contraseña123"
}
```

#### POST `/api/auth/login`
Iniciar sesión
```json
{
  "email": "juan@ejemplo.com",
  "password": "contraseña123"
}
```

#### POST `/api/auth/forgot-password`
Solicitar reset de contraseña
```json
{
  "email": "juan@ejemplo.com"
}
```

#### POST `/api/auth/reset-password`
Resetear contraseña
```json
{
  "token": "token_de_reset",
  "password": "nueva_contraseña123"
}
```

#### GET `/api/auth/profile`
Obtener perfil del usuario (requiere autenticación)
```
Authorization: Bearer <jwt_token>
```

#### PUT `/api/auth/profile`
Actualizar perfil del usuario (requiere autenticación)
```json
{
  "name": "Juan Carlos Pérez",
  "email": "juan.carlos@ejemplo.com"
}
```

#### PUT `/api/auth/change-password`
Cambiar contraseña (requiere autenticación)
```json
{
  "currentPassword": "contraseña_actual",
  "newPassword": "nueva_contraseña123"
}
```

#### GET `/api/auth/verify-email/:token`
Verificar email con token

### Otros

#### GET `/api/health`
Health check del servidor

## 🔐 Autenticación

El API usa JWT (JSON Web Tokens) para autenticación. Incluye el token en el header:

```
Authorization: Bearer <tu_jwt_token>
```

## 🗄️ Base de Datos

### Esquema Principal

- **users** - Información de usuarios
- **user_profiles** - Perfiles detallados de usuarios
- **weight_entries** - Seguimiento de peso
- **water_entries** - Seguimiento de agua

### Datos Locales (Frontend)

- **Alimentos** - Base de datos local con AsyncStorage
- **Comidas** - Entradas de comida locales con AsyncStorage

## 🚀 Despliegue

### Variables de Entorno Requeridas

```env
# Servidor
PORT=3000
NODE_ENV=production

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fitso_db
DB_USER=fitso_user
DB_PASSWORD=fitso_password

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRES_IN=7d

# URLs
FRONTEND_URL=https://tu-app.com
BACKEND_URL=https://tu-api.com
```

### Render.com

1. Conectar repositorio
2. Configurar variables de entorno
3. Usar build command: `npm install`
4. Usar start command: `npm start`

## 🧪 Testing

```bash
npm test
```

## 📝 Logs

El servidor registra todas las requests y errores en la consola.

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

MIT License
