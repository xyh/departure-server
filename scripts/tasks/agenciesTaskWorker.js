var request = require('request');
var realtime511 = require('config').realtime511;

// http://services.my511.org/Transit2.0/GetAgencies.aspx

var work = function() {
    var url = realtime511.baseURL + 'GetAgencies.aspx';
    console.log('Request ' + url);
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body) // Print the google web page.
      }
    });
}

exports.work = work;