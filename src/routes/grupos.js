const express = require('express');
const router = express.Router();
const { gruposDB } = require('../db/database');
const { ordenarJugadoresPorPuntos, generarGruposAleatorios, serverLog } = require('../helpers/utils');

// GET - Obtener todos los grupos
router.get('/', async (req, res) => {
  try {
    gruposDB.find({}).exec((err, grupos) => {
      if (err) {
        res.status(500).json({ error: err });
        return;
      }
      
      // Ordenar jugadores de cada grupo por puntos
      const gruposOrdenados = grupos.map(grupo => {
        return {
          ...grupo,
          jugadores: ordenarJugadoresPorPuntos(grupo.jugadores || [])
        };
      });
      
      res.json(gruposOrdenados);
    });
  } catch (error) {
    serverLog(`Error al obtener grupos: ${error}`);
    res.status(500).json({ error: 'Error al obtener grupos' });
  }
});

// POST - Sincronizar grupos con jugadores
router.post('/sincronizar', (req, res) => {
  const { jugadoresDB } = require('../db/database');
  
  // Obtener todos los jugadores para sincronizar
  jugadoresDB.find({}).exec((err, jugadores) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    
    // Obtener grupos actuales
    gruposDB.find({}).exec((err, grupos) => {
      if (err) {
        res.status(500).json({ error: err });
        return;
      }
      
      // Actualizar cada grupo con la información más reciente de los jugadores
      const gruposActualizados = grupos.map(grupo => {
        const jugadoresActualizados = grupo.jugadores.map(jugadorGrupo => {
          const jugadorDB = jugadores.find(j => j._id === jugadorGrupo._id);
          
          if (jugadorDB) {
            return {
              ...jugadorGrupo,
              nombre: jugadorDB.nombre,
              equipo: jugadorDB.equipo,
              // Mantener las estadísticas del grupo, no las generales
            };
          }
          
          return jugadorGrupo;
        });
        
        return {
          ...grupo,
          jugadores: jugadoresActualizados
        };
      });
      
      // Guardar los grupos actualizados
      Promise.all(
        gruposActualizados.map(grupo => 
          new Promise((resolve, reject) => {
            gruposDB.update({ _id: grupo._id }, grupo, {}, (err, numReplaced) => {
              if (err) reject(err);
              else resolve(numReplaced);
            });
          })
        )
      )
      .then(() => {
        serverLog('Grupos sincronizados correctamente');
        res.json({ mensaje: 'Grupos sincronizados correctamente' });
      })
      .catch(err => {
        serverLog(`Error al sincronizar grupos: ${err}`);
        res.status(500).json({ error: err });
      });
    });
  });
});

// POST - Generar grupos aleatorios
router.post('/generar', (req, res) => {
  const { jugadoresDB } = require('../db/database');
  
  // Obtener todos los jugadores
  jugadoresDB.find({}).exec(async (err, jugadores) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    
    try {
      // Generar grupos aleatoriamente
      const grupos = await generarGruposAleatorios(jugadores);
      
      serverLog(`Grupos generados: ${grupos.length} grupos con ${jugadores.length} jugadores`);
      res.json({
        mensaje: 'Grupos generados correctamente',
        grupos
      });
    } catch (error) {
      serverLog(`Error al generar grupos: ${error}`);
      res.status(500).json({ error: 'Error al generar grupos' });
    }
  });
});

module.exports = router;
