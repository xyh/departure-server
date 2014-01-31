/**
 * Created by xuyuhang on 1/29/14.
 */
var MongoClient = require('mongodb').MongoClient;
var BSON = require('mongodb').BSONPure;
var database = require('config').database;
var settings = (database) ? database.info : undefined;

/**
 * will reuse connection if already created
 */
function connect(callback) {
  if (settings) {
    var url = 'mongodb://' + settings.username + ':' + settings.password + '@' +
      settings.host + ':' + settings.port + '/' + settings.databaseName;

    MongoClient.connect(url, function(err, db) {
      if(err) { return callback(err); }
      console.log('Connected to database...');
      callback(null, db);
    });
  } else {
    callback('Config file error.');
  }
}

function id(idString) {
  return new BSON.ObjectID(idString);
}

exports.connect = connect;
exports.id = id;
