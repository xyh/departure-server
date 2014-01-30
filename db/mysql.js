/**
 * Created by xuyuhang on 1/30/14.
 */
var mysql      = require('mysql');
var database = require('config').database;
var settings = (database) ? database.info : undefined;
var myDb;

var url = 'mongodb://' + settings.username + ':' + settings.password + '@' +
  settings.host + ':' + settings.port + '/' + settings.databaseName;
var pool  = mysql.createPool(url);

function connect(callback) {
  if (settings) {
    if (myDb === undefined) {
      pool.getConnection(function(err, connection) {
        console.log('Connected to database...');
        myDb = connection;
        callback(null, db);
      });
    } else {
      callback(null, myDb);
    }
  } else {
    callback('Config file error.');
  }
}

exports.connect = connect;