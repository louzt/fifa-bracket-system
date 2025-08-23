const express = require('express');
const path = require('path');
const Datastore = require('nedb');
const app = express();
const PORT = process.env.PORT || 3003;

// Bases de datos
const jugadoresDB = new Datastore({ filename: './data/jugadores.db', autoload: true });
const partidosDB = new Datastore({ filename: './data/partidos.db', autoload: true });
const gruposDB = new Datastore({ filename: './data/grupos.db', autoload: true });
const eliminatoriasDB = new Datastore({ filename: './data/eliminatorias.db', autoload: true });
const sorteoDB = require('./data/sorteo.db.js');
const equiposFIFA = require('./data/equipos.js');

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

// Ruta de estado
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor Xtreame 2025 funcionando correctamente',
    time: new Date().toISOString()
  });
});

// API - Jugadores
app.get('/api/jugadores', (req, res) => {
  jugadoresDB.find({}).sort({ nombre: 1 }).exec((err, docs) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(docs);
  });
});

// API - Partidos
app.get('/api/partidos', (req, res) => {
  partidosDB.find({}).exec((err, partidos) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(partidos);
  });
});

// API - Grupos
app.get('/api/grupos', (req, res) => {
  gruposDB.find({}).sort({ nombre: 1 }).exec((err, grupos) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(grupos);
  });
});

// API - Eliminatorias
app.get('/api/eliminatorias', (req, res) => {
  eliminatoriasDB.find({}).exec((err, eliminatorias) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(eliminatorias);
  });
});

// API - Sorteo
app.get('/api/sorteo/equipos', (req, res) => {
  res.json(equiposFIFA);
});

app.get('/api/sorteo/estado', (req, res) => {
  sorteoDB.obtenerEstado((err, estado) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(estado);
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error en la aplicación:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar el servidor
console.log('Iniciando servidor Xtreame 2025...');
const server = app.listen(PORT, () => {
  console.log(`Servidor en funcionamiento en http://localhost:${PORT}`);
  console.log(`Servidor Xtreame 2025 ejecutándose en http://localhost:${PORT}`);
  console.log('¡Ahora puedes acceder a la aplicación en tu navegador!');
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
