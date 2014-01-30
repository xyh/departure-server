/**
 * Created by xuyuhang on 1/29/14.
 */
var MongoClient = require('mongodb').MongoClient;
var database = require('config').database;
var settings = (database) ? database.info : undefined;
var myDb;

/**
 * will reuse connection if already created
 */
function connect(callback) {
  if (settings) {
    if (myDb === undefined) {
      var url = 'mongodb://' + settings.username + ':' + settings.password + '@' +
        settings.host + ':' + settings.port + '/' + settings.databaseName;

      MongoClient.connect(url, function(err, db) {
        if(err) { return callback(err); }
        console.log('Connected to database...');
        myDb = db;
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