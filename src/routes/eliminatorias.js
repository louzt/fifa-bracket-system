const express = require('express');
const router = express.Router();
const { eliminatoriasDB, gruposDB } = require('../db/database');
const { ordenarJugadoresPorPuntos, serverLog } = require('../helpers/utils');

// GET - Obtener eliminatorias
router.get('/', (req, res) => {
  eliminatoriasDB.findOne({}, (err, eliminatorias) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    res.json(eliminatorias || {});
  });
});

// POST - Generar eliminatorias basado en resultados de grupos
router.post('/generar', (req, res) => {
  gruposDB.find({}).exec((err, grupos) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    
    console.log(`Generando eliminatorias para ${grupos.length} grupos`);
    
    // Verificar si todos los partidos de grupo han sido jugados
    let todosPartidosJugados = true;
    let partidosFaltantes = [];
    
    // Para cada grupo, verificar que todos los jugadores hayan jugado entre sí
    grupos.forEach(grupo => {
      const jugadores = grupo.jugadores;
      
      // Crear todas las combinaciones posibles de partidos
      for (let i = 0; i < jugadores.length; i++) {
        for (let j = i + 1; j < jugadores.length; j++) {
          const partidoJugado = grupo.partidos && grupo.partidos.some(partido => 
            (partido.jugador1._id === jugadores[i]._id && partido.jugador2._id === jugadores[j]._id) || 
            (partido.jugador1._id === jugadores[j]._id && partido.jugador2._id === jugadores[i]._id)
          );
          
          if (!partidoJugado) {
            todosPartidosJugados = false;
            partidosFaltantes.push({
              grupo: grupo.nombre,
              jugador1: jugadores[i].nombre,
              jugador2: jugadores[j].nombre
            });
          }
        }
      }
    });
    
    // Si no se han jugado todos los partidos, devolver un error
    if (!todosPartidosJugados) {
      return res.status(400).json({ 
        error: "No todos los partidos de grupo han sido jugados", 
        partidosFaltantes: partidosFaltantes 
      });
    }
    
    // PASO 1: Obtener los mejores jugadores de cada grupo
    let eliminatorias = {};
    
    // IMPORTANTE: CASO ESPECÍFICO PARA 3 GRUPOS
    if (grupos.length === 3) {
      console.log("CASO ESPECIAL: Detectado torneo con 3 grupos exactamente");
      
      // En este caso, usaremos una estructura fija:
      // - Semifinal 1: 1° del Grupo A vs 2° del Grupo B
      // - Clasificatoria (playoff): 2° del Grupo A vs 2° del Grupo C
      // - Semifinal 2: 1° del Grupo B vs Ganador Clasificatoria
      // - Final: Ganadores de semifinales
      
      // Identificar los grupos A, B y C
      const grupoA = grupos.find(g => g.nombre.includes('A'));
      const grupoB = grupos.find(g => g.nombre.includes('B'));
      const grupoC = grupos.find(g => g.nombre.includes('C'));
      
      if (!grupoA || !grupoB || !grupoC) {
        console.error("Error: No se encontraron los grupos A, B y C");
        return res.status(500).json({ error: "Error al identificar los grupos" });
      }
      
      console.log("Grupos identificados:");
      console.log("Grupo A:", grupoA.nombre);
      console.log("Grupo B:", grupoB.nombre);
      console.log("Grupo C:", grupoC.nombre);
      
      // Obtener los dos mejores jugadores de cada grupo
      const mejoresA = ordenarJugadoresPorPuntos(grupoA.jugadores).slice(0, 2);
      const mejoresB = ordenarJugadoresPorPuntos(grupoB.jugadores).slice(0, 2);
      const mejoresC = ordenarJugadoresPorPuntos(grupoC.jugadores).slice(0, 2);
      
      console.log("Mejores del grupo A:", mejoresA.map(j => j.nombre));
      console.log("Mejores del grupo B:", mejoresB.map(j => j.nombre));
      console.log("Mejores del grupo C:", mejoresC.map(j => j.nombre));
      
      // Crear la estructura con clasificatoria
      eliminatorias = {
        semifinal1: {
          jugador1: mejoresA[0] || null, // 1° Grupo A
          jugador2: mejoresB[1] || null, // 2° Grupo B
          resultado: null
        },
        clasificatoria: {
          jugador1: mejoresA[1] || null, // 2° Grupo A
          jugador2: mejoresC[1] || null, // 2° Grupo C
          resultado: null
        },
        semifinal2: {
          jugador1: mejoresB[0] || null, // 1° Grupo B
          jugador2: null, // Se llenará con el ganador de la clasificatoria
          resultado: null
        },
        final: {
          jugador1: null, // Ganador semifinal1
          jugador2: null, // Ganador semifinal2
          resultado: null
        },
        _id: "ElIMinAtOriasNuevas" // ID especial para identificar la estructura correcta
      };
      
      console.log("Estructura con clasificatoria creada para torneo de 3 grupos");
    } 
    // PASO 2: CASO PARA 1 GRUPO
    else if (grupos.length === 1) {
      // Con 1 grupo, los 4 mejores van a semifinales
      const mejoresJugadores = ordenarJugadoresPorPuntos(grupos[0].jugadores).slice(0, 4);
      
      eliminatorias = {
        semifinal1: {
          jugador1: mejoresJugadores[0] || null,
          jugador2: mejoresJugadores[3] || null,
          resultado: null
        },
        semifinal2: {
          jugador1: mejoresJugadores[1] || null,
          jugador2: mejoresJugadores[2] || null,
          resultado: null
        },
        final: {
          jugador1: null,
          jugador2: null,
          resultado: null
        }
      };
      
      console.log("Estructura creada para torneo de 1 grupo");
    }
    // PASO 3: CASO PARA 2 GRUPOS
    else if (grupos.length === 2) {
      // Con 2 grupos, los 2 mejores de cada grupo van a semifinales
      const mejoresGrupo1 = ordenarJugadoresPorPuntos(grupos[0].jugadores).slice(0, 2);
      const mejoresGrupo2 = ordenarJugadoresPorPuntos(grupos[1].jugadores).slice(0, 2);
      
      eliminatorias = {
        semifinal1: {
          jugador1: mejoresGrupo1[0] || null, // 1° del grupo 1
          jugador2: mejoresGrupo2[1] || null, // 2° del grupo 2
          resultado: null
        },
        semifinal2: {
          jugador1: mejoresGrupo2[0] || null, // 1° del grupo 2
          jugador2: mejoresGrupo1[1] || null, // 2° del grupo 1
          resultado: null
        },
        final: {
          jugador1: null,
          jugador2: null,
          resultado: null
        }
      };
      
      console.log("Estructura creada para torneo de 2 grupos");
    }
    // PASO 4: CASO PARA 4 O MÁS GRUPOS - USAR CUARTOS DE FINAL
    else {
      // Con 4 o más grupos, usamos una estructura con cuartos de final
      // Primero obtenemos los 2 mejores de cada grupo
      let clasificados = [];
      grupos.forEach(grupo => {
        const mejoresDelGrupo = ordenarJugadoresPorPuntos(grupo.jugadores).slice(0, 2);
        clasificados.push({
          primero: mejoresDelGrupo[0] || null,
          segundo: mejoresDelGrupo[1] || null,
          grupo: grupo.nombre
        });
      });
      
      // Aplanamos la lista de clasificados para los emparejamientos
      const jugadoresClasificados = clasificados.flatMap(c => [c.primero, c.segundo]).filter(j => j !== null);
      
      // Si tenemos 8 o más clasificados, usamos cuartos de final
      if (jugadoresClasificados.length >= 8) {
        eliminatorias = {
          cuartos1: {
            jugador1: jugadoresClasificados[0] || null,
            jugador2: jugadoresClasificados[7] || null,
            resultado: null
          },
          cuartos2: {
            jugador1: jugadoresClasificados[3] || null,
            jugador2: jugadoresClasificados[4] || null,
            resultado: null
          },
          cuartos3: {
            jugador1: jugadoresClasificados[2] || null,
            jugador2: jugadoresClasificados[5] || null,
            resultado: null
          },
          cuartos4: {
            jugador1: jugadoresClasificados[1] || null,
            jugador2: jugadoresClasificados[6] || null,
            resultado: null
          },
          semifinal1: {
            jugador1: null,
            jugador2: null,
            resultado: null
          },
          semifinal2: {
            jugador1: null,
            jugador2: null,
            resultado: null
          },
          final: {
            jugador1: null,
            jugador2: null,
            resultado: null
          }
        };
      } else {
        // Si no tenemos suficientes para cuartos, usar semifinales directamente
        eliminatorias = {
          semifinal1: {
            jugador1: jugadoresClasificados[0] || null,
            jugador2: jugadoresClasificados[3] || null,
            resultado: null
          },
          semifinal2: {
            jugador1: jugadoresClasificados[1] || null,
            jugador2: jugadoresClasificados[2] || null,
            resultado: null
          },
          final: {
            jugador1: null,
            jugador2: null,
            resultado: null
          }
        };
      }
      
      console.log(`Estructura creada para torneo de ${grupos.length} grupos`);
    }
    
    // Eliminar eliminatorias existentes
    eliminatoriasDB.remove({}, { multi: true }, () => {
      eliminatoriasDB.insert(eliminatorias, (err, nuevasEliminatorias) => {
        if (err) {
          res.status(500).json({ error: err });
          return;
        }
        res.status(200).json({ 
          message: "Eliminatorias generadas correctamente", 
          eliminatorias: nuevasEliminatorias 
        });
      });
    });
  });
});

// PUT - Actualizar resultado de una fase de eliminatorias
router.put('/:fase', (req, res) => {
  const fase = req.params.fase;
  const resultado = req.body;
  
  eliminatoriasDB.findOne({}, (err, eliminatorias) => {
    if (err || !eliminatorias) {
      res.status(500).json({ error: err || 'No se encontraron eliminatorias' });
      return;
    }
    
    // Verificar que la fase existe
    if (!eliminatorias[fase]) {
      res.status(404).json({ error: `La fase "${fase}" no existe en las eliminatorias` });
      return;
    }
    
    // Actualizar el resultado de la fase
    eliminatorias[fase].resultado = resultado;
    
    // Si es una fase que afecta a otra fase, actualizar también esa fase
    if (fase === 'semifinal1') {
      // El ganador pasa a la final como jugador1
      eliminatorias.final.jugador1 = resultado.goles1 > resultado.goles2 
        ? eliminatorias.semifinal1.jugador1 
        : eliminatorias.semifinal1.jugador2;
    } else if (fase === 'semifinal2') {
      // El ganador pasa a la final como jugador2
      eliminatorias.final.jugador2 = resultado.goles1 > resultado.goles2 
        ? eliminatorias.semifinal2.jugador1 
        : eliminatorias.semifinal2.jugador2;
    } else if (fase === 'clasificatoria' && eliminatorias.semifinal2) {
      // El ganador pasa a semifinal2 como jugador2
      eliminatorias.semifinal2.jugador2 = resultado.goles1 > resultado.goles2 
        ? eliminatorias.clasificatoria.jugador1 
        : eliminatorias.clasificatoria.jugador2;
    } else if (fase.startsWith('cuartos')) {
      // Actualizar semifinales según los resultados de cuartos
      const numCuartos = parseInt(fase.replace('cuartos', ''));
      const semifinalKey = numCuartos <= 2 ? 'semifinal1' : 'semifinal2';
      const jugadorKey = numCuartos % 2 === 1 ? 'jugador1' : 'jugador2';
      
      eliminatorias[semifinalKey][jugadorKey] = resultado.goles1 > resultado.goles2 
        ? eliminatorias[fase].jugador1 
        : eliminatorias[fase].jugador2;
    }
    
    // Guardar las eliminatorias actualizadas
    eliminatoriasDB.update({ _id: eliminatorias._id }, eliminatorias, {}, (err) => {
      if (err) {
        res.status(500).json({ error: err });
        return;
      }
      
      res.json({
        mensaje: `Resultado de ${fase} actualizado correctamente`,
        eliminatorias
      });
    });
  });
});

module.exports = router;
