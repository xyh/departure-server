/**
 * Created by xuyuhang on 1/30/14.
 */

var dbClinet = require('../db');
var async = require('async');
var departures = require('./departures');

var includeAgencyForStops = function(stops, callback) {
  dbClinet.connect(function(err, db) {
    if (!err && db) {
      async.each(stops, function(stop, callback) {
        db.collection('agency').findOne({_id:stop.agency}, function(err, agency) {
          console.log('Finish one subquery. ' + new Date());
          if (!err) stop.agencyEntry = agency;
          callback();
        })
      }, function(err) {
        console.log('All sub query finished. ' + new Date());
        callback(err, stops);
      });
    } else {
      callback('Database error', stops);
    }
  });
};

var includeDeparturesForStops = function(stops, callback) {
  async.each(stops, function(stop, callback) {
    departures.getNextDepaturesByStopCodeInternal({ stopCode: stop.stopCode }, function(err, res) {
      if (!err) {
        stop.departuresEntry = res.departures;
      }
      callback();
    })
  }, function(err) {
    console.log('All sub query finished. ' + new Date());
    callback(err, stops);
  });
};

exports.findById = function(req, res) {
  var id = req.params.id;
  dbClinet.connect(function(err, db) {
    db.collection('stop').findOne({_id:dbClinet.id(id)}, function(err, doc) {
      res.end(JSON.stringify(doc));
    });
  });
};

exports.findAll = function(req, res) {
  var qs = {};
  var limit = parseInt(req.query.limit) || 100;
  var skip = parseInt(req.query.skip) || 0;

  // nearby
  var near = req.query.near || {};
  var lat = parseFloat(req.query.lat);
  var lng = parseFloat(req.query.lng);
  var radius = parseFloat(req.query.radius) || 10000;
  var R = 6371000.0;
  if (near) {
    var diff = radius / R;
    if (lat) {
      qs.latitude = qs.latitude || {};
      qs.latitude['$gt'] = lat - diff;
      qs.latitude['$lt'] = lat + diff;
    }
    if (lng) {
      qs.longitude = qs.longitude || {};
      qs.longitude['$gt'] = lng - diff;
      qs.longitude['$lt'] = lng + diff;
    }
  }

  // has location
  var hasLocation = req.query.hasLocation;
  if (hasLocation) {
    qs.latitude = qs.latitude || {};
    qs.latitude['$exists'] = true;
  }

  // include agency
  var includeAgency = req.query.includeAgency;

  // include departure info
  var includeDepartures = req.query.includeDepartures;

  console.log('Start query all stops...' + new Date());
  dbClinet.connect(function(err, db) {
    if (!err && db) {
      console.log('Getting all stops... ' + new Date());
      db.collection('stop').find(qs).skip(skip).limit(limit).toArray(function(err, docs) {
        console.log('Got all stops with docs ' + JSON.stringify(docs) + ' and err ' + err + '. ' + new Date());
        if (!err && docs) {

          async.series([
            function(callback){
              /* include agency */
              if (includeAgency) {
                includeAgencyForStops(docs, function(err, res) {
                  docs = res;
                  callback(null);
                });
              } else callback(null);
            },
            function(callback){
              /* include departure info */
              if (includeDepartures) {
                includeDeparturesForStops(docs, function(err, res) {
                  docs = res;
                  callback(null);
                });
              } else callback(null);
            }
          ], function(err, results){
            res.end(JSON.stringify(docs));
          });
        } else {
          res.end('');
        }
      });
    } else {
      res.end('');
    }
  });
};