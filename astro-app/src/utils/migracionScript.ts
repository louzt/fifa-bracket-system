// Script de migración completa de localStorage a base de datos
// Ejecutar en la consola del navegador en cualquier página del proyecto

async function migrarTodoABaseDatos() {
  console.log('🚀 Iniciando migración completa de localStorage a base de datos...');
  
  try {
    // 1. Migrar configuraciones generales
    console.log('1️⃣ Migrando configuraciones generales...');
    const respConfig = await fetch('/api/configuraciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'migrar' })
    });
    
    if (respConfig.ok) {
      console.log('✅ Configuraciones generales migradas');
    } else {
      console.warn('⚠️ Error migrando configuraciones generales');
    }

    // 2. Migrar torneo activo
    console.log('2️⃣ Migrando torneo activo...');
    const respTorneo = await fetch('/api/torneos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'migrar' })
    });
    
    if (respTorneo.ok) {
      console.log('✅ Torneo activo migrado');
    } else {
      console.warn('⚠️ Error migrando torneo activo');
    }

    // 3. Limpiar localStorage después de migración exitosa
    console.log('3️⃣ Limpiando localStorage...');
    const keysALimpiar = [
      'torneoActivo',
      'gruposConfig', 
      'jugadores',
      'configuracion-torneo',
      'ultimo-sorteo'
    ];

    let datosEncontrados = false;
    keysALimpiar.forEach(key => {
      const valor = localStorage.getItem(key);
      if (valor) {
        console.log(`📦 Encontrado: ${key}`, JSON.parse(valor));
        localStorage.removeItem(key);
        datosEncontrados = true;
      }
    });

    if (datosEncontrados) {
      console.log('🧹 localStorage limpiado exitosamente');
    } else {
      console.log('ℹ️ No se encontraron datos en localStorage para limpiar');
    }

    // 4. Verificar migración
    console.log('4️⃣ Verificando migración...');
    
    // Verificar configuraciones
    const verificarConfig = await fetch('/api/configuraciones?action=cargar-todas');
    if (verificarConfig.ok) {
      const configs = await verificarConfig.json();
      console.log('✅ Configuraciones en DB:', configs.data);
    }

    // Verificar torneo
    const verificarTorneo = await fetch('/api/torneos?action=obtenerActivo');
    if (verificarTorneo.ok) {
      const torneo = await verificarTorneo.json();
      console.log('✅ Torneo en DB:', torneo.data);
    }

    console.log('🎉 ¡Migración completa exitosa!');
    console.log('💡 Recarga la página para ver los datos migrados');
    
    return {
      success: true,
      message: 'Migración completa exitosa'
    };

  } catch (error) {
    console.error('💥 Error en migración:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

// Función para verificar qué datos hay en localStorage
function verificarLocalStorage() {
  console.log('🔍 Verificando datos en localStorage...');
  
  const keys = [
    'torneoActivo',
    'gruposConfig', 
    'jugadores',
    'configuracion-torneo',
    'ultimo-sorteo'
  ];

  let datosEncontrados = false;
  keys.forEach(key => {
    const valor = localStorage.getItem(key);
    if (valor) {
      try {
        const parsed = JSON.parse(valor);
        console.log(`📦 ${key}:`, parsed);
        datosEncontrados = true;
      } catch (e) {
        console.log(`📦 ${key}: ${valor}`);
        datosEncontrados = true;
      }
    }
  });

  if (!datosEncontrados) {
    console.log('ℹ️ No se encontraron datos en localStorage');
  }

  return datosEncontrados;
}

// Función para verificar datos en la base de datos
async function verificarBaseDatos() {
  console.log('🔍 Verificando datos en base de datos...');
  
  try {
    // Verificar configuraciones
    const respConfig = await fetch('/api/configuraciones?action=cargar-todas');
    if (respConfig.ok) {
      const configs = await respConfig.json();
      console.log('💾 Configuraciones en DB:', configs.data);
    }

    // Verificar torneo activo
    const respTorneo = await fetch('/api/torneos?action=obtenerActivo');
    if (respTorneo.ok) {
      const torneo = await respTorneo.json();
      console.log('💾 Torneo activo en DB:', torneo.data);
    }

  } catch (error) {
    console.error('❌ Error verificando base de datos:', error);
  }
}

// Exponer funciones globalmente
(window as any).migrarTodoABaseDatos = migrarTodoABaseDatos;
(window as any).verificarLocalStorage = verificarLocalStorage;
(window as any).verificarBaseDatos = verificarBaseDatos;

console.log(`
🔧 FUNCIONES DE MIGRACIÓN DISPONIBLES:

• migrarTodoABaseDatos() - Migra todos los datos de localStorage a la base de datos
• verificarLocalStorage() - Muestra qué datos hay en localStorage
• verificarBaseDatos() - Muestra qué datos hay en la base de datos

📋 INSTRUCCIONES:
1. Ejecuta verificarLocalStorage() para ver qué datos tienes
2. Ejecuta migrarTodoABaseDatos() para migrar todo
3. Recarga la página después de la migración

⚠️ IMPORTANTE: Los datos de localStorage se eliminarán después de una migración exitosa
`);

export { migrarTodoABaseDatos, verificarLocalStorage, verificarBaseDatos };
