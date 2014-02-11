/*global require*/
'use strict';

require.config({
  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: [
        'underscore',
        'jquery'
      ],
      exports: 'Backbone'
    },
    bootstrap: {
      deps: ['jquery'],
      exports: 'jquery'
    },
    geolocation: {
      deps: ['jquery']
    }
  },
  paths: {
    jquery: '../bower_components/jquery/jquery',
    backbone: '../bower_components/backbone/backbone',
    underscore: '../bower_components/underscore/underscore',
    bootstrap: '../bower_components/sass-bootstrap/dist/js/bootstrap',
    text: '../bower_components/requirejs-text/text',
    async: '../bower_components/requirejs-plugins/src/async',
    geolocation: '../bower_components/jquery-geolocation/jquery.geolocation',
    pubsub: './pubsub'
  }
});

define('google-map', ['async!https://maps.googleapis.com/maps/api/js?sensor=false'],
  function(){
    // return the gmaps namespace for brevity
    return window.google;
  });


require([
  'backbone',
  'routes/stop',
  'views/app'
], function (Backbone, StopRoutes, AppView) {

  var appView = new AppView();
  var router = new StopRoutes();

  router.on('route:home', function() {
    appView.render();
  });


  Backbone.history.start();
});
