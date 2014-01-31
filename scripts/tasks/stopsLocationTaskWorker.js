/**
 * Created by xuyuhang on 1/30/14.
 */
var request = require('request');
var realtime511 = require('config').realtime511;
var parseString = require('xml2js').parseString;
var prettyjson = require('prettyjson');
var async = require('async');
var _ = require('underscore');
var gm = require('googlemaps');

var dbClinet = require('../../db');

var run = function (params, callback) {
  /* fetch all stops */
  var limit = 100;
  var skip = 0;
  var finishedRoutes = false;
  dbClinet.connect(function(err, db) {
    if (!err) {
      async.whilst(
        function () { return !finishedRoutes; },
        function (callback) {
          console.log('Get stops ' + (skip+1) + ' ~ ' + (skip+limit));
          db.collection('stop').find().skip(skip).limit(limit).toArray(function(err, stops) {
            if (stops.length < limit || !stops) finishedRoutes = true;
            if (!stops) {
              callback();
            } else {
              async.eachSeries(stops, function(stop, callback) {
                if (!stop.latitude) {
                  console.log("Updating location for stop " + stop.name);
                  updateStopLocation(stop, callback);
                } else {
                  callback();
                }
              }, function(err) {
                console.log('Complete stops ' + (skip+1) + ' ~ ' + (skip+limit));
                skip += limit;
                callback(err);
              });
            }
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

var stopCount = 0;
var updateStopLocation = function(stop, callback) {
  var queryAddress = stop.name;
  setTimeout(function(){
    gm.geocode(queryAddress, function(err, data) {
      if (!err && data && data.status == 'OK') {
        if (data.status == 'OK' && data.results && data.results.length > 0) {
          // just use the first result
          var coordinates = data.results[0].geometry.location;
          console.log('Stop ' + stop.name + ' location is ' + JSON.stringify(coordinates));
          stop.latitude = coordinates.lat;
          stop.longitude = coordinates.lng;
          dbClinet.connect(function(err, db) {
            if (!err) {
              db.collection('stop').update({ name: stop.name, stopCode: stop.stopCode}, stop, {safe: true, upsert: true}, function(err, objects) {
                stopCount ++;
                console.log(stopCount);
                callback();
              });
            } else {
              callback(err);
            }
          });
        }
      } else if (!err && data) {
        console.log('Geocoding callback {' + queryAddress + '} failed with status ' + data.status);
        callback();
      } else {
        console.log('Geocoding callback {' + queryAddress + '} failed with err ' + err);
        callback();
      }
    }, false, '39.419221,-124.103279|37.256566,-120.026493', 'us');
  }, 200);
}

exports.run = run;
exports.name = 'stopsLocation';