/**
 * Created by xuyuhang on 1/30/14.
 */

var dbClinet = require('../db');

exports.findById = function(req, res) {
  var id = req.params.id;
  dbClinet.connect(function(err, db) {
    db.collection('route').findOne({_id:dbClinet.id(id)}, function(err, doc) {
      res.end(JSON.stringify(doc));
    });
  });
};

exports.findAll = function(req, res) {
  var qs = {};
  var limit = parseInt(req.query.limit) || 100;
  var skip = parseInt(req.query.skip) || 0;

  dbClinet.connect(function(err, db) {
    db.collection('route').find(qs).skip(skip).limit(limit).toArray(function(err, docs) {
      res.end(JSON.stringify(docs));
    });
  });
};