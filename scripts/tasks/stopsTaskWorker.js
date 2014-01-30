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
      async.each(routes, function(route, callback) {
        var options = {
          url: realtime511.baseURL + realtime511.endPoints.getStopsForRoute,
          qs: {
            token: realtime511.token
          }
        }
        if (route.hasDirection) {
          var directions = route.directions;
          console.log('route name is ' + route.name + ', directions is ' + JSON.stringify(directions));
          async.each(directions, function(direction, callback) {
            options.qs.routeIDF = route.agencyName + '~' + route.code + '~' + direction.code;
            request(options, function(error, response, body) {
              updateStopFromApiResults(error, response, body, route, callback);
            });
          }, function(err) {
            callback(err);
          });
        } else {
          options.qs.routeIDF = route.agencyName + '~' + route.code
          request(options, function(error, response, body) {
            updateStopFromApiResults(error, response, body, route, callback);
          });
        }
      }, function(error, result) {
        callback(err);
      });
    } else {
      callback(err);
    }
  });
}

var updateStopFromApiResults = function(error, response, body, route, callback) {
  if (!error && response.statusCode == 200) {
    parseString(body, {trim: true, normalize: true}, function (err, result) {
      if (!err) {
        if(result.RTT
          && result.RTT.AgencyList
          && result.RTT.AgencyList.length > 0
          && result.RTT.AgencyList[0].Agency
          && result.RTT.AgencyList[0].Agency.length > 0
          && result.RTT.AgencyList[0].Agency[0].RouteList
          && result.RTT.AgencyList[0].Agency[0].RouteList.length > 0
          && result.RTT.AgencyList[0].Agency[0].RouteList[0].Route
          && result.RTT.AgencyList[0].Agency[0].RouteList[0].Route.length > 0
          && result.RTT.AgencyList[0].Agency[0].RouteList[0].Route[0]) {

          var routeJson = result.RTT.AgencyList[0].Agency[0].RouteList[0].Route[0];
          if (!route.hasDirection) {
            if (routeJson.StopList && routeJson.StopList.length > 0 && routeJson.StopList[0].Stop) {
              updateStopInStopsJson(routeJson.StopList[0].Stop, route._id, route.agency, callback);
            } else {
              callback('Unexpected stops result structure.');
            }
          } else {
            if (routeJson.RouteDirectionList
              && routeJson.RouteDirectionList.length > 0
              && routeJson.RouteDirectionList[0].RouteDirection
              && routeJson.RouteDirectionList[0].RouteDirection.length > 0
              && routeJson.RouteDirectionList[0].RouteDirection[0].StopList
              && routeJson.RouteDirectionList[0].RouteDirection[0].StopList.length > 0
              && routeJson.RouteDirectionList[0].RouteDirection[0].StopList[0].Stop) {
              updateStopInStopsJson(routeJson.RouteDirectionList[0].RouteDirection[0].StopList[0].Stop, route._id, route.agency, callback);
            } else {
              callback('Unexpected stops result structure.');
            }
          }
        } else {
          callback('Unexpected stops result structure.');
        }
      } else {
        callback(err);
      }
    });
  } else {
    callback(err);
  }
}

var updateStopInStopsJson = function(stopsJson, routeId, agencyId, callback) {
  async.each(stopsJson, function(stopJson, callback){
    if (stopJson['$'] && stopJson['$'].name && stopJson['$'].StopCode) {
      var stop = {
        name: stopJson['$'].name,
        stopCode: stopJson['$'].StopCode,
        route: routeId,
        agency: agencyId
      };
      dbClinet.connect(function(err, db) {
        if (!err) {
          console.log('Upserting stop: ' + JSON.stringify(stop));
          db.collection('stop').update({ name: stop.name, stopCode: stop.stopCode }, stop, {safe: true, upsert: true}, function(err, objects) {
            callback();
          });
        } else {
          callback();
        }
      });
    } else {
      callback();
    }
  }, function(err) {
    callback(err);
  });
}

exports.run = run;
exports.name = 'stops';