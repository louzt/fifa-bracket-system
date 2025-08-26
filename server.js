const express = require('express');
const path = require('path');
const Datastore = require('nedb');
const app = express();
const PORT = process.env.PORT || 3003;

// Función para mensajes de log
const serverLog = (msg) => {
  console.log(`[SERVER] ${msg}`);
};

// Bases de datos
const jugadoresDB = new Datastore({ filename: './data/jugadores.db', autoload: true });
const partidosDB = new Datastore({ filename: './data/partidos.db', autoload: true });
const gruposDB = new Datastore({ filename: './data/grupos.db', autoload: true });
const eliminatoriasDB = new Datastore({ filename: './data/eliminatorias.db', autoload: true });
const sorteoDB = require('./data/sorteo.db.js'); // Base de datos para el sorteo de equipos
const equiposFIFA = require('./data/equipos.js'); // Lista de equipos de FIFA

// Configuración del servidor
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Rutas para servir archivos HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/grupos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'grupos.html'));
});

app.get('/eliminatorias', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'eliminatorias.html'));
});

app.get('/estadisticas', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'estadisticas.html'));
});

// API - Jugadores
app.get('/api/jugadores', (req, res) => {
  jugadoresDB.find({}).sort({ nombre: 1 }).exec((err, docs) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    res.json(docs);
  });
});

app.get('/api/jugadores/:id', (req, res) => {
  const id = req.params.id;
  
  jugadoresDB.findOne({ _id: id }, (err, jugador) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    if (!jugador) {
      res.status(404).json({ error: 'Jugador no encontrado' });
      return;
    }
    res.json(jugador);
  });
});

app.post('/api/jugadores', (req, res) => {
  const jugador = req.body;
  jugador.victorias = 0;
  jugador.empates = 0;
  jugador.derrotas = 0;
  jugador.golesFavor = 0;
  jugador.golesContra = 0;
  jugador.puntos = 0;
  jugadoresDB.insert(jugador, (err, nuevoJugador) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    res.status(201).json(nuevoJugador);
  });
});

app.put('/api/jugadores/:id', (req, res) => {
  const id = req.params.id;
  const datosActualizados = req.body;
  
  jugadoresDB.update({ _id: id }, { $set: datosActualizados }, {}, (err, numReemplazados) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    if (numReemplazados === 0) {
      res.status(404).json({ error: 'Jugador no encontrado' });
      return;
    }
    res.json({ success: true, message: 'Jugador actualizado' });
  });
});

app.delete('/api/jugadores/:id', (req, res) => {
  const id = req.params.id;
  
  jugadoresDB.remove({ _id: id }, {}, (err, numRemoved) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    if (numRemoved === 0) {
      res.status(404).json({ error: 'Jugador no encontrado' });
      return;
    }
    res.json({ success: true, message: 'Jugador eliminado' });
  });
});

// API - Partidos
app.get('/api/partidos', (req, res) => {
  partidosDB.find({}).sort({ fecha: -1 }).exec((err, docs) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    res.json(docs);
  });
});

app.post('/api/partidos', (req, res) => {
  const partido = req.body;
  partido.fecha = new Date();
  
  partidosDB.insert(partido, (err, nuevoPartido) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    
    // Actualizar estadísticas de jugadores
    actualizarEstadisticas(partido);
    
    // Actualizar partidos en el grupo correspondiente
    if (partido.grupo) {
      gruposDB.findOne({ nombre: `Grupo ${partido.grupo}` }, (err, grupo) => {
        if (err || !grupo) {
          console.error("Error al buscar el grupo:", err || "Grupo no encontrado");
          res.status(201).json(nuevoPartido);
          return;
        }
        
        // Agregar el partido al array de partidos del grupo
        if (!grupo.partidos) grupo.partidos = [];
        grupo.partidos.push(nuevoPartido);
        
        // Actualizar el grupo en la base de datos
        gruposDB.update({ _id: grupo._id }, { $set: { partidos: grupo.partidos } }, {}, (err) => {
          if (err) {
            console.error("Error al actualizar partidos del grupo:", err);
          }
          res.status(201).json(nuevoPartido);
        });
      });
    } else {
      res.status(201).json(nuevoPartido);
    }
  });
});

// API - Grupos
app.get('/api/grupos', async (req, res) => {
  try {
    // Obtener todos los grupos
    const grupos = await new Promise((resolve, reject) => {
      gruposDB.find({}).exec((err, docs) => {
        if (err) reject(err);
        else resolve(docs);
      });
    });
    
    // Obtener todos los partidos
    const partidos = await new Promise((resolve, reject) => {
      partidosDB.find({}).exec((err, docs) => {
        if (err) reject(err);
        else resolve(docs);
      });
    });
    
    // Para cada grupo, asociar sus partidos correspondientes
    const gruposConPartidos = grupos.map(grupo => {
      // Buscar partidos que pertenecen a este grupo
      const partidosGrupo = partidos.filter(partido => {
        // Verificar si el partido pertenece a este grupo
        return partido.grupo && partido.grupo === grupo.nombre.replace('Grupo ', '');
      });
      
      // Asegurarse de que el grupo tenga un array de partidos
      if (!grupo.partidos || !Array.isArray(grupo.partidos)) {
        grupo.partidos = [];
      }
      
      // Añadir los partidos encontrados si no están ya en el grupo
      partidosGrupo.forEach(partido => {
        const yaExiste = grupo.partidos.some(p => p._id === partido._id);
        if (!yaExiste) {
          grupo.partidos.push(partido);
        }
      });
      
      return grupo;
    });
    
    res.json(gruposConPartidos);
  } catch (error) {
    console.error("Error al cargar los grupos con sus partidos:", error);
    res.status(500).json({ error: "Error al cargar los datos de los grupos" });
  }
});

// API - Sincronizar datos de jugadores con grupos
app.post('/api/grupos/sincronizar', (req, res) => {
  // Obtener todos los jugadores actualizados
  jugadoresDB.find({}).exec((err, jugadores) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    
    // Obtener todos los grupos
    gruposDB.find({}).exec((err, grupos) => {
      if (err) {
        res.status(500).json({ error: err });
        return;
      }
      
      let actualizaciones = 0;
      
      // Para cada grupo, actualizar las estadísticas de sus jugadores
      grupos.forEach(grupo => {
        if (!grupo.jugadores || grupo.jugadores.length === 0) return;
        
        for (let i = 0; i < grupo.jugadores.length; i++) {
          // Buscar el jugador actualizado por ID
          const jugadorActualizado = jugadores.find(j => j._id === grupo.jugadores[i]._id);
          
          if (jugadorActualizado) {
            // Actualizar estadísticas del jugador en el grupo
            grupo.jugadores[i] = {
              ...grupo.jugadores[i],
              puntos: jugadorActualizado.puntos,
              victorias: jugadorActualizado.victorias,
              empates: jugadorActualizado.empates,
              derrotas: jugadorActualizado.derrotas,
              golesFavor: jugadorActualizado.golesFavor,
              golesContra: jugadorActualizado.golesContra
            };
            actualizaciones++;
          }
        }
        
        // Guardar el grupo actualizado
        gruposDB.update({ _id: grupo._id }, { $set: { jugadores: grupo.jugadores } }, {});
      });
      
      res.json({ 
        success: true, 
        message: `Datos sincronizados: ${actualizaciones} jugadores actualizados en grupos.` 
      });
    });
  });
});

app.post('/api/grupos/generar', (req, res) => {
  // Lógica para generar grupos
  jugadoresDB.find({}).exec((err, jugadores) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    
    // Eliminar grupos existentes
    gruposDB.remove({}, { multi: true }, () => {
      const jugadoresAleatorios = mezclarArray([...jugadores]);
      const totalJugadores = jugadoresAleatorios.length;
      
      // Determinar la estructura de grupos según el número de jugadores
      let grupos = [];
      
      if (totalJugadores <= 6) {
        // Hasta 6 jugadores: un solo grupo
        grupos = [
          { nombre: 'Grupo A', jugadores: jugadoresAleatorios, partidos: [] }
        ];
      } else if (totalJugadores <= 8) {
        // 7-8 jugadores: dos grupos de tamaño similar
        const mitad = Math.ceil(totalJugadores / 2);
        grupos = [
          { nombre: 'Grupo A', jugadores: jugadoresAleatorios.slice(0, mitad), partidos: [] },
          { nombre: 'Grupo B', jugadores: jugadoresAleatorios.slice(mitad), partidos: [] }
        ];
      } else if (totalJugadores <= 12) {
        // 9-12 jugadores: crear grupos equilibrados
        if (totalJugadores === 9) {
          // 9 jugadores: 3 grupos de 3 (perfecto)
          grupos = [
            { nombre: 'Grupo A', jugadores: jugadoresAleatorios.slice(0, 3), partidos: [] },
            { nombre: 'Grupo B', jugadores: jugadoresAleatorios.slice(3, 6), partidos: [] },
            { nombre: 'Grupo C', jugadores: jugadoresAleatorios.slice(6, 9), partidos: [] }
          ];
        } else if (totalJugadores === 10) {
          // 10 jugadores: 2 grupos de 3 y 1 grupo de 4
          grupos = [
            { nombre: 'Grupo A', jugadores: jugadoresAleatorios.slice(0, 3), partidos: [] },
            { nombre: 'Grupo B', jugadores: jugadoresAleatorios.slice(3, 6), partidos: [] },
            { nombre: 'Grupo C', jugadores: jugadoresAleatorios.slice(6, 10), partidos: [] }
          ];
        } else if (totalJugadores === 11) {
          // 11 jugadores: 2 grupos de 4 y 1 grupo de 3
          grupos = [
            { nombre: 'Grupo A', jugadores: jugadoresAleatorios.slice(0, 4), partidos: [] },
            { nombre: 'Grupo B', jugadores: jugadoresAleatorios.slice(4, 8), partidos: [] },
            { nombre: 'Grupo C', jugadores: jugadoresAleatorios.slice(8, 11), partidos: [] }
          ];
        } else {
          // 12 jugadores: 3 grupos de 4 (perfecto)
          grupos = [
            { nombre: 'Grupo A', jugadores: jugadoresAleatorios.slice(0, 4), partidos: [] },
            { nombre: 'Grupo B', jugadores: jugadoresAleatorios.slice(4, 8), partidos: [] },
            { nombre: 'Grupo C', jugadores: jugadoresAleatorios.slice(8, 12), partidos: [] }
          ];
        }
      } else {
        // 13+ jugadores: cuatro grupos
        const tamañoPromedio = Math.ceil(totalJugadores / 4);
        grupos = [
          { nombre: 'Grupo A', jugadores: jugadoresAleatorios.slice(0, tamañoPromedio), partidos: [] },
          { nombre: 'Grupo B', jugadores: jugadoresAleatorios.slice(tamañoPromedio, 2*tamañoPromedio), partidos: [] },
          { nombre: 'Grupo C', jugadores: jugadoresAleatorios.slice(2*tamañoPromedio, 3*tamañoPromedio), partidos: [] },
          { nombre: 'Grupo D', jugadores: jugadoresAleatorios.slice(3*tamañoPromedio), partidos: [] }
        ];
        // Eliminar grupos vacíos
        grupos = grupos.filter(g => g.jugadores.length > 0);
      }
      
      gruposDB.insert(grupos, (err, nuevosGrupos) => {
        if (err) {
          res.status(500).json({ error: err });
          return;
        }
        res.json(nuevosGrupos);
      });
    });
  });
});

// API - Eliminatorias
app.get('/api/eliminatorias', (req, res) => {
  // Buscar específicamente la estructura con ID ElIMinAtOriasNuevas
  eliminatoriasDB.find({_id: "ElIMinAtOriasNuevas"}).exec(async (err, docsNuevos) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    
    // Si encontramos la estructura nueva, usar esa
    if (docsNuevos.length > 0) {
      console.log("Usando estructura específica con formato correcto de clasificatoria");
      res.json(docsNuevos);
      return;
    }
    
    // Buscar todas las estructuras si no encontramos la específica
    eliminatoriasDB.find({}).exec(async (err, docs) => {
      if (err) {
        res.status(500).json({ error: err });
        return;
      }
      
      // Verificar si tenemos datos y si la estructura es la correcta para 3 grupos
      if (docs.length > 0) {
        const elim = docs[0];
      
      // Si estamos en un torneo de 3 grupos pero la estructura tiene cuartos,
      // necesitamos corregirla
      const tieneCuartos = elim.hasOwnProperty('cuartos1');
      const tieneClasificatoria = elim.hasOwnProperty('clasificatoria');
      
      // En un torneo de 3 grupos, deberíamos tener clasificatoria y no cuartos
      const estructuraIncorrecta = tieneCuartos && !tieneClasificatoria;
      
      if (estructuraIncorrecta) {
        console.log("Detectada estructura incorrecta en eliminatorias, corrigiendo...");
        
        // Crear la estructura correcta con clasificatoria
        // Primero obtener los grupos para verificar los clasificados
        const grupos = await new Promise((resolve) => {
          gruposDB.find({}).exec((err, docs) => {
            if (err) resolve([]);
            else resolve(docs);
          });
        });
        
        const numGrupos = grupos.length;
        console.log(`Detectados ${numGrupos} grupos en la base de datos`);
        
        if (numGrupos === 3) {
          console.log("Corrigiendo estructura para torneo de 3 grupos");
          
          // Borrar la estructura actual
          await new Promise((resolve) => {
            eliminatoriasDB.remove({}, { multi: true }, (err) => {
              resolve();
            });
          });
          
          // Crear la estructura correcta
          const nuevaEstructura = {
            semifinal1: {
              jugador1: elim.semifinal1?.jugador1 || null, 
              jugador2: elim.semifinal1?.jugador2 || null,
              resultado: elim.semifinal1?.resultado || null
            },
            clasificatoria: {
              jugador1: elim.cuartos2?.jugador2 || null,
              jugador2: elim.cuartos3?.jugador2 || null,
              resultado: null
            },
            semifinal2: {
              jugador1: elim.semifinal2?.jugador1 || null,
              jugador2: null, // Se llenará con el ganador de la clasificatoria
              resultado: elim.semifinal2?.resultado || null
            },
            final: {
              jugador1: null, // Ganador semifinal1
              jugador2: null, // Ganador semifinal2
              resultado: null
            }
          };
          
          // Insertar la estructura corregida
          await new Promise((resolve) => {
            eliminatoriasDB.insert(nuevaEstructura, (err) => {
              resolve();
            });
          });
          
          // Obtener la estructura actualizada
          const docsActualizados = await new Promise((resolve) => {
            eliminatoriasDB.find({}).exec((err, docs) => {
              if (err) resolve([]);
              else resolve(docs);
            });
          });
          
          res.json(docsActualizados);
          return;
        }
      }
    }
    
    res.json(docs);
      });
    });
});

app.post('/api/eliminatorias/generar', (req, res) => {
  // Lógica para generar eliminatorias basado en los resultados de los grupos
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
    
    // Limpiar eliminatorias anteriores y guardar las nuevas
    eliminatoriasDB.remove({}, { multi: true }, () => {
      eliminatoriasDB.insert(eliminatorias, (err, doc) => {
        if (err) {
          res.status(500).json({ error: err });
          return;
        }
        res.status(200).json({ message: "Eliminatorias generadas correctamente", eliminatorias: doc });
      });
    });
        octavos1: {
          jugador1: clasificados[0]?.jugador || null,
          jugador2: clasificados[15]?.jugador || null,
          resultado: null
        },
        octavos2: {
          jugador1: clasificados[7]?.jugador || null,
          jugador2: clasificados[8]?.jugador || null,
          resultado: null
        },
        octavos3: {
          jugador1: clasificados[3]?.jugador || null,
          jugador2: clasificados[12]?.jugador || null,
          resultado: null
        },
        octavos4: {
          jugador1: clasificados[4]?.jugador || null,
          jugador2: clasificados[11]?.jugador || null,
          resultado: null
        },
        octavos5: {
          jugador1: clasificados[5]?.jugador || null,
          jugador2: clasificados[10]?.jugador || null,
          resultado: null
        },
        octavos6: {
          jugador1: clasificados[2]?.jugador || null,
          jugador2: clasificados[13]?.jugador || null,
          resultado: null
        },
        octavos7: {
          jugador1: clasificados[6]?.jugador || null,
          jugador2: clasificados[9]?.jugador || null,
          resultado: null
        },
        octavos8: {
          jugador1: clasificados[1]?.jugador || null,
          jugador2: clasificados[14]?.jugador || null,
          resultado: null
        },
        cuartos1: {
          jugador1: null, // Ganador octavos1
          jugador2: null, // Ganador octavos2
          resultado: null
        },
        cuartos2: {
          jugador1: null, // Ganador octavos3
          jugador2: null, // Ganador octavos4
          resultado: null
        },
        cuartos3: {
          jugador1: null, // Ganador octavos5
          jugador2: null, // Ganador octavos6
          resultado: null
        },
        cuartos4: {
          jugador1: null, // Ganador octavos7
          jugador2: null, // Ganador octavos8
          resultado: null
        },
        semifinal1: {
          jugador1: null, // Ganador cuartos1
          jugador2: null, // Ganador cuartos2
          resultado: null
        },
        semifinal2: {
          jugador1: null, // Ganador cuartos3
          jugador2: null, // Ganador cuartos4
          resultado: null
        },
        final: {
          jugador1: null, // Ganador semifinal1
          jugador2: null, // Ganador semifinal2
          resultado: null
        }
      };
      
      // Ajustar según la cantidad de clasificados
      if (clasificados.length < 16) {
        // Aquí se podrían hacer más ajustes según sea necesario
        // Por simplicidad, dejamos la estructura aunque algunos jugadores sean null
      }
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

app.put('/api/eliminatorias/:fase', (req, res) => {
  const fase = req.params.fase;
  const resultado = req.body;
  
  eliminatoriasDB.findOne({}, (err, eliminatorias) => {
    if (err || !eliminatorias) {
      res.status(500).json({ error: err || 'No se encontraron eliminatorias' });
      return;
    }
    
    if (!eliminatorias[fase]) {
      res.status(404).json({ error: 'Fase no encontrada' });
      return;
    }
    
    // Actualizar resultado de la fase
    eliminatorias[fase].resultado = resultado;
    
    // Si es clasificatoria o semifinal, actualizar siguiente fase
    if (fase === 'clasificatoria') {
      // Manejar tanto el caso de estructura con clasificatoria definida como el de cuartos
      if (eliminatorias.clasificatoria && eliminatorias.clasificatoria.jugador1 && eliminatorias.clasificatoria.jugador2) {
        // Estructura normal con jugadores definidos en clasificatoria
        const ganador = resultado.golesJugador1 > resultado.golesJugador2 ? 
          eliminatorias.clasificatoria.jugador1 : eliminatorias.clasificatoria.jugador2;
        eliminatorias.semifinal2.jugador2 = ganador;
      } else if (resultado.jugador1Nombre && resultado.jugador2Nombre) {
        // Si no hay jugadores en clasificatoria pero tenemos los nombres (caso de estructura con cuartos)
        // Buscar los jugadores correspondientes en los cuartos
        const nombreGanador = resultado.golesJugador1 > resultado.golesJugador2 ? resultado.jugador1Nombre : resultado.jugador2Nombre;
        let jugadorGanador = null;
        
        // Buscar el jugador ganador en todos los partidos de cuartos
        ['cuartos1', 'cuartos2', 'cuartos3', 'cuartos4'].forEach(cuarto => {
          if (eliminatorias[cuarto]) {
            if (eliminatorias[cuarto].jugador1 && eliminatorias[cuarto].jugador1.nombre === nombreGanador) {
              jugadorGanador = eliminatorias[cuarto].jugador1;
            } else if (eliminatorias[cuarto].jugador2 && eliminatorias[cuarto].jugador2.nombre === nombreGanador) {
              jugadorGanador = eliminatorias[cuarto].jugador2;
            }
          }
        });
        
        if (jugadorGanador) {
          eliminatorias.semifinal2.jugador2 = jugadorGanador;
          // Si no existe la clasificatoria, la creamos
          if (!eliminatorias.clasificatoria) eliminatorias.clasificatoria = {};
          eliminatorias.clasificatoria.resultado = resultado;
        }
      }
    } else if (fase === 'semifinal1') {
      const ganador = resultado.golesJugador1 > resultado.golesJugador2 ? 
        eliminatorias.semifinal1.jugador1 : eliminatorias.semifinal1.jugador2;
      eliminatorias.final.jugador1 = ganador;
    } else if (fase === 'semifinal2') {
      const ganador = resultado.golesJugador1 > resultado.golesJugador2 ? 
        eliminatorias.semifinal2.jugador1 : eliminatorias.semifinal2.jugador2;
      eliminatorias.final.jugador2 = ganador;
    }
    
    eliminatoriasDB.update({ _id: eliminatorias._id }, eliminatorias, {}, (err) => {
      if (err) {
        res.status(500).json({ error: err });
        return;
      }
      res.json(eliminatorias);
    });
  });
});

// Funciones de utilidad
function actualizarEstadisticas(partido) {
  const { jugador1, jugador2, golesJugador1, golesJugador2, grupo } = partido;
  
  if (!jugador1 || !jugador2 || !jugador1._id || !jugador2._id) {
    console.error("Error: Datos de jugadores incompletos en el partido", partido);
    return;
  }
  
  // Actualizar estadísticas en la tabla de jugadores
  jugadoresDB.findOne({ _id: jugador1._id }, (err, jugador1Actual) => {
    if (err || !jugador1Actual) {
      console.error("Error actualizando estadísticas de jugador1:", err || "Jugador no encontrado");
      return;
    }
    
    const actualizacionJugador1 = {
      golesFavor: jugador1Actual.golesFavor + golesJugador1,
      golesContra: jugador1Actual.golesContra + golesJugador2,
    };
    
    if (golesJugador1 > golesJugador2) {
      actualizacionJugador1.victorias = jugador1Actual.victorias + 1;
      actualizacionJugador1.puntos = jugador1Actual.puntos + 3;
    } else if (golesJugador1 === golesJugador2) {
      actualizacionJugador1.empates = jugador1Actual.empates + 1;
      actualizacionJugador1.puntos = jugador1Actual.puntos + 1;
    } else {
      actualizacionJugador1.derrotas = jugador1Actual.derrotas + 1;
    }
    
    jugadoresDB.update({ _id: jugador1Actual._id }, { $set: actualizacionJugador1 }, {}, (err) => {
      if (err) console.error("Error al actualizar estadísticas del jugador 1:", err);
      
      // También actualizar las estadísticas del jugador en los grupos
      if (grupo) {
        actualizarEstadisticasEnGrupos(jugador1._id, actualizacionJugador1);
      }
    });
  });
  
  jugadoresDB.findOne({ _id: jugador2._id }, (err, jugador2Actual) => {
    if (err || !jugador2Actual) {
      console.error("Error actualizando estadísticas de jugador2:", err || "Jugador no encontrado");
      return;
    }
    
    const actualizacionJugador2 = {
      golesFavor: jugador2Actual.golesFavor + golesJugador2,
      golesContra: jugador2Actual.golesContra + golesJugador1,
    };
    
    if (golesJugador2 > golesJugador1) {
      actualizacionJugador2.victorias = jugador2Actual.victorias + 1;
      actualizacionJugador2.puntos = jugador2Actual.puntos + 3;
    } else if (golesJugador1 === golesJugador2) {
      actualizacionJugador2.empates = jugador2Actual.empates + 1;
      actualizacionJugador2.puntos = jugador2Actual.puntos + 1;
    } else {
      actualizacionJugador2.derrotas = jugador2Actual.derrotas + 1;
    }
    
    jugadoresDB.update({ _id: jugador2Actual._id }, { $set: actualizacionJugador2 }, {}, (err) => {
      if (err) console.error("Error al actualizar estadísticas del jugador 2:", err);
      
      // También actualizar las estadísticas del jugador en los grupos
      if (grupo) {
        actualizarEstadisticasEnGrupos(jugador2._id, actualizacionJugador2);
      }
    });
  });
}

// Versión asincrónica para actualizar estadísticas
async function actualizarEstadisticasAsync(partido) {
  if (!partido || !partido.jugador1 || !partido.jugador2) {
    console.error("Error: Datos de partido incompletos", partido);
    return false;
  }

  const { jugador1, jugador2, golesJugador1, golesJugador2, grupo } = partido;
  
  if (!jugador1._id || !jugador2._id) {
    console.error("Error: IDs de jugadores no encontrados", { jugador1, jugador2 });
    return false;
  }
  
  // Actualizar jugador 1
  await new Promise((resolve, reject) => {
    jugadoresDB.findOne({ _id: jugador1._id }, (err, jugador1Actual) => {
      if (err || !jugador1Actual) {
        console.error("Error actualizando estadísticas de jugador1:", err || "Jugador no encontrado", jugador1);
        return resolve(); // Continuamos aunque haya error
      }
      
      const actualizacionJugador1 = {
        golesFavor: jugador1Actual.golesFavor + golesJugador1,
        golesContra: jugador1Actual.golesContra + golesJugador2,
      };
      
      if (golesJugador1 > golesJugador2) {
        actualizacionJugador1.victorias = jugador1Actual.victorias + 1;
        actualizacionJugador1.puntos = jugador1Actual.puntos + 3;
      } else if (golesJugador1 === golesJugador2) {
        actualizacionJugador1.empates = jugador1Actual.empates + 1;
        actualizacionJugador1.puntos = jugador1Actual.puntos + 1;
      } else {
        actualizacionJugador1.derrotas = jugador1Actual.derrotas + 1;
      }
      
      jugadoresDB.update({ _id: jugador1Actual._id }, { $set: actualizacionJugador1 }, {}, (err) => {
        if (err) console.error("Error al actualizar estadísticas del jugador 1:", err);
        resolve();
      });
    });
  });
  
  // Actualizar jugador 2
  await new Promise((resolve, reject) => {
    jugadoresDB.findOne({ _id: jugador2._id }, (err, jugador2Actual) => {
      if (err || !jugador2Actual) {
        console.error("Error actualizando estadísticas de jugador2:", err || "Jugador no encontrado", jugador2);
        return resolve(); // Continuamos aunque haya error
      }
      
      const actualizacionJugador2 = {
        golesFavor: jugador2Actual.golesFavor + golesJugador2,
        golesContra: jugador2Actual.golesContra + golesJugador1,
      };
      
      if (golesJugador2 > golesJugador1) {
        actualizacionJugador2.victorias = jugador2Actual.victorias + 1;
        actualizacionJugador2.puntos = jugador2Actual.puntos + 3;
      } else if (golesJugador1 === golesJugador2) {
        actualizacionJugador2.empates = jugador2Actual.empates + 1;
        actualizacionJugador2.puntos = jugador2Actual.puntos + 1;
      } else {
        actualizacionJugador2.derrotas = jugador2Actual.derrotas + 1;
      }
      
      jugadoresDB.update({ _id: jugador2Actual._id }, { $set: actualizacionJugador2 }, {}, (err) => {
        if (err) console.error("Error al actualizar estadísticas del jugador 2:", err);
        resolve();
      });
    });
  });
  
  return true;
}

// Función para actualizar estadísticas del jugador dentro de los grupos
function actualizarEstadisticasEnGrupos(jugadorId, estadisticas) {
  gruposDB.find({}, (err, grupos) => {
    if (err) {
      console.error("Error buscando grupos:", err);
      return;
    }
    
    grupos.forEach(grupo => {
      let actualizado = false;
      
      // Buscar el jugador en el grupo
      if (grupo.jugadores && grupo.jugadores.length > 0) {
        for (let i = 0; i < grupo.jugadores.length; i++) {
          if (grupo.jugadores[i]._id === jugadorId) {
            // Actualizar estadísticas
            grupo.jugadores[i] = { ...grupo.jugadores[i], ...estadisticas };
            actualizado = true;
            break;
          }
        }
      }
      
      // Si se actualizó algún jugador, guardar el grupo
      if (actualizado) {
        gruposDB.update({ _id: grupo._id }, { $set: { jugadores: grupo.jugadores } }, {}, (err) => {
          if (err) console.error(`Error actualizando grupo ${grupo.nombre}:`, err);
        });
      }
    });
  });
}

function mezclarArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function ordenarJugadoresPorPuntos(jugadores) {
  return [...jugadores].sort((a, b) => {
    // Ordenar primero por puntos
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    
    // En caso de empate, por diferencia de goles
    const difGolA = a.golesFavor - a.golesContra;
    const difGolB = b.golesFavor - b.golesContra;
    if (difGolB !== difGolA) return difGolB - difGolA;
    
    // En caso de empate, por goles a favor
    return b.golesFavor - a.golesFavor;
  });
}

// API - Equipos y Sorteo
app.get('/api/equipos', (req, res) => {
  res.json(equiposFIFA);
});

// Obtener los equipos disponibles (no asignados)
app.get('/api/sorteo/disponibles', async (req, res) => {
  try {
    // Obtener equipos ya asignados
    const asignados = await new Promise((resolve, reject) => {
      sorteoDB.find({}, (err, docs) => {
        if (err) reject(err);
        else resolve(docs);
      });
    });
    
    // IDs de equipos ya asignados
    const idsAsignados = asignados.map(doc => doc.equipoId);
    
    // Filtrar equipos disponibles
    const disponibles = equiposFIFA.filter(equipo => !idsAsignados.includes(equipo.id));
    
    res.json(disponibles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener equipos asignados
app.get('/api/sorteo/asignados', (req, res) => {
  sorteoDB.find({}).exec((err, docs) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    res.json(docs);
  });
});

// Asignar equipo a jugador
app.post('/api/sorteo/asignar', (req, res) => {
  const { jugadorId, equipoId } = req.body;
  
  if (!jugadorId || !equipoId) {
    return res.status(400).json({ error: 'Se requiere jugadorId y equipoId' });
  }
  
  // Verificar si el equipo ya está asignado
  sorteoDB.findOne({ equipoId }, (err, doc) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    
    if (doc) {
      return res.status(400).json({ error: 'El equipo ya está asignado a otro jugador' });
    }
    
    // Verificar si el jugador ya tiene un equipo asignado
    sorteoDB.findOne({ jugadorId }, (err, doc) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
      
      if (doc) {
        // Actualizar el equipo del jugador
        sorteoDB.update({ jugadorId }, { $set: { equipoId } }, {}, (err) => {
          if (err) {
            return res.status(500).json({ error: err });
          }
          
          // Actualizar el equipo en la base de datos de jugadores
          const equipo = equiposFIFA.find(e => e.id === equipoId);
          jugadoresDB.update({ _id: jugadorId }, { $set: { equipo: equipo.nombre } }, {}, (err) => {
            if (err) {
              return res.status(500).json({ error: err });
            }
            
            res.json({ message: 'Equipo actualizado correctamente' });
          });
        });
      } else {
        // Crear nuevo registro
        const registro = {
          jugadorId,
          equipoId,
          fecha: new Date()
        };
        
        sorteoDB.insert(registro, (err, doc) => {
          if (err) {
            return res.status(500).json({ error: err });
          }
          
          // Actualizar el equipo en la base de datos de jugadores
          const equipo = equiposFIFA.find(e => e.id === equipoId);
          jugadoresDB.update({ _id: jugadorId }, { $set: { equipo: equipo.nombre } }, {}, (err) => {
            if (err) {
              return res.status(500).json({ error: err });
            }
            
            res.json(doc);
          });
        });
      }
    });
  });
});

// Sortear un equipo al azar entre los disponibles
app.post('/api/sorteo/aleatorio', async (req, res) => {
  try {
    const { jugadorId } = req.body;
    
    if (!jugadorId) {
      return res.status(400).json({ error: 'Se requiere jugadorId' });
    }
    
    // Obtener equipos disponibles
    const asignados = await new Promise((resolve, reject) => {
      sorteoDB.find({}, (err, docs) => {
        if (err) reject(err);
        else resolve(docs);
      });
    });
    
    // IDs de equipos ya asignados
    const idsAsignados = asignados.map(doc => doc.equipoId);
    
    // Filtrar equipos disponibles
    const disponibles = equiposFIFA.filter(equipo => !idsAsignados.includes(equipo.id));
    
    if (disponibles.length === 0) {
      return res.status(400).json({ error: 'No hay equipos disponibles' });
    }
    
    // Seleccionar un equipo al azar
    const equipoSeleccionado = disponibles[Math.floor(Math.random() * disponibles.length)];
    
    // Verificar si el jugador ya tiene un equipo asignado
    sorteoDB.findOne({ jugadorId }, (err, doc) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
      
      if (doc) {
        // Actualizar el equipo del jugador
        sorteoDB.update({ jugadorId }, { $set: { equipoId: equipoSeleccionado.id } }, {}, (err) => {
          if (err) {
            return res.status(500).json({ error: err });
          }
          
          // Actualizar el equipo en la base de datos de jugadores
          jugadoresDB.update({ _id: jugadorId }, { $set: { equipo: equipoSeleccionado.nombre } }, {}, (err) => {
            if (err) {
              return res.status(500).json({ error: err });
            }
            
            res.json({ 
              message: 'Equipo sorteado correctamente',
              equipo: equipoSeleccionado
            });
          });
        });
      } else {
        // Crear nuevo registro
        const registro = {
          jugadorId,
          equipoId: equipoSeleccionado.id,
          fecha: new Date()
        };
        
        sorteoDB.insert(registro, (err, doc) => {
          if (err) {
            return res.status(500).json({ error: err });
          }
          
          // Actualizar el equipo en la base de datos de jugadores
          jugadoresDB.update({ _id: jugadorId }, { $set: { equipo: equipoSeleccionado.nombre } }, {}, (err) => {
            if (err) {
              return res.status(500).json({ error: err });
            }
            
            res.json({ 
              message: 'Equipo sorteado correctamente',
              equipo: equipoSeleccionado
            });
          });
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sortear equipos para todos los jugadores
app.post('/api/sorteo/todos', async (req, res) => {
  try {
    // Obtener todos los jugadores
    const jugadores = await new Promise((resolve, reject) => {
      jugadoresDB.find({}).exec((err, docs) => {
        if (err) reject(err);
        else resolve(docs);
      });
    });
    
    if (jugadores.length === 0) {
      return res.status(400).json({ error: 'No hay jugadores registrados' });
    }
    
    // Mezclar equipos
    const equiposMezclados = mezclarArray([...equiposFIFA]);
    
    // Asignar equipos
    const resultados = [];
    for (let i = 0; i < jugadores.length && i < equiposMezclados.length; i++) {
      const jugador = jugadores[i];
      const equipo = equiposMezclados[i];
      
      // Registrar asignación
      await new Promise((resolve, reject) => {
        sorteoDB.remove({ jugadorId: jugador._id }, { multi: true }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      const registro = {
        jugadorId: jugador._id,
        equipoId: equipo.id,
        fecha: new Date()
      };
      
      await new Promise((resolve, reject) => {
        sorteoDB.insert(registro, (err, doc) => {
          if (err) reject(err);
          else resolve(doc);
        });
      });
      
      // Actualizar el equipo del jugador
      await new Promise((resolve, reject) => {
        jugadoresDB.update({ _id: jugador._id }, { $set: { equipo: equipo.nombre } }, {}, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      resultados.push({
        jugador: jugador.nombre,
        equipo: equipo.nombre
      });
    }
    
    res.json({
      message: 'Sorteo completado correctamente',
      resultados
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resetear sorteo
app.post('/api/sorteo/reset', (req, res) => {
  sorteoDB.remove({}, { multi: true }, (err) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    
    res.json({ message: 'Sorteo reseteado correctamente' });
  });
});

// API endpoints para administración del torneo
app.post('/api/torneo/reset', (req, res) => {
  // Primero reiniciar las estadísticas de los jugadores
  jugadoresDB.find({}, (errFind, jugadores) => {
    if (errFind) {
      return res.status(500).json({ error: errFind, message: 'Error al buscar jugadores para reiniciar estadísticas' });
    }
    
    // Para cada jugador, reiniciar sus estadísticas
    const actualizaciones = jugadores.map(jugador => {
      return new Promise((resolve, reject) => {
        // Reiniciar estadísticas pero mantener nombre y equipo
        jugadoresDB.update({ _id: jugador._id }, { 
          $set: { 
            victorias: 0, 
            empates: 0, 
            derrotas: 0, 
            golesFavor: 0, 
            golesContra: 0, 
            puntos: 0 
          } 
        }, {}, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
    
    // Esperar a que todas las actualizaciones terminen
    Promise.all(actualizaciones)
      .then(() => {
        // Eliminar grupos
        gruposDB.remove({}, { multi: true }, (errGrupos) => {
          if (errGrupos) {
            return res.status(500).json({ error: errGrupos, message: 'Error al eliminar grupos' });
          }
          
          // Eliminar eliminatorias
          eliminatoriasDB.remove({}, { multi: true }, (errEliminatorias) => {
            if (errEliminatorias) {
              return res.status(500).json({ error: errEliminatorias, message: 'Error al eliminar eliminatorias' });
            }
            
            // Eliminar partidos
            partidosDB.remove({}, { multi: true }, (errPartidos) => {
              if (errPartidos) {
                return res.status(500).json({ error: errPartidos, message: 'Error al eliminar partidos' });
              }
              
              res.json({ 
                success: true,
                message: 'Torneo reseteado correctamente: se han eliminado todos los grupos, eliminatorias y partidos y reiniciado las estadísticas de los jugadores' 
              });
            });
          });
        });
      })
      .catch(err => {
        res.status(500).json({ error: err, message: 'Error al reiniciar estadísticas de jugadores' });
      });
  });
});

// Resetear todo (elimina jugadores, grupos, eliminatorias, partidos y sorteo)
app.post('/api/torneo/reset-completo', (req, res) => {
  // Eliminar jugadores
  jugadoresDB.remove({}, { multi: true }, (errJugadores) => {
    if (errJugadores) {
      return res.status(500).json({ error: errJugadores, message: 'Error al eliminar jugadores' });
    }
    
    // Eliminar grupos
    gruposDB.remove({}, { multi: true }, (errGrupos) => {
      if (errGrupos) {
        return res.status(500).json({ error: errGrupos, message: 'Error al eliminar grupos' });
      }
      
      // Eliminar eliminatorias
      eliminatoriasDB.remove({}, { multi: true }, (errEliminatorias) => {
        if (errEliminatorias) {
          return res.status(500).json({ error: errEliminatorias, message: 'Error al eliminar eliminatorias' });
        }
        
        // Eliminar partidos
        partidosDB.remove({}, { multi: true }, (errPartidos) => {
          if (errPartidos) {
            return res.status(500).json({ error: errPartidos, message: 'Error al eliminar partidos' });
          }
          
          // Eliminar sorteo
          sorteoDB.remove({}, { multi: true }, (errSorteo) => {
            if (errSorteo) {
              return res.status(500).json({ error: errSorteo, message: 'Error al eliminar sorteo' });
            }
            
            res.json({ 
              success: true,
              message: 'Reinicio completo: se han eliminado todos los jugadores, grupos, eliminatorias, partidos y sorteos' 
            });
          });
        });
      });
    });
  });
});

// Simular torneo completo
app.post('/api/torneo/simular', async (req, res) => {
  try {
    // 1. Resetear torneo para empezar desde cero
    await new Promise((resolve, reject) => {
      // Eliminar grupos
      gruposDB.remove({}, { multi: true }, (errGrupos) => {
        if (errGrupos) reject(errGrupos);
        
        // Eliminar eliminatorias
        eliminatoriasDB.remove({}, { multi: true }, (errEliminatorias) => {
          if (errEliminatorias) reject(errEliminatorias);
          
          // Eliminar partidos
          partidosDB.remove({}, { multi: true }, (errPartidos) => {
            if (errPartidos) reject(errPartidos);
            else resolve();
          });
        });
      });
    });

    // 2. Reiniciar estadísticas de jugadores
    const jugadores = await new Promise((resolve, reject) => {
      jugadoresDB.find({}).exec((err, docs) => {
        if (err) reject(err);
        else resolve(docs);
      });
    });
    
    if (jugadores.length === 0) {
      return res.status(400).json({ 
        error: 'No hay jugadores registrados para simular el torneo',
        message: 'Debes registrar jugadores antes de simular un torneo' 
      });
    }
    
    // Reiniciar estadísticas
    await Promise.all(jugadores.map(jugador => {
      return new Promise((resolve, reject) => {
        jugadoresDB.update({ _id: jugador._id }, { 
          $set: { 
            victorias: 0, 
            empates: 0, 
            derrotas: 0, 
            golesFavor: 0, 
            golesContra: 0, 
            puntos: 0 
          } 
        }, {}, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }));
    
    serverLog("Jugadores encontrados: " + jugadores.length);
    serverLog("Iniciando simulación de torneo...");
    
    // Resultado de la simulación para enviar al cliente
    const resultadoSimulacion = {
      grupos: [],
      partidos: {
        fase_grupos: [],
        eliminatorias: []
      },
      ganador: null,
      mensaje: ''
    };
    
    // 3. Generar grupos aleatorios
    const gruposCreados = await generarGruposAleatorios(jugadores);
    resultadoSimulacion.grupos = gruposCreados.map(g => ({
      nombre: g.nombre,
      jugadores: g.jugadores.map(j => ({
        nombre: j.nombre,
        equipo: j.equipo,
        puntos: j.puntos
      }))
    }));
    
    serverLog(`${gruposCreados.length} grupos generados con éxito`);
    
    // 4. Simular partidos de grupos (cada jugador contra cada uno en su grupo)
    for (const grupo of gruposCreados) {
      for (let i = 0; i < grupo.jugadores.length; i++) {
        for (let j = i + 1; j < grupo.jugadores.length; j++) {
          // Simular partido
          const golesJugador1 = Math.floor(Math.random() * 5);
          const golesJugador2 = Math.floor(Math.random() * 5);
          
          // Crear objeto de partido
          const partido = {
            fecha: new Date(),
            jugador1: grupo.jugadores[i],
            jugador2: grupo.jugadores[j],
            golesJugador1: golesJugador1,
            golesJugador2: golesJugador2,
            grupo: grupo.nombre.replace('Grupo ', '')
          };
          
          // Registrar partido
          await new Promise((resolve, reject) => {
            partidosDB.insert(partido, (err, nuevoPart) => {
              if (err) reject(err);
              else resolve(nuevoPart);
            });
          });
          
          // Actualizar estadísticas
          await actualizarEstadisticasAsync(partido);
          
          // Añadir a los resultados
          resultadoSimulacion.partidos.fase_grupos.push({
            grupo: grupo.nombre,
            jugador1: grupo.jugadores[i].nombre,
            jugador2: grupo.jugadores[j].nombre,
            resultado: `${golesJugador1} - ${golesJugador2}`
          });
        }
      }
    }
    
    serverLog("Partidos de grupo simulados correctamente");
    
    // 5. Actualizar clasificaciones de grupos
    for (const grupo of gruposCreados) {
      // Obtener jugadores actualizados
      const jugadoresActualizados = await new Promise((resolve, reject) => {
        jugadoresDB.find({ _id: { $in: grupo.jugadores.map(j => j._id) } }).exec((err, docs) => {
          if (err) reject(err);
          else resolve(docs);
        });
      });
      
      // Actualizar grupo
      grupo.jugadores = jugadoresActualizados;
      
      await new Promise((resolve, reject) => {
        gruposDB.update({ nombre: grupo.nombre }, grupo, {}, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    // 6. Generar eliminatorias según clasificación
    // Obtener clasificados de cada grupo
    const clasificados = [];
    
    serverLog("Generando clasificados para eliminatorias...");
    
    // Verificar si tenemos específicamente 3 grupos
    const nombresGrupos = gruposCreados.map(g => g.nombre);
    serverLog("Grupos detectados: " + nombresGrupos.join(', '));
    const tieneGrupoA = nombresGrupos.includes('Grupo A');
    const tieneGrupoB = nombresGrupos.includes('Grupo B');
    const tieneGrupoC = nombresGrupos.includes('Grupo C');
    const tieneTresGruposABC = tieneGrupoA && tieneGrupoB && tieneGrupoC && gruposCreados.length === 3;
    
    serverLog("¿Tiene estructura de 3 grupos (A, B, C)? " + (tieneTresGruposABC ? "SÍ" : "NO"));
    
    for (const grupo of gruposCreados) {
      const jugadoresOrdenados = ordenarJugadoresPorPuntos(grupo.jugadores);
      
      // Determinar cuántos clasifican por grupo
      let numClasificados = 2;
      if (gruposCreados.length === 1) {
        numClasificados = Math.min(4, jugadoresOrdenados.length);
      }
      
      // Agregar los clasificados
      for (let i = 0; i < numClasificados && i < jugadoresOrdenados.length; i++) {
        clasificados.push({
          jugador: jugadoresOrdenados[i],
          posicion: i + 1,
          grupo: grupo.nombre
        });
      }
    }
    
    serverLog(`${clasificados.length} jugadores clasificados a eliminatorias`);
    
    // 7. Simular eliminatorias
    let eliminatorias = crearEstructuraEliminatorias(clasificados);
    
    // Verificar si la estructura es correcta (debe tener clasificatoria para 3 grupos)
    const estructuraCorrecta = tieneTresGruposABC ? eliminatorias.hasOwnProperty('clasificatoria') : true;
    
    if (!estructuraCorrecta) {
      serverLog("ERROR: Se detectaron 3 grupos pero no se creó la estructura con clasificatoria. Rehaciendo...");
      
      // Forzar la creación de la estructura correcta
      eliminatorias = {
        semifinal1: {
          jugador1: null, 
          jugador2: null,
          resultado: null
        },
        clasificatoria: {
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
    }
    
    // Guardar estructura de eliminatorias
    await new Promise((resolve, reject) => {
      eliminatoriasDB.insert(eliminatorias, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // 8. Simular partidos de eliminatorias
    const ganador = await simularPartidosEliminatorias(eliminatorias);
    
    if (!ganador) {
      console.log("Advertencia: No se pudo determinar un ganador en las eliminatorias");
      resultadoSimulacion.mensaje = "El torneo ha sido simulado, pero no se pudo determinar un campeón.";
    } else {
      resultadoSimulacion.ganador = {
        nombre: ganador.nombre,
        equipo: ganador.equipo
      };
      
      resultadoSimulacion.mensaje = `¡Torneo simulado con éxito! ${ganador.nombre} es el campeón.`;
    }
    
    res.json(resultadoSimulacion);
    
  } catch (error) {
    console.error("Error en la simulación del torneo:", error);
    res.status(500).json({ 
      error: error.message || error, 
      mensaje: "Error al simular el torneo" 
    });
  }
});

// Función auxiliar para generar grupos aleatorios
async function generarGruposAleatorios(jugadores) {
  const jugadoresAleatorios = mezclarArray([...jugadores]);
  const totalJugadores = jugadoresAleatorios.length;
  
  // Determinar la estructura de grupos según el número de jugadores
  let gruposNuevos = [];
  
  if (totalJugadores <= 6) {
    // Hasta 6 jugadores: un solo grupo
    gruposNuevos = [
      { nombre: 'Grupo A', jugadores: jugadoresAleatorios, partidos: [] }
    ];
  } else if (totalJugadores <= 8) {
    // 7-8 jugadores: dos grupos de tamaño similar
    const mitad = Math.ceil(totalJugadores / 2);
    gruposNuevos = [
      { nombre: 'Grupo A', jugadores: jugadoresAleatorios.slice(0, mitad), partidos: [] },
      { nombre: 'Grupo B', jugadores: jugadoresAleatorios.slice(mitad), partidos: [] }
    ];
  } else if (totalJugadores <= 12) {
    // 9-12 jugadores: crear grupos equilibrados
    if (totalJugadores === 9) {
      // 9 jugadores: 3 grupos de 3 (perfecto)
      gruposNuevos = [
        { nombre: 'Grupo A', jugadores: jugadoresAleatorios.slice(0, 3), partidos: [] },
        { nombre: 'Grupo B', jugadores: jugadoresAleatorios.slice(3, 6), partidos: [] },
        { nombre: 'Grupo C', jugadores: jugadoresAleatorios.slice(6, 9), partidos: [] }
      ];
    } else if (totalJugadores === 10) {
      // 10 jugadores: 2 grupos de 3 y 1 grupo de 4
      gruposNuevos = [
        { nombre: 'Grupo A', jugadores: jugadoresAleatorios.slice(0, 3), partidos: [] },
        { nombre: 'Grupo B', jugadores: jugadoresAleatorios.slice(3, 6), partidos: [] },
        { nombre: 'Grupo C', jugadores: jugadoresAleatorios.slice(6, 10), partidos: [] }
      ];
    } else if (totalJugadores === 11) {
      // 11 jugadores: 2 grupos de 4 y 1 grupo de 3
      gruposNuevos = [
        { nombre: 'Grupo A', jugadores: jugadoresAleatorios.slice(0, 4), partidos: [] },
        { nombre: 'Grupo B', jugadores: jugadoresAleatorios.slice(4, 8), partidos: [] },
        { nombre: 'Grupo C', jugadores: jugadoresAleatorios.slice(8, 11), partidos: [] }
      ];
    } else {
      // 12 jugadores: 3 grupos de 4 (perfecto)
      gruposNuevos = [
        { nombre: 'Grupo A', jugadores: jugadoresAleatorios.slice(0, 4), partidos: [] },
        { nombre: 'Grupo B', jugadores: jugadoresAleatorios.slice(4, 8), partidos: [] },
        { nombre: 'Grupo C', jugadores: jugadoresAleatorios.slice(8, 12), partidos: [] }
      ];
    }
  } else {
    // 13+ jugadores: cuatro grupos
    const tamañoPromedio = Math.ceil(totalJugadores / 4);
    gruposNuevos = [
      { nombre: 'Grupo A', jugadores: jugadoresAleatorios.slice(0, tamañoPromedio), partidos: [] },
      { nombre: 'Grupo B', jugadores: jugadoresAleatorios.slice(tamañoPromedio, 2*tamañoPromedio), partidos: [] },
      { nombre: 'Grupo C', jugadores: jugadoresAleatorios.slice(2*tamañoPromedio, 3*tamañoPromedio), partidos: [] },
      { nombre: 'Grupo D', jugadores: jugadoresAleatorios.slice(3*tamañoPromedio), partidos: [] }
    ];
    // Eliminar grupos vacíos
    gruposNuevos = gruposNuevos.filter(g => g.jugadores.length > 0);
  }
  
  // Guardar grupos en la base de datos
  return new Promise((resolve, reject) => {
    gruposDB.insert(gruposNuevos, (err, nuevosGrupos) => {
      if (err) reject(err);
      else resolve(nuevosGrupos);
    });
  });
}

// Función para crear la estructura de eliminatorias según los clasificados
function crearEstructuraEliminatorias(clasificados) {
  let eliminatorias = {};
  
  // Determinar el número de grupos basado en los clasificados
  const gruposUnicos = [...new Set(clasificados.map(c => c.grupo))];
  const numGrupos = gruposUnicos.length;
  console.log(`Grupos detectados: ${numGrupos} (${gruposUnicos.join(', ')})`);
  console.log(`Total clasificados: ${clasificados.length}`);
  
  // Verificar explícitamente si tenemos grupos A, B y C
  const tieneGrupoA = clasificados.some(c => c.grupo === 'Grupo A');
  const tieneGrupoB = clasificados.some(c => c.grupo === 'Grupo B');
  const tieneGrupoC = clasificados.some(c => c.grupo === 'Grupo C');
  const tieneTresGruposABC = tieneGrupoA && tieneGrupoB && tieneGrupoC;
  
  console.log(`Estructura de 3 grupos (A, B, C): ${tieneTresGruposABC ? 'SÍ' : 'NO'}`);
  
  // Log detallado para depuración
  console.log("Detalle de clasificados:", JSON.stringify(clasificados.map(c => ({
    nombre: c.jugador.nombre,
    grupo: c.grupo,
    posicion: c.posicion
  }))), null, 2);
  
  // Organizar clasificados por grupo y posición
  const clasificadosPorGrupo = {};
  for (const clasificado of clasificados) {
    if (!clasificadosPorGrupo[clasificado.grupo]) {
      clasificadosPorGrupo[clasificado.grupo] = [];
    }
    clasificadosPorGrupo[clasificado.grupo].push(clasificado);
  }
  
  // Ordenar cada grupo por posición
  for (const grupo in clasificadosPorGrupo) {
    clasificadosPorGrupo[grupo].sort((a, b) => a.posicion - b.posicion);
  }
  
  console.log("Clasificados organizados por grupo:", 
    Object.keys(clasificadosPorGrupo).map(g => 
      `${g}: ${clasificadosPorGrupo[g].map(c => `${c.jugador.nombre} (${c.posicion}°)`).join(', ')}`
    ).join(' | '));
  
  if (clasificados.length <= 2) {
    // Con 1 o 2 clasificados, directo a la final
    eliminatorias = {
      final: {
        jugador1: clasificados[0]?.jugador || null,
        jugador2: clasificados[1]?.jugador || null,
        resultado: null
      }
    };
  } else if (clasificados.length <= 4) {
    // Con 3 o 4 clasificados, dos semifinales y final
    eliminatorias = {
      semifinal1: {
        jugador1: clasificados[0]?.jugador || null, 
        jugador2: clasificados[3]?.jugador || null,
        resultado: null
      },
      semifinal2: {
        jugador1: clasificados[1]?.jugador || null,
        jugador2: clasificados[2]?.jugador || null,
        resultado: null
      },
      final: {
        jugador1: null, // Ganador semifinal1
        jugador2: null, // Ganador semifinal2
        resultado: null
      }
    };
  } else if (numGrupos === 3 || tieneTresGruposABC) {
    // Estructura específica para 3 grupos (semifinales con clasificatoria)
    console.log("Usando estructura especial para 3 grupos");
    
    // Obtener los primeros y segundos lugares de cada grupo
    const primerosLugares = [];
    const segundosLugares = [];
    
    for (const grupo in clasificadosPorGrupo) {
      if (clasificadosPorGrupo[grupo].length > 0) {
        primerosLugares.push(clasificadosPorGrupo[grupo][0]); // 1° lugar
        console.log(`Primer lugar de ${grupo}: ${clasificadosPorGrupo[grupo][0].jugador.nombre}`);
      }
      
      if (clasificadosPorGrupo[grupo].length > 1) {
        segundosLugares.push(clasificadosPorGrupo[grupo][1]); // 2° lugar
        console.log(`Segundo lugar de ${grupo}: ${clasificadosPorGrupo[grupo][1].jugador.nombre}`);
      }
    }
    
    // Ordenar por nombre de grupo (A, B, C)
    primerosLugares.sort((a, b) => a.grupo.localeCompare(b.grupo));
    segundosLugares.sort((a, b) => a.grupo.localeCompare(b.grupo));
    
    console.log("Primeros lugares:", primerosLugares.map(p => `${p.jugador.nombre} (${p.grupo})`).join(', '));
    console.log("Segundos lugares:", segundosLugares.map(p => `${p.jugador.nombre} (${p.grupo})`).join(', '));
    
    // Estructura para 3 grupos:
    // Semifinal 1: 1° Grupo A vs 1° Grupo C
    // Clasificatoria: 2° Grupo A vs 2° Grupo C
    // Semifinal 2: 1° Grupo B vs Ganador Clasificatoria
    // Final: Ganador SF1 vs Ganador SF2
    // Primero 1° del grupo A, 1° del grupo B y 1° del grupo C
    const primeroA = primerosLugares.find(p => p.grupo === 'Grupo A')?.jugador || null;
    const primeroB = primerosLugares.find(p => p.grupo === 'Grupo B')?.jugador || null;
    const primeroC = primerosLugares.find(p => p.grupo === 'Grupo C')?.jugador || null;
    
    // Después 2° del grupo A, 2° del grupo B y 2° del grupo C
    const segundoA = segundosLugares.find(p => p.grupo === 'Grupo A')?.jugador || null;
    const segundoB = segundosLugares.find(p => p.grupo === 'Grupo B')?.jugador || null;
    const segundoC = segundosLugares.find(p => p.grupo === 'Grupo C')?.jugador || null;
    
    console.log(`Primer A: ${primeroA?.nombre || 'null'}`);
    console.log(`Primer B: ${primeroB?.nombre || 'null'}`);
    console.log(`Primer C: ${primeroC?.nombre || 'null'}`);
    console.log(`Segundo A: ${segundoA?.nombre || 'null'}`);
    console.log(`Segundo B: ${segundoB?.nombre || 'null'}`);
    console.log(`Segundo C: ${segundoC?.nombre || 'null'}`);
    
    eliminatorias = {
      semifinal1: {
        jugador1: primeroA, // 1° Grupo A
        jugador2: primeroC, // 1° Grupo C
        resultado: null
      },
      clasificatoria: {
        jugador1: segundoA, // 2° Grupo A
        jugador2: segundoC, // 2° Grupo C
        resultado: null
      },
      semifinal2: {
        jugador1: primeroB, // 1° Grupo B
        jugador2: null, // Se llenará con el ganador de la clasificatoria
        resultado: null
      },
      final: {
        jugador1: null, // Ganador semifinal1
        jugador2: null, // Ganador semifinal2
        resultado: null
      }
    };
  } else {
    // Verificamos si tenemos exactamente 3 grupos: A, B y C
  const gruposDisponibles = new Set(clasificados.map(c => c.grupo));
  const tieneGrupoA = gruposDisponibles.has('Grupo A');
  const tieneGrupoB = gruposDisponibles.has('Grupo B');
  const tieneGrupoC = gruposDisponibles.has('Grupo C');
  const tieneTresGrupos = tieneGrupoA && tieneGrupoB && tieneGrupoC && gruposDisponibles.size === 3;
  
  console.log("Grupos disponibles:", Array.from(gruposDisponibles));
  console.log("¿Tiene los 3 grupos exactos A, B y C?", tieneTresGrupos);
    
  if (tieneTresGrupos) {
      console.log("Detectados explícitamente Grupos A, B y C - usando estructura para 3 grupos");
      
      // Obtener jugadores específicos de cada grupo
      const jugadoresA = clasificados.filter(c => c.grupo === 'Grupo A');
      const jugadoresB = clasificados.filter(c => c.grupo === 'Grupo B');
      const jugadoresC = clasificados.filter(c => c.grupo === 'Grupo C');
      
      console.log("Jugadores Grupo A:", jugadoresA.map(j => `${j.jugador.nombre} (${j.posicion}°)`).join(', '));
      console.log("Jugadores Grupo B:", jugadoresB.map(j => `${j.jugador.nombre} (${j.posicion}°)`).join(', '));
      console.log("Jugadores Grupo C:", jugadoresC.map(j => `${j.jugador.nombre} (${j.posicion}°)`).join(', '));
      
      // Estructura específica para 3 grupos (igual que la sección anterior)
      const primeroA = jugadoresA.find(p => p.posicion === 1)?.jugador || null;
      const primeroB = jugadoresB.find(p => p.posicion === 1)?.jugador || null;
      const primeroC = jugadoresC.find(p => p.posicion === 1)?.jugador || null;
      
      const segundoA = jugadoresA.find(p => p.posicion === 2)?.jugador || null;
      const segundoB = jugadoresB.find(p => p.posicion === 2)?.jugador || null;
      const segundoC = jugadoresC.find(p => p.posicion === 2)?.jugador || null;
      
      eliminatorias = {
        semifinal1: {
          jugador1: primeroA,
          jugador2: primeroC,
          resultado: null
        },
        clasificatoria: {
          jugador1: segundoA,
          jugador2: segundoC, 
          resultado: null
        },
        semifinal2: {
          jugador1: primeroB,
          jugador2: null, // Se llenará con el ganador de la clasificatoria
          resultado: null
        },
        final: {
          jugador1: null,
          jugador2: null,
          resultado: null
        }
      };
    } else {
      // Estructura para 4 o más grupos con cuartos de final
      console.log("Usando estructura de cuartos de final para torneos grandes");
      eliminatorias = {
        cuartos1: { jugador1: clasificados[0]?.jugador, jugador2: clasificados[7]?.jugador, resultado: null },
        cuartos2: { jugador1: clasificados[3]?.jugador, jugador2: clasificados[4]?.jugador, resultado: null },
        cuartos3: { jugador1: clasificados[2]?.jugador, jugador2: clasificados[5]?.jugador, resultado: null },
        cuartos4: { jugador1: clasificados[1]?.jugador, jugador2: clasificados[6]?.jugador, resultado: null },
        semifinal1: { jugador1: null, jugador2: null, resultado: null },
        semifinal2: { jugador1: null, jugador2: null, resultado: null },
        final: { jugador1: null, jugador2: null, resultado: null }
      };
    }
  }
  
  return eliminatorias;
}

// Función para simular partidos de eliminatorias
async function simularPartidosEliminatorias(eliminatorias) {
  // Inicializar variable ganador
  let ganador = null;
  
  // Verificar que la final exista
  if (!eliminatorias.final) {
    eliminatorias.final = {};
  }
  
  // Simular clasificatoria si existe
  if (eliminatorias.clasificatoria && eliminatorias.clasificatoria.jugador1 && eliminatorias.clasificatoria.jugador2) {
    console.log("Simulando partido de clasificatoria");
    const golesJ1 = Math.floor(Math.random() * 5);
    const golesJ2 = golesJ1 === Math.floor(Math.random() * 5) ? golesJ1 + 1 : Math.floor(Math.random() * 5);
    eliminatorias.clasificatoria.resultado = { golesJugador1: golesJ1, golesJugador2: golesJ2 };
    
    // El ganador de la clasificatoria va a semifinal 2
    if (eliminatorias.semifinal2) {
      const ganador = golesJ1 > golesJ2 
        ? eliminatorias.clasificatoria.jugador1 
        : eliminatorias.clasificatoria.jugador2;
        
      // Asignar el ganador manteniendo su información de grupo y posición
      eliminatorias.semifinal2.jugador2 = ganador;
        
      if (eliminatorias.semifinal2.jugador2) {
        console.log("Ganador clasificatoria asignado a semifinal2.jugador2:", 
          eliminatorias.semifinal2.jugador2.nombre,
          "grupo:", eliminatorias.semifinal2.jugador2.grupo,
          "posición:", eliminatorias.semifinal2.jugador2.posicion);
      } else {
        console.log("Advertencia: El jugador ganador de la clasificatoria es null");
      }
    }
  }
  
  // Simular cuartos si existen
  if (eliminatorias.cuartos1) {
    console.log("Simulando partidos de cuartos");
    // Simular cuartos1
    if (eliminatorias.cuartos1.jugador1 && eliminatorias.cuartos1.jugador2) {
      const golesJ1 = Math.floor(Math.random() * 5);
      const golesJ2 = golesJ1 === Math.floor(Math.random() * 5) ? golesJ1 + 1 : Math.floor(Math.random() * 5);
      eliminatorias.cuartos1.resultado = { golesJugador1: golesJ1, golesJugador2: golesJ2 };
      eliminatorias.semifinal1.jugador1 = golesJ1 > golesJ2 ? eliminatorias.cuartos1.jugador1 : eliminatorias.cuartos1.jugador2;
    }
    
    // Simular cuartos2
    if (eliminatorias.cuartos2.jugador1 && eliminatorias.cuartos2.jugador2) {
      const golesJ1 = Math.floor(Math.random() * 5);
      const golesJ2 = golesJ1 === Math.floor(Math.random() * 5) ? golesJ1 + 1 : Math.floor(Math.random() * 5);
      eliminatorias.cuartos2.resultado = { golesJugador1: golesJ1, golesJugador2: golesJ2 };
      eliminatorias.semifinal1.jugador2 = golesJ1 > golesJ2 ? eliminatorias.cuartos2.jugador1 : eliminatorias.cuartos2.jugador2;
    }
    
    // Simular cuartos3
    if (eliminatorias.cuartos3.jugador1 && eliminatorias.cuartos3.jugador2) {
      const golesJ1 = Math.floor(Math.random() * 5);
      const golesJ2 = golesJ1 === Math.floor(Math.random() * 5) ? golesJ1 + 1 : Math.floor(Math.random() * 5);
      eliminatorias.cuartos3.resultado = { golesJugador1: golesJ1, golesJugador2: golesJ2 };
      eliminatorias.semifinal2.jugador1 = golesJ1 > golesJ2 ? eliminatorias.cuartos3.jugador1 : eliminatorias.cuartos3.jugador2;
    }
    
    // Simular cuartos4
    if (eliminatorias.cuartos4.jugador1 && eliminatorias.cuartos4.jugador2) {
      const golesJ1 = Math.floor(Math.random() * 5);
      const golesJ2 = golesJ1 === Math.floor(Math.random() * 5) ? golesJ1 + 1 : Math.floor(Math.random() * 5);
      eliminatorias.cuartos4.resultado = { golesJugador1: golesJ1, golesJugador2: golesJ2 };
      eliminatorias.semifinal2.jugador2 = golesJ1 > golesJ2 ? eliminatorias.cuartos4.jugador1 : eliminatorias.cuartos4.jugador2;
    }
  }

  // Simular semifinales
  if (eliminatorias.semifinal1) {
    console.log("Procesando semifinales");
    
    // Semifinal 1
    if (eliminatorias.semifinal1.jugador1 && eliminatorias.semifinal1.jugador2) {
      console.log("Simulando semifinal 1");
      const golesJ1 = Math.floor(Math.random() * 5);
      const golesJ2 = golesJ1 === Math.floor(Math.random() * 5) ? golesJ1 + 1 : Math.floor(Math.random() * 5);
      eliminatorias.semifinal1.resultado = { golesJugador1: golesJ1, golesJugador2: golesJ2 };
      eliminatorias.final.jugador1 = golesJ1 > golesJ2 ? eliminatorias.semifinal1.jugador1 : eliminatorias.semifinal1.jugador2;
      if (eliminatorias.final.jugador1) {
        console.log("Ganador semifinal1:", eliminatorias.final.jugador1.nombre);
      } else {
        console.log("Advertencia: El jugador ganador de la semifinal1 es null");
      }
    }
    
    // Semifinal 2
    if (eliminatorias.semifinal2?.jugador1 && eliminatorias.semifinal2?.jugador2) {
      console.log("Simulando semifinal 2");
      const golesJ1 = Math.floor(Math.random() * 5);
      const golesJ2 = golesJ1 === Math.floor(Math.random() * 5) ? golesJ1 + 1 : Math.floor(Math.random() * 5);
      eliminatorias.semifinal2.resultado = { golesJugador1: golesJ1, golesJugador2: golesJ2 };
      eliminatorias.final.jugador2 = golesJ1 > golesJ2 ? eliminatorias.semifinal2.jugador1 : eliminatorias.semifinal2.jugador2;
      if (eliminatorias.final.jugador2) {
        console.log("Ganador semifinal2:", eliminatorias.final.jugador2.nombre);
      } else {
        console.log("Advertencia: El jugador ganador de la semifinal2 es null");
      }
    }
  }
  
  // Simular final
  if (eliminatorias.final?.jugador1 && eliminatorias.final?.jugador2) {
    console.log("Simulando final");
    const golesJ1 = Math.floor(Math.random() * 5);
    // Aseguramos que no haya empate en la final
    const golesJ2 = golesJ1 === Math.floor(Math.random() * 5) ? golesJ1 + 1 : Math.floor(Math.random() * 5);
    eliminatorias.final.resultado = { golesJugador1: golesJ1, golesJugador2: golesJ2 };
    ganador = golesJ1 > golesJ2 ? eliminatorias.final.jugador1 : eliminatorias.final.jugador2;
    if (ganador) {
      console.log("Campeón del torneo:", ganador.nombre);
    } else {
      console.log("Advertencia: No se pudo determinar un campeón");
    }
  } else if (eliminatorias.final?.jugador1) {
    ganador = eliminatorias.final.jugador1;
    if (ganador) {
      console.log("Campeón por defecto (único finalista):", ganador.nombre);
    } else {
      console.log("Advertencia: El único finalista (jugador1) es null");
    }
  } else if (eliminatorias.final?.jugador2) {
    ganador = eliminatorias.final.jugador2;
    if (ganador) {
      console.log("Campeón por defecto (único finalista):", ganador.nombre);
    } else {
      console.log("Advertencia: El único finalista (jugador2) es null");
    }
  }
  
  // Actualizar eliminatorias en la base de datos
  await new Promise((resolve, reject) => {
    eliminatoriasDB.update({}, eliminatorias, {}, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  
  return ganador;
}

// API endpoint para verificar el estado del servidor
app.get('/api/status', (req, res) => {
  res.json({
    status: "ok",
    message: "El servidor está funcionando correctamente",
    time: new Date().toISOString()
  });
});

// Inicia el servidor directamente
console.log('=== Iniciando servidor Xtreame 2025 ===');

// Iniciar el servidor
const server = app.listen(PORT, () => {
  console.log(`¡Servidor iniciado correctamente!`);
  console.log(`Servidor en funcionamiento en http://localhost:${PORT}`);
  console.log(`Servidor Xtreame 2025 ejecutándose en http://localhost:${PORT}`);
  console.log('¡Ahora puedes acceder a la aplicación en tu navegador!');
  console.log('===========================================');
});

// Manejo de errores de inicio del servidor
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Error: El puerto ${PORT} ya está en uso.`);
    console.error('Cierra cualquier otro servidor o aplicación que pueda estar usando este puerto.');
  } else {
    console.error('Error al iniciar el servidor:', error);
  }
  process.exit(1);
});