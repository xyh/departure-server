/**
 * Created by xuyuhang on 1/30/14.
 */

var request = require('request');
var realtime511 = require('config').realtime511;
var parseString = require('xml2js').parseString;
var prettyjson = require('prettyjson');
var async = require('async');
var _ = require('underscore');

var dbClinet = require('../db');

exports.getNextDepaturesByStopCode = function(req, res) {
  var stopCode = req.query.stopCode;

  if (stopCode) {
    var options = {
      url: realtime511.baseURL + realtime511.endPoints.getNextDeparturesByStopCode,
      qs: {
        token: realtime511.token,
        stopcode: stopCode
      }
    };
    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        parseString(body, {trim: true, normalize: true}, function (err, result) {
          if (!err) {
            console.log(JSON.stringify(result));
            var agencyListJson = result.RTT.AgencyList[0];
            if (!agencyListJson.Agency) {
              // no prediction available
              res.end(JSON.stringify({
                stopCode: stopCode,
                departures: []
              }));
            } else {
              var routeJsons = result.RTT.AgencyList[0].Agency[0].RouteList[0].Route;
              var results = [];

              for (var i = 0; i < routeJsons.length; i++) {
                var routeJson = result.RTT.AgencyList[0].Agency[0].RouteList[0].Route[i];
                console.log(JSON.stringify(routeJson));
                if (!routeJson.RouteDirectionList) {
                  var departureTimes = routeJson
                    .StopList[0]
                    .Stop[0]
                    .DepartureTimeList[0]
                    .DepartureTime;
                  results.push({
                    route: {
                      name: routeJson['$'].Name,
                      code: routeJson['$'].Code
                    },
                    departures: departureTimes
                  });
                } else {
                  var departureTimes = routeJson
                    .RouteDirectionList[0]
                    .RouteDirection[0]
                    .StopList[0]
                    .Stop[0]
                    .DepartureTimeList[0]
                    .DepartureTime;
                  results.push({
                    route: {
                      name: routeJson['$'].Name,
                      code: routeJson['$'].Code,
                      directionName: routeJson.RouteDirectionList[0].RouteDirection[0]['$'].Name,
                      directionCode: routeJson.RouteDirectionList[0].RouteDirection[0]['$'].Code
                    },
                    departures: departureTimes
                  });
                }
              }
            }

            res.end(JSON.stringify({
              stopCode: stopCode,
              departures: results
            }));
          } else {
            res.end('{}');
          }
        });
      } else {
        res.end('{}');
      }
    });
  } else {
    res.end('{}');
  }
};