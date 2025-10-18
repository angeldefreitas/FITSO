#!/bin/bash

echo "🐘 Configurando PostgreSQL para Fitso Backend"
echo "=============================================="

# Verificar si PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL no está instalado"
    echo "💡 Instala PostgreSQL desde: https://www.postgresql.org/download/"
    exit 1
fi

echo "✅ PostgreSQL encontrado"

# Crear base de datos y usuario
echo "🔧 Creando base de datos y usuario..."

# Crear base de datos
sudo -u postgres psql -c "CREATE DATABASE fitso_db;" 2>/dev/null || echo "⚠️ Base de datos fitso_db ya existe"

# Crear usuario
sudo -u postgres psql -c "CREATE USER fitso_user WITH PASSWORD 'fitso_password';" 2>/dev/null || echo "⚠️ Usuario fitso_user ya existe"

# Otorgar permisos
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE fitso_db TO fitso_user;"

echo "✅ Base de datos y usuario configurados"
echo ""
echo "📝 Configuración de base de datos:"
echo "   Host: localhost"
echo "   Puerto: 5432"
echo "   Base de datos: fitso_db"
echo "   Usuario: fitso_user"
echo "   Contraseña: fitso_password"
echo ""
echo "🚀 Ahora puedes ejecutar: npm run init-db"
