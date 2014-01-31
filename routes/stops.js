/**
 * Created by xuyuhang on 1/30/14.
 */

var dbClinet = require('../db');
var async = require('async');

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

  dbClinet.connect(function(err, db) {
    if (!err && db) {
      db.collection('stop').find(qs).skip(skip).limit(limit).toArray(function(err, docs) {
        if (!err && docs) {
          if (includeAgency) {
            async.each(docs, function(doc, callback) {
              db.collection('agency').findOne({_id:doc.agency}, function(err, agency) {
                if (!err) doc.agencyEntry = agency;
                callback();
              })
            }, function(err) {
              res.end(JSON.stringify(docs));
            })
          } else {
            res.end(JSON.stringify(docs));
          }
        } else {
          res.end('');
        }
      });
    } else {
      res.end('');
    }
  });
};