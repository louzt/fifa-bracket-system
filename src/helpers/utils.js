/**
 * Archivo de funciones de ayuda para la aplicación
 */

// Función para mensajes de log del servidor
const serverLog = (msg) => {
  console.log(`[SERVER] ${msg}`);
};

// Función para mezclar un array aleatoriamente (algoritmo Fisher-Yates)
function mezclarArray(array) {
  const nuevoArray = [...array];
  for (let i = nuevoArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nuevoArray[i], nuevoArray[j]] = [nuevoArray[j], nuevoArray[i]];
  }
  return nuevoArray;
}

// Función para ordenar jugadores por puntos, diferencia de goles, goles a favor
function ordenarJugadoresPorPuntos(jugadores) {
  return [...jugadores].sort((a, b) => {
    // Ordenar por puntos
    if (b.estadisticas?.puntos !== a.estadisticas?.puntos) {
      return (b.estadisticas?.puntos || 0) - (a.estadisticas?.puntos || 0);
    }
    
    // Si tienen los mismos puntos, ordenar por diferencia de goles
    const difGolA = ((a.estadisticas?.golesFavor || 0) - (a.estadisticas?.golesContra || 0));
    const difGolB = ((b.estadisticas?.golesFavor || 0) - (b.estadisticas?.golesContra || 0));
    if (difGolB !== difGolA) {
      return difGolB - difGolA;
    }
    
    // Si tienen la misma diferencia de goles, ordenar por goles a favor
    return (b.estadisticas?.golesFavor || 0) - (a.estadisticas?.golesFavor || 0);
  });
}

// Función para actualizar estadísticas en grupos
function actualizarEstadisticasEnGrupos(jugadorId, estadisticas) {
  const { db } = require('../db/database');
  
  return db.grupos.find({}).execAsync()
    .then(grupos => {
      const promesas = [];
      
      grupos.forEach(grupo => {
        const jugadorIndex = grupo.jugadores.findIndex(j => j._id === jugadorId);
        
        if (jugadorIndex !== -1) {
          grupo.jugadores[jugadorIndex].estadisticas = {
            ...grupo.jugadores[jugadorIndex].estadisticas || {},
            ...estadisticas
          };
          
          promesas.push(
            db.grupos.update({ _id: grupo._id }, grupo)
          );
        }
      });
      
      return Promise.all(promesas);
    });
}

// Función para actualizar estadísticas después de un partido
async function actualizarEstadisticasAsync(partido) {
  const { db } = require('../db/database');
  
  // Obtener jugadores
  const jugador1 = await db.jugadores.findOne({ _id: partido.jugador1._id });
  const jugador2 = await db.jugadores.findOne({ _id: partido.jugador2._id });
  
  if (!jugador1 || !jugador2) {
    throw new Error('Jugadores no encontrados');
  }
  
  // Inicializar estadísticas si no existen
  if (!jugador1.estadisticas) jugador1.estadisticas = {};
  if (!jugador2.estadisticas) jugador2.estadisticas = {};
  
  // Actualizar partidos jugados
  jugador1.estadisticas.partidosJugados = (jugador1.estadisticas.partidosJugados || 0) + 1;
  jugador2.estadisticas.partidosJugados = (jugador2.estadisticas.partidosJugados || 0) + 1;
  
  // Actualizar victorias, empates, derrotas
  if (partido.resultado.goles1 > partido.resultado.goles2) {
    // Ganó jugador 1
    jugador1.estadisticas.victorias = (jugador1.estadisticas.victorias || 0) + 1;
    jugador1.estadisticas.puntos = (jugador1.estadisticas.puntos || 0) + 3;
    jugador2.estadisticas.derrotas = (jugador2.estadisticas.derrotas || 0) + 1;
  } else if (partido.resultado.goles1 < partido.resultado.goles2) {
    // Ganó jugador 2
    jugador2.estadisticas.victorias = (jugador2.estadisticas.victorias || 0) + 1;
    jugador2.estadisticas.puntos = (jugador2.estadisticas.puntos || 0) + 3;
    jugador1.estadisticas.derrotas = (jugador1.estadisticas.derrotas || 0) + 1;
  } else {
    // Empate
    jugador1.estadisticas.empates = (jugador1.estadisticas.empates || 0) + 1;
    jugador2.estadisticas.empates = (jugador2.estadisticas.empates || 0) + 1;
    jugador1.estadisticas.puntos = (jugador1.estadisticas.puntos || 0) + 1;
    jugador2.estadisticas.puntos = (jugador2.estadisticas.puntos || 0) + 1;
  }
  
  // Actualizar goles
  jugador1.estadisticas.golesFavor = (jugador1.estadisticas.golesFavor || 0) + partido.resultado.goles1;
  jugador1.estadisticas.golesContra = (jugador1.estadisticas.golesContra || 0) + partido.resultado.goles2;
  jugador2.estadisticas.golesFavor = (jugador2.estadisticas.golesFavor || 0) + partido.resultado.goles2;
  jugador2.estadisticas.golesContra = (jugador2.estadisticas.golesContra || 0) + partido.resultado.goles1;
  
  // Guardar cambios
  await db.jugadores.update({ _id: jugador1._id }, jugador1);
  await db.jugadores.update({ _id: jugador2._id }, jugador2);
  
  // Actualizar estadísticas en grupos
  await actualizarEstadisticasEnGrupos(jugador1._id, jugador1.estadisticas);
  await actualizarEstadisticasEnGrupos(jugador2._id, jugador2.estadisticas);
  
  return { jugador1, jugador2 };
}

// Función para generar grupos aleatorios
async function generarGruposAleatorios(jugadores) {
  const { db } = require('../db/database');
  
  // Mezclar aleatoriamente los jugadores
  const jugadoresMezclados = mezclarArray(jugadores);
  
  // Determinar el número de grupos según la cantidad de jugadores
  let numGrupos = 1;
  if (jugadores.length <= 4) numGrupos = 1;
  else if (jugadores.length <= 8) numGrupos = 2;
  else if (jugadores.length <= 12) numGrupos = 3;
  else numGrupos = 4;
  
  // Crear grupos
  const grupos = [];
  for (let i = 0; i < numGrupos; i++) {
    const grupoLetra = String.fromCharCode(65 + i); // A, B, C, D, ...
    grupos.push({
      nombre: `Grupo ${grupoLetra}`,
      jugadores: [],
      partidos: []
    });
  }
  
  // Distribuir jugadores en los grupos
  jugadoresMezclados.forEach((jugador, index) => {
    const grupoIndex = index % numGrupos;
    grupos[grupoIndex].jugadores.push({
      _id: jugador._id,
      nombre: jugador.nombre,
      equipo: jugador.equipo,
      estadisticas: {
        puntos: 0,
        partidosJugados: 0,
        victorias: 0,
        empates: 0,
        derrotas: 0,
        golesFavor: 0,
        golesContra: 0
      }
    });
  });
  
  // Guardar los grupos generados
  await db.grupos.remove({}, { multi: true });
  return Promise.all(grupos.map(grupo => db.grupos.insert(grupo)));
}

// Función para crear estructura de eliminatorias
function crearEstructuraEliminatorias(clasificados) {
  // Implementación personalizada según los clasificados
  // Por simplicidad, se maneja en la ruta específica
  // Ver la implementación completa en la ruta de eliminatorias
  serverLog("Función crearEstructuraEliminatorias llamada - Ver implementación en ruta");
}

// Función para simular partidos de eliminatorias
async function simularPartidosEliminatorias(eliminatorias) {
  // Simulación de partidos de eliminatorias
  // Por simplicidad, se maneja en la ruta específica
  serverLog("Función simularPartidosEliminatorias llamada - Ver implementación en ruta");
}

// Exportar todas las funciones
module.exports = {
  serverLog,
  mezclarArray,
  ordenarJugadoresPorPuntos,
  actualizarEstadisticasEnGrupos,
  actualizarEstadisticasAsync,
  generarGruposAleatorios,
  crearEstructuraEliminatorias,
  simularPartidosEliminatorias
};
