var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('directions', {
    id:             { type: 'int', primaryKey: true, autoIncrement: true, unique: true },
    name:           'string',
    code:           'int',
    routeId:        'int'
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('directions', { ifExists: true }, callback);
};
