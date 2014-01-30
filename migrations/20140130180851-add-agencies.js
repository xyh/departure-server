var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('agencies', {
    id:             { type: 'int', primaryKey: true, autoIncrement: true, unique: true },
    name:           'string',
    hasDirection:   'int',
    mode:         'string'

  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('agencies', { ifExists: true }, callback);
};
