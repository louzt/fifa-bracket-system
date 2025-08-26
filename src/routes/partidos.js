const express = require('express');
const router = express.Router();
const { partidosDB } = require('../db/database');
const { actualizarEstadisticasAsync, serverLog } = require('../helpers/utils');

// GET - Obtener todos los partidos
router.get('/', (req, res) => {
  partidosDB.find({}).exec((err, docs) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    res.json(docs);
  });
});

// POST - Registrar un nuevo partido
router.post('/', async (req, res) => {
  try {
    const partido = req.body;
    
    // Verificar que el partido tiene toda la información necesaria
    if (!partido.jugador1 || !partido.jugador2 || !partido.resultado) {
      res.status(400).json({ error: 'Datos incompletos del partido' });
      return;
    }
    
    // Verificar que no sea el mismo jugador contra sí mismo
    if (partido.jugador1._id === partido.jugador2._id) {
      res.status(400).json({ error: 'No se puede registrar un partido de un jugador contra sí mismo' });
      return;
    }
    
    // Guardar el partido
    partidosDB.insert(partido, async (err, partidoGuardado) => {
      if (err) {
        res.status(500).json({ error: err });
        return;
      }
      
      try {
        // Actualizar estadísticas de los jugadores
        await actualizarEstadisticasAsync(partidoGuardado);
        
        // Si el partido pertenece a un grupo, actualizar ese grupo también
        if (partido.grupo) {
          const { gruposDB } = require('../db/database');
          
          gruposDB.findOne({ nombre: partido.grupo }, (err, grupo) => {
            if (err || !grupo) {
              serverLog(`Error al actualizar grupo: ${err || 'Grupo no encontrado'}`);
              return;
            }
            
            // Añadir el partido al grupo
            if (!grupo.partidos) grupo.partidos = [];
            grupo.partidos.push(partidoGuardado);
            
            // Actualizar grupo
            gruposDB.update({ _id: grupo._id }, grupo, {}, (err) => {
              if (err) {
                serverLog(`Error al actualizar grupo con nuevo partido: ${err}`);
                return;
              }
              serverLog(`Grupo ${partido.grupo} actualizado con nuevo partido`);
            });
          });
        }
        
        serverLog(`Partido registrado: ${partido.jugador1.nombre} vs ${partido.jugador2.nombre}`);
        res.status(201).json({
          mensaje: 'Partido registrado correctamente',
          partido: partidoGuardado
        });
        
      } catch (error) {
        serverLog(`Error al actualizar estadísticas: ${error}`);
        res.status(500).json({ error: 'Error al actualizar estadísticas' });
      }
    });
  } catch (error) {
    serverLog(`Error en registro de partido: ${error}`);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
