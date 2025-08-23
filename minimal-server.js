const express = require('express');
const path = require('path');
const Datastore = require('nedb');
const app = express();
const PORT = 3003;

// Base de datos simple para prueba
const testDB = new Datastore({ filename: './data/test.db', autoload: true });

// Configuración del servidor
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Ruta raíz
app.get('/', (req, res) => {
  res.send('¡Servidor de prueba funcionando correctamente!');
});

// Ruta para probar la base de datos
app.get('/test-db', (req, res) => {
  testDB.insert({ test: true, date: new Date() }, (err, doc) => {
    if (err) {
      res.status(500).send('Error en la base de datos');
    } else {
      res.json({ success: true, message: 'Base de datos funcionando', doc });
    }
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor de prueba funcionando en http://localhost:${PORT}`);
  console.log('Accede a la ruta /test-db para probar la base de datos');
});
