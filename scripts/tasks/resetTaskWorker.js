/**
 * Created by xuyuhang on 1/29/14.
 */

var async = require('async');

var dbClient = require('../../db');

var run = function (params, callback) {
  dbClient.connect(function(err, db) {
    if (!err) {

      async.series([
        function(callback){
          db.collection('agency').drop(function(err, done) {
            callback(err);
          });
        },
        function(callback){
          db.collection('route').drop(function(err, done) {
            callback(err);
          });
        },
        function(callback){
          db.collection('stop').drop(function(err, done) {
            callback(err);
          });
        }
      ],
      function(err, results){
        callback(err);
      });

    } else {
      callback(err);
    }
  });
}

exports.run = run;
exports.name = 'reset';