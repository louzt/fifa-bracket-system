/**
 * Launcher para el servidor Xtreame 2025
 * Este archivo inicia el servidor y muestra los mensajes apropiados
 */

console.log('Iniciando servidor Xtreame 2025...');

try {
  // Cargamos el servidor original
  const { app, server } = require('./server.js');
  
  // Verificamos si el servidor está realmente escuchando
  if (server && server.listening) {
    console.log(`Servidor en funcionamiento en http://localhost:3003`);
    console.log(`Servidor Xtreame 2025 ejecutándose en http://localhost:3003`);
    console.log('¡Ahora puedes acceder a la aplicación en tu navegador!');
  } else {
    console.error('Error: El servidor no está escuchando correctamente en el puerto 3003.');
    console.log('Intentando iniciar manualmente...');
    
    const PORT = 3003;
    const manualServer = app.listen(PORT, () => {
      console.log(`Servidor iniciado manualmente en http://localhost:${PORT}`);
      console.log(`Servidor Xtreame 2025 ejecutándose en http://localhost:${PORT}`);
      console.log('¡Ahora puedes acceder a la aplicación en tu navegador!');
    });
    
    manualServer.on('error', (err) => {
      console.error('Error al iniciar manualmente el servidor:', err);
      process.exit(1);
    });
  }
} catch (error) {
  console.error('Error al iniciar el servidor:', error);
  process.exit(1);
}
