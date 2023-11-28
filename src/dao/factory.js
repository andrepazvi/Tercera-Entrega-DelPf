const mongoose = require('mongoose');
const { db, persistence } = require('../config');
mongoose.set('debug', false);
mongoose.set('strictQuery', false);

let Dao;

switch (persistence) {
  case 'MONGO':
    let connection;

    mongoose.connect(db.mongo_atlas, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: db.dbName,
    });

    connection = mongoose.connection;

    connection.on('connected', () => {
      console.log('~~~Conexión exitosa a la base de datos de MONGO Factory~~~');
    });

    const DaoMongo = require('./mongo/dao.mongo');
    Dao = DaoMongo;
    console.log('~~~Conexión exitosa a persistencia MONGO Factory~~~');
    break;

  case 'MEMORY':
    const DaoMemory = require('./memory/dao.memory');
    Dao = DaoMemory;
    console.log('~~~Conexión exitosa a persistencia MEMORY Factory~~~');
    break;

  case 'FILESYSTEM':
    const DaoFileSystem = require('./filesystem/dao.fylesystem');
    Dao = DaoFileSystem;
    console.log('~~~Conexión exitosa a persistencia FILESYSTEM Factory~~~');
    break;

  default:
    throw new Error('Persistence type not supported');
}

module.exports = Dao;
