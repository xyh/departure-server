/**
 * Created by xuyuhang on 1/29/14.
 */
var request = require('request');
var realtime511 = require('config').realtime511;
var parseString = require('xml2js').parseString;
var prettyjson = require('prettyjson');
var async = require('async');
var _ = require('underscore');

var dbClient = require('../../db');

var run = function (params, callback) {
  getAgencyNames(null, function(err, agencyNames) {
    if (err) throw err;

    var names = _.reduce(agencyNames, function(memo, name) { return (memo === '') ? name : memo + '|' + name}, '');
    console.log('Agencies names are: ' + names);
    var options = {
      url: realtime511.baseURL + realtime511.endPoints.getRoutesForAgencies,
      qs: {
        token: realtime511.token,
        agencyNames: names
      }
    }
    console.log('Request ' + options.url);
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        parseString(body, {trim: true, normalize: true}, function (err, result) {
          if (!err) {
            dbClient.connect(function(err, db) {
              if (err) { callback(err); }
              if (result.RTT
                && result.RTT.AgencyList
                && result.RTT.AgencyList.length > 0
                && result.RTT.AgencyList[0].Agency) {
                var agencies = result.RTT.AgencyList[0].Agency;
                updateRoutesForAgencies(agencies, db, callback);
              }
              callback();
            });
          } else {
            callback(err);
          }
        });
      } else {
        callback(error);
      }
    });
  });
}

var getAgencyNames = function(params, callback) {
  dbClient.connect(function(err, db) {
    if (!err) {
      db.collection('agency').find().toArray(function(err, docs) {
        var agencyNames = _.map(docs, function(doc) { return doc.name; });
        callback(null, agencyNames);
      });
    } else {
      callback(err);
    }
  });
}

var updateRoutesForAgencies = function(agencies, db, callback) {
  async.each(agencies, function(agencyProperties, callback) {
    if (agencyProperties && agencyProperties['$']) {
      var agencyName = agencyProperties['$']['Name'];
      var agencyHasDirection = agencyProperties['$']['HasDirection'];

      db.collection('agency').findOne({ name: agencyName }, function(err, agency) {
        console.log('find agency ' + JSON.stringify(agency));

        if (agency) {
          var routes = agencyProperties['RouteList'][0]['Route'];
          async.each(routes, function(route, callback) {
            if (route && route['$']) {
              var routeObject = { agency: agency._id };
              routeObject.name = route['$']['Name'];
              routeObject.code = route['$']['Code'];
              routeObject.hasDirection = agency.hasDirection;
              if (routeObject.hasDirection
                && route['RouteDirectionList']
                && route['RouteDirectionList'][0]
                && route['RouteDirectionList'][0]['RouteDirection']) {
                var routeDirections = _.map(route['RouteDirectionList'][0]['RouteDirection'], function(direction) {
                  return { code: direction['$']['Code'], name: direction['$']['Name'] };
                });
                routeObject.directions = routeDirections;
              }
              console.log('Upserting data: ' + JSON.stringify(routeObject));
              db.collection('route').update({code: routeObject.code}, routeObject, {safe: true, upsert: true}, function(err, objects) {
                if (!err) {
                  callback();
                } else {
                  callback(err);
                }
              });
            } else {
              callback('Unexpected routes structure.');
            }
          });
        } else {
          callback('Agency doesn\'t exist.');
        }
      });
    } else {
      callback('Agency property ' + JSON.stringify(agencyProperties) + 'has unexpected format.');
    }
  }, function(err){
    callback(err);
  });
}

exports.run = run;