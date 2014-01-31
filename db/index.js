/**
 * Created by xuyuhang on 1/29/14.
 */
var dbSetting = require('config').database;
var connect;
var database;

if (dbSetting && dbSetting.type && !database) {
  database = require('./' + dbSetting.type + '.js');
}

exports.connect = database.connect;
exports.id = database.id;