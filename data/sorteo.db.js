// Base de datos para el sorteo de equipos
const Datastore = require('nedb');
const path = require('path');

const db = new Datastore({
    filename: path.join(__dirname, 'sorteo.db'),
    autoload: true
});

module.exports = db;
