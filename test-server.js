const express = require('express');
const app = express();
const PORT = 3003;

app.get('/', (req, res) => {
  res.send('¡El servidor está funcionando correctamente!');
});

app.listen(PORT, () => {
  console.log(`Servidor de prueba ejecutándose en http://localhost:${PORT}`);
});
