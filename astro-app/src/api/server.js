// Archivo de integración entre Astro y Express
import express from 'express';
import path from 'path';
import Datastore from 'nedb';
import { fileURLToPath } from 'url';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');

// Configurar las bases de datos
const jugadoresDB = new Datastore({ filename: path.join(rootDir, 'data/jugadores.db'), autoload: true });
const partidosDB = new Datastore({ filename: path.join(rootDir, 'data/partidos.db'), autoload: true });
const gruposDB = new Datastore({ filename: path.join(rootDir, 'data/grupos.db'), autoload: true });
const eliminatoriasDB = new Datastore({ filename: path.join(rootDir, 'data/eliminatorias.db'), autoload: true });

// Promisificar las funciones de NEDB para usarlas con async/await
const promisify = (db, method) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      db[method](...args, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };
};

// Funciones de ayuda
const serverLog = (msg) => {
  console.log(`[SERVER] ${msg}`);
};

const ordenarJugadoresPorPuntos = (jugadores) => {
  return [...jugadores].sort((a, b) => {
    // Ordenar por puntos
    if (b.estadisticas?.puntos !== a.estadisticas?.puntos) {
      return (b.estadisticas?.puntos || 0) - (a.estadisticas?.puntos || 0);
    }
    
    // Si tienen los mismos puntos, ordenar por diferencia de goles
    const difGolA = ((a.estadisticas?.golesFavor || 0) - (a.estadisticas?.golesContra || 0));
    const difGolB = ((b.estadisticas?.golesFavor || 0) - (b.estadisticas?.golesContra || 0));
    if (difGolB !== difGolA) {
      return difGolB - difGolA;
    }
    
    // Si tienen la misma diferencia de goles, ordenar por goles a favor
    return (b.estadisticas?.golesFavor || 0) - (a.estadisticas?.golesFavor || 0);
  });
};

// Exportamos una función para configurar Express
export function configureExpress(app) {
  // Middleware
  app.use(express.json());
  
  // API: Jugadores
  app.get('/api/jugadores', (req, res) => {
    jugadoresDB.find({}).sort({ nombre: 1 }).exec((err, docs) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(docs);
    });
  });
  
  app.get('/api/jugadores/:id', (req, res) => {
    jugadoresDB.findOne({ _id: req.params.id }, (err, doc) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!doc) {
        res.status(404).json({ error: 'Jugador no encontrado' });
        return;
      }
      res.json(doc);
    });
  });

  // API: Grupos
  app.get('/api/grupos', (req, res) => {
    gruposDB.find({}).exec((err, grupos) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Ordenar jugadores de cada grupo por puntos
      const gruposOrdenados = grupos.map(grupo => {
        return {
          ...grupo,
          jugadores: ordenarJugadoresPorPuntos(grupo.jugadores || [])
        };
      });
      
      res.json(gruposOrdenados);
    });
  });
  
  app.post('/api/grupos/generar', (req, res) => {
    // Implementación del endpoint de generar grupos
    // ...
    res.json({ mensaje: "Endpoint en construcción" });
  });

  app.post('/api/grupos/sincronizar', (req, res) => {
    // Implementación del endpoint de sincronizar grupos
    // ...
    res.json({ mensaje: "Endpoint en construcción" });
  });

  // API: Partidos
  app.get('/api/partidos', (req, res) => {
    partidosDB.find({}).exec((err, docs) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(docs);
    });
  });

  app.post('/api/partidos', (req, res) => {
    // Implementación del endpoint de registrar partido
    // ...
    res.json({ mensaje: "Endpoint en construcción" });
  });

  // API: Eliminatorias
  app.get('/api/eliminatorias', (req, res) => {
    eliminatoriasDB.findOne({}, (err, eliminatorias) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(eliminatorias || {});
    });
  });

  app.post('/api/eliminatorias/generar', (req, res) => {
    // Implementación del endpoint de generar eliminatorias
    // ...
    res.json({ mensaje: "Endpoint en construcción" });
  });

  serverLog('API endpoints configurados');
  return app;
}
