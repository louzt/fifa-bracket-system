// Servidor Express mínimo para probar la conectividad
const express = require('express');
const app = express();
const PORT = 3003;

// Ruta básica de prueba
app.get('/', (req, res) => {
  res.send('¡Servidor Xtreame 2025 funcionando correctamente!');
});

// Ruta de estado
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', message: '¡El servidor Xtreame 2025 está funcionando correctamente!' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`¡Servidor de prueba iniciado correctamente!`);
  console.log(`Servidor en funcionamiento en http://localhost:${PORT}`);
  console.log(`Prueba acceder a: http://localhost:${PORT}/api/status`);
});
