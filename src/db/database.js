const Datastore = require('nedb');
const path = require('path');

// Configuración de las bases de datos
const jugadoresDB = new Datastore({ filename: path.join(__dirname, '../../data/jugadores.db'), autoload: true });
const partidosDB = new Datastore({ filename: path.join(__dirname, '../../data/partidos.db'), autoload: true });
const gruposDB = new Datastore({ filename: path.join(__dirname, '../../data/grupos.db'), autoload: true });
const eliminatoriasDB = new Datastore({ filename: path.join(__dirname, '../../data/eliminatorias.db'), autoload: true });

// Promisificar las funciones de NEDB para usarlas con async/await
const promisifyNedb = (db) => {
  const asyncDB = {};
  
  // Métodos comunes a promisificar
  const methods = ['find', 'findOne', 'insert', 'update', 'remove', 'count'];
  
  methods.forEach(method => {
    asyncDB[method] = (...args) => {
      return new Promise((resolve, reject) => {
        db[method](...args, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
    };
  });
  
  // Mantener el método exec original para compatibilidad con código existente
  asyncDB.find = (...args) => {
    const cursor = db.find(...args);
    
    // Añadir método exec promisificado
    cursor.execAsync = () => {
      return new Promise((resolve, reject) => {
        cursor.exec((err, docs) => {
          if (err) return reject(err);
          resolve(docs);
        });
      });
    };
    
    // Mantener compatibilidad con el método exec de callback
    cursor.exec = (callback) => db.find(...args).exec(callback);
    
    // Añadir otros métodos de cursor
    ['sort', 'limit', 'skip'].forEach(method => {
      cursor[method] = (...methodArgs) => {
        db.find(...args)[method](...methodArgs);
        return cursor;
      };
    });
    
    return cursor;
  };
  
  return asyncDB;
};

// Exportar bases de datos originales y versiones promisificadas
module.exports = {
  // Bases de datos originales para compatibilidad con el código existente
  jugadoresDB,
  partidosDB, 
  gruposDB,
  eliminatoriasDB,
  
  // Versiones promisificadas para nuevo código
  jugadores: promisifyNedb(jugadoresDB),
  partidos: promisifyNedb(partidosDB),
  grupos: promisifyNedb(gruposDB),
  eliminatorias: promisifyNedb(eliminatoriasDB),
  
  // Importar bases de datos externas
  sorteo: require('../../data/sorteo.db.js')
};
