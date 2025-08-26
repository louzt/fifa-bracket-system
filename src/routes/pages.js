const express = require('express');
const router = express.Router();
const path = require('path');

// Rutas para servir archivos HTML
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public', 'index.html'));
});

router.get('/grupos', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public', 'grupos.html'));
});

router.get('/eliminatorias', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public', 'eliminatorias.html'));
});

router.get('/estadisticas', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public', 'estadisticas.html'));
});

module.exports = router;
