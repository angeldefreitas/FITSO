#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando entorno de desarrollo local...\n');

// Función para ejecutar comandos
function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando falló con código ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

// Función para verificar si un puerto está en uso
function checkPort(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(false); // Puerto disponible
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(true); // Puerto en uso
    });
  });
}

async function startDevelopment() {
  try {
    // Verificar si el backend ya está corriendo
    const backendRunning = await checkPort(3000);
    
    if (backendRunning) {
      console.log('✅ Backend ya está corriendo en puerto 3000');
    } else {
      console.log('🔧 Iniciando backend...');
      // Iniciar backend en segundo plano
      const backendProcess = spawn('npm', ['run', 'dev'], {
        cwd: path.join(__dirname, 'backend'),
        stdio: 'pipe',
        shell: true
      });

      // Esperar un poco para que el backend se inicie
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Verificar si Expo ya está corriendo
    const expoRunning = await checkPort(8081);
    
    if (expoRunning) {
      console.log('✅ Expo ya está corriendo en puerto 8081');
    } else {
      console.log('📱 Iniciando Expo...');
      // Iniciar Expo
      await runCommand('npm', ['start'], {
        cwd: __dirname
      });
    }

  } catch (error) {
    console.error('❌ Error iniciando desarrollo:', error.message);
    process.exit(1);
  }
}

// Manejar cierre graceful
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando entorno de desarrollo...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando entorno de desarrollo...');
  process.exit(0);
});

startDevelopment();

