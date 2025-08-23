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

// API - Status (endpoint de estado para verificar que el servidor está funcionando)
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online',
    message: '¡El servidor Xtreame 2025 está funcionando correctamente!' 
  });
});

// Inicia el servidor
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
