/**
 * Servidor principal refactorizado con estructura modular
 */
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3003;
const { serverLog } = require('./helpers/utils');

// Importar rutas
const pagesRoutes = require('./routes/pages');
const jugadoresRoutes = require('./routes/jugadores');
const partidosRoutes = require('./routes/partidos');
const gruposRoutes = require('./routes/grupos');
const eliminatoriasRoutes = require('./routes/eliminatorias');
const equiposRoutes = require('./routes/equipos');

// Configuración del servidor
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Rutas de páginas
app.use('/', pagesRoutes);

// Rutas de API
app.use('/api/jugadores', jugadoresRoutes);
app.use('/api/partidos', partidosRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/eliminatorias', eliminatoriasRoutes);
app.use('/api/equipos', equiposRoutes);
app.use('/api/sorteo', equiposRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  serverLog(`Servidor en funcionamiento en el puerto ${PORT}`);
  serverLog(`http://localhost:${PORT}`);
});
