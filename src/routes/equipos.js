const express = require('express');
const router = express.Router();
const equiposFIFA = require('../../data/equipos.js');
const { sorteo: sorteoDB } = require('../db/database');

// GET - Obtener todos los equipos disponibles
router.get('/', (req, res) => {
  res.json(equiposFIFA);
});

// GET - Obtener equipos disponibles (no asignados)
router.get('/disponibles', async (req, res) => {
  try {
    // Obtener los equipos ya asignados
    const equiposAsignados = await new Promise((resolve, reject) => {
      sorteoDB.find({}, (err, docs) => {
        if (err) reject(err);
        else resolve(docs);
      });
    });
    
    // Filtrar los equipos que no están asignados
    const equiposAsignadosIds = equiposAsignados.map(asignacion => asignacion.equipo.id);
    const equiposDisponibles = equiposFIFA.filter(equipo => !equiposAsignadosIds.includes(equipo.id));
    
    res.json(equiposDisponibles);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener equipos disponibles' });
  }
});

// GET - Obtener equipos asignados a jugadores
router.get('/asignados', (req, res) => {
  sorteoDB.find({}).exec((err, docs) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    res.json(docs);
  });
});

// POST - Asignar equipo a jugador
router.post('/asignar', (req, res) => {
  const { jugador, equipo } = req.body;
  
  if (!jugador || !equipo) {
    res.status(400).json({ error: 'Se requiere un jugador y un equipo' });
    return;
  }
  
  // Verificar si el jugador ya tiene un equipo asignado
  sorteoDB.findOne({ 'jugador._id': jugador._id }, (err, asignacionExistente) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    
    if (asignacionExistente) {
      // Actualizar la asignación existente
      sorteoDB.update(
        { _id: asignacionExistente._id },
        { $set: { equipo } },
        {},
        (err) => {
          if (err) {
            res.status(500).json({ error: err });
            return;
          }
          res.json({ mensaje: 'Asignación actualizada correctamente' });
        }
      );
    } else {
      // Crear una nueva asignación
      const asignacion = { jugador, equipo };
      sorteoDB.insert(asignacion, (err, doc) => {
        if (err) {
          res.status(500).json({ error: err });
          return;
        }
        res.status(201).json(doc);
      });
    }
  });
});

module.exports = router;
