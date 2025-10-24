#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Configurando entorno de desarrollo local...\n');

// Función para crear archivo .env.local si no existe
function setupEnvFile() {
  const envPath = path.join(__dirname, 'backend', '.env.local');
  const examplePath = path.join(__dirname, 'backend', 'env.local.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      console.log('✅ Archivo .env.local creado desde el ejemplo');
      console.log('📝 Por favor, edita backend/.env.local con tus credenciales');
    } else {
      // Crear archivo .env.local básico
      const basicEnv = `NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:8081
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fitso_dev
DB_USER=postgres
DB_PASSWORD=tu_password_aqui
JWT_SECRET=desarrollo_local_secret_key_12345
JWT_EXPIRES_IN=7d`;
      
      fs.writeFileSync(envPath, basicEnv);
      console.log('✅ Archivo .env.local básico creado');
    }
  } else {
    console.log('✅ Archivo .env.local ya existe');
  }
}

// Función para verificar dependencias del backend
function checkBackendDependencies() {
  const backendPath = path.join(__dirname, 'backend');
  const packageJsonPath = path.join(backendPath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ No se encontró package.json en el directorio backend');
    return false;
  }
  
  const nodeModulesPath = path.join(backendPath, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Instalando dependencias del backend...');
    try {
      execSync('npm install', { cwd: backendPath, stdio: 'inherit' });
      console.log('✅ Dependencias del backend instaladas');
    } catch (error) {
      console.error('❌ Error instalando dependencias del backend:', error.message);
      return false;
    }
  } else {
    console.log('✅ Dependencias del backend ya instaladas');
  }
  
  return true;
}

// Función para verificar dependencias del frontend
function checkFrontendDependencies() {
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Instalando dependencias del frontend...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ Dependencias del frontend instaladas');
    } catch (error) {
      console.error('❌ Error instalando dependencias del frontend:', error.message);
      return false;
    }
  } else {
    console.log('✅ Dependencias del frontend ya instaladas');
  }
  
  return true;
}

// Función principal
async function setupLocalDevelopment() {
  try {
    console.log('1️⃣ Configurando archivo de entorno...');
    setupEnvFile();
    
    console.log('\n2️⃣ Verificando dependencias del backend...');
    if (!checkBackendDependencies()) {
      console.error('❌ Error configurando backend');
      process.exit(1);
    }
    
    console.log('\n3️⃣ Verificando dependencias del frontend...');
    if (!checkFrontendDependencies()) {
      console.error('❌ Error configurando frontend');
      process.exit(1);
    }
    
    console.log('\n🎉 ¡Configuración completada!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Edita backend/.env.local con tus credenciales de base de datos');
    console.log('2. Asegúrate de que PostgreSQL esté corriendo');
    console.log('3. Ejecuta: npm run dev');
    console.log('\n🚀 Comandos disponibles:');
    console.log('- npm run dev: Inicia backend y frontend juntos');
    console.log('- npm run backend: Solo backend');
    console.log('- npm run frontend: Solo frontend');
    console.log('- npm run setup: Configura la base de datos');
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    process.exit(1);
  }
}

setupLocalDevelopment();


