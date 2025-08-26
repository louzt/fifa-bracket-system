const express = require('express');
const router = express.Router();
const { jugadoresDB } = require('../db/database');
const { serverLog } = require('../helpers/utils');

// GET - Obtener todos los jugadores
router.get('/', (req, res) => {
  jugadoresDB.find({}).sort({ nombre: 1 }).exec((err, docs) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    res.json(docs);
  });
});

// GET - Obtener un jugador por ID
router.get('/:id', (req, res) => {
  jugadoresDB.findOne({ _id: req.params.id }, (err, doc) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    if (!doc) {
      res.status(404).json({ error: 'Jugador no encontrado' });
      return;
    }
    res.json(doc);
  });
});

// POST - Crear un nuevo jugador
router.post('/', (req, res) => {
  const nuevoJugador = {
    nombre: req.body.nombre,
    equipo: req.body.equipo || null,
    estadisticas: {
      puntos: 0,
      partidosJugados: 0,
      victorias: 0,
      empates: 0,
      derrotas: 0,
      golesFavor: 0,
      golesContra: 0
    }
  };
  
  jugadoresDB.insert(nuevoJugador, (err, doc) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    serverLog(`Nuevo jugador creado: ${nuevoJugador.nombre}`);
    res.status(201).json(doc);
  });
});

// PUT - Actualizar un jugador existente
router.put('/:id', (req, res) => {
  jugadoresDB.update(
    { _id: req.params.id }, 
    { $set: { 
      nombre: req.body.nombre, 
      equipo: req.body.equipo,
      ...(req.body.estadisticas && { estadisticas: req.body.estadisticas })
    }}, 
    {}, 
    (err, numReplaced) => {
      if (err) {
        res.status(500).json({ error: err });
        return;
      }
      if (numReplaced === 0) {
        res.status(404).json({ error: 'Jugador no encontrado' });
        return;
      }
      serverLog(`Jugador actualizado: ${req.body.nombre}`);
      res.json({ mensaje: 'Jugador actualizado correctamente' });
    }
  );
});

// DELETE - Eliminar un jugador
router.delete('/:id', (req, res) => {
  jugadoresDB.remove({ _id: req.params.id }, {}, (err, numRemoved) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    if (numRemoved === 0) {
      res.status(404).json({ error: 'Jugador no encontrado' });
      return;
    }
    serverLog(`Jugador eliminado: ${req.params.id}`);
    res.json({ mensaje: 'Jugador eliminado correctamente' });
  });
});

module.exports = router;
