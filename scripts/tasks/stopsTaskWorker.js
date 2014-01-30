/**
 * Created by xuyuhang on 1/30/14.
 */
var request = require('request');
var realtime511 = require('config').realtime511;
var parseString = require('xml2js').parseString;
var prettyjson = require('prettyjson');
var async = require('async');
var _ = require('underscore');

var dbClinet = require('../../db');

var run = function (params, callback) {
  /* fetch all route */
  var limit = 100;
  var skip = 0;
  var finishedRoutes = false;
  dbClinet.connect(function(err, db) {
    if (!err) {
      async.whilst(
        function () { return !finishedRoutes; },
        function (routesCallback) {
          console.log('Get routes ' + (skip+1) + ' ~ ' + (skip+limit));
          db.collection('route').find().skip(skip).limit(limit).toArray(function(err, routes) {
            if (routes.length < limit) finishedRoutes = true;
            skip += limit;
            updateStopsForRoutes(routes, routesCallback);
          });
        },
        function (err) {
          console.log('Finish getting all routes.');
          callback(err);
        }
      );
    } else {
      callback(err);
    }
  });
}

var updateStopsForRoutes = function(routes, callback) {
  dbClinet.connect(function(err, db) {
    if (!err) {
      var index = 0;
      async.each(routes, function(route, eachCallback) {
        console.log(index + ' - ' + JSON.stringify(route));
        index ++;
//        var options = {
//          url: realtime511.baseURL + realtime511.endPoints.getStopsForRoute,
//          qs: {
//            token: realtime511.token,
//            routeIDF: names
//          }
//        }
        eachCallback();
      }, function(error, result) {
        callback(err);
      })
    } else {
      callback(err);
    }
  });
}

exports.run = run;