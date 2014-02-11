/*global define*/

define([
  /* global libs */
  'jquery',
  'underscore',
  'backbone',
  'google-map',
  'pubsub',

  /* models */
  'models/stop',

  /* collections */
  'collections/stops',

  /* views */
  'views/map',

  /* templates */
  'text!templates/app.html',

  /* supports */
  'geolocation'
], function ($, _, Backbone, google, pubsub, StopModel, StopsCollection, MapView, appTemplate) {
  'use strict';

  var AppView = Backbone.View.extend({
    el: '#departureApp',

    template: _.template(appTemplate),

    events: {
      'click #clearAllButton':	'clearAllButtonOnClickHandler',
      'click #redoButton':	'fetchNearByStops'
    },

    initialize: function() {
      /* Data */
      this.stops = new StopsCollection();

      /* Render */
      this.render();

      /* Location user's location */
      this.currentGeolocation = { latitude: 37.7833, longitude: -122.4167 };
      $.geolocation.getCurrentPosition(this.getPositionSuccess, this.getPositionError, {
        timeout: 30000
      });

      /* Events */
      this.listenToOnce(this, 'complete:render', this.initializeSubViews);
      this.listenTo(pubsub, 'find:currentLocation', this.findCurrentLocationHandler);
      this.listenTo(pubsub, 'update:stops', this.stopsUpdateHandler);
    },

    render: function() {
      this.$el.html(this.template());
      this.trigger('complete:render');
      return this;
    },

    initializeSubViews: function() {
      /* Initialize children views */
      this.mapView = new MapView({
        latitude: this.currentGeolocation.latitude,
        longitude: this.currentGeolocation.longitude
      });
      console.log('Initialized this.mapView.');
    },

    fetchNearByStops: function() {
      this.stops.fetch({
        data: {
          near: 1,
          lat: this.mapView.getMapCenter().lat(),
          lng: this.mapView.getMapCenter().lng()
        } ,
        success: function() {
          pubsub.trigger('update:stops');
        }
      });
    },

    findCurrentLocationHandler: function(position) {
      console.log('Update current location: ' + JSON.stringify(position));
      this.mapView.panToLatitudeAndLogitude(position.coords.latitude, position.coords.longitude);
      this.mapView.userMarkerMoveToLatitudeAndLogitude(position.coords.latitude, position.coords.longitude);

      this.fetchNearByStops();
    },

    stopsUpdateHandler: function() {
      if (this.mapView) {
        this.mapView.updateStopsMarkersByStops(this.stops);
      }
    },

    clearAllButtonOnClickHandler: function() {
      if (this.mapView) {
        this.mapView.cleanAllStopMarkers();
      }
    },

    getPositionSuccess: function(position) {
      console.log('Get current location: ' + JSON.stringify(position));
      pubsub.trigger('find:currentLocation', position);
    },

    getPositionError: function(error) {
      console.log("No location info available. Error code: " + error.code);
      pubsub.trigger('error:currentLocation', error);
    }
  });

  return AppView;
});
