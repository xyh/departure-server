var request = require('request');
var realtime511 = require('config').realtime511;
var parseString = require('xml2js').parseString;
var prettyjson = require('prettyjson');
var async = require('async');

var dbClient = require('../../db');

var run = function (params, callback) {
  var options = {
    url: realtime511.baseURL + realtime511.endPoints.getAgencies,
    qs: {
      token: realtime511.token
    }
  }
  console.log('Request ' + options.url);
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      parseString(body, {trim: true, normalize: true}, function (err, result) {
        if (!err) {
//          console.log(prettyjson.render(result));
          dbClient.connect(function(err, db) {
            if (err) throw err;
            if (result.RTT
              && result.RTT.AgencyList
              && result.RTT.AgencyList.length > 0
              && result.RTT.AgencyList[0].Agency) {
              var agencies = result.RTT.AgencyList[0].Agency;
              var length = agencies.length;

              async.each(agencies, function(agencyProperties, callback) {
                if (agencyProperties && agencyProperties['$']) {
                  var agency = {};
                  agency.name = agencyProperties['$']['Name'];
                  agency.hasDirection = agencyProperties['$']['HasDirection'];
                  agency.mode = agencyProperties['$']['Mode'];
                  console.log('Upserting data: ' + JSON.stringify(agency));
                  db.collection('agency').update({name: agency.name}, agency, {safe: true, upsert: true}, function(err, objects) {
                    if (!err) {
                      callback();
                    } else {
                      callback(err);
                    }
                  });
                } else {
                  callback('Agency property ' + JSON.stringify(agencyProperties) + 'has unexpected format.');
                }
              }, function(err){
                callback(err);
              });
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
}

exports.run = run;