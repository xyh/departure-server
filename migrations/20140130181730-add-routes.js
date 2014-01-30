var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('routes', {
    id:             { type: 'int', primaryKey: true, autoIncrement: true, unique: true },
    name:           'string',
    code:           'int',
    hasDirection:   'int',
    agencyId:       'int'
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('routes', { ifExists: true }, callback);
};
