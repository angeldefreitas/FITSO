# Configuración para Render.com

## Variables de Entorno Necesarias

Configura estas variables de entorno en el dashboard de Render:

### Base de Datos (se configuran automáticamente si usas PostgreSQL de Render)
- `DB_HOST` - Host de la base de datos PostgreSQL
- `DB_PORT` - Puerto de la base de datos (usualmente 5432)
- `DB_NAME` - Nombre de la base de datos
- `DB_USER` - Usuario de la base de datos
- `DB_PASSWORD` - Contraseña de la base de datos

### Configuración del Servidor
- `NODE_ENV` = `production`
- `PORT` = `10000` (Render usa este puerto por defecto)
- `JWT_SECRET` = [generar un secret seguro y único]
- `JWT_EXPIRES_IN` = `7d`

### URLs
- `FRONTEND_URL` = URL de tu aplicación frontend
- `BACKEND_URL` = URL de tu backend en Render

### Email (opcional)
- `EMAIL_HOST` = smtp.gmail.com
- `EMAIL_PORT` = 587
- `EMAIL_USER` = tu_email@gmail.com
- `EMAIL_PASS` = tu_app_password

## Pasos de Deployment

1. Conectar repositorio GitHub a Render
2. Seleccionar el directorio `/backend`
3. Configurar variables de entorno
4. Crear base de datos PostgreSQL
5. Deploy automático
