/*global define*/

define([
  'jquery',
  'underscore',
  'backbone',
  'google-map'
], function ($, _, Backbone, google) {
  'use strict';

  var MapView = Backbone.View.extend({
    el: '#mapCanvas',

    initialize: function () {
      this.initializeMapComponents();
    },

    initializeMapComponents: function() {

      this.latitude = this.latitude || 37.7833;
      this.longitude = this.longitude || -122.4167;
      this.stopMarkers = [];

      /* map */
      var mapOptions = {
        center: new google.maps.LatLng(this.latitude, this.longitude),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      this.map = new google.maps.Map($('#mapCanvas')[0], mapOptions);

      /* user marker */
      this.userMarker = new google.maps.Marker({
        position: new google.maps.LatLng(this.latitude, this.longitude)
      });
      this.userMarker.setDraggable(false);
      this.userMarker.setMap(this.map);
    },

    panToLatitudeAndLogitude: function(latitude, longitude) {
      this.map.panTo(new google.maps.LatLng(latitude, longitude));
    },

    userMarkerMoveToLatitudeAndLogitude: function(latitude, longitude) {
      this.userMarker.setPosition(new google.maps.LatLng(latitude, longitude));
    },

    updateStopsMarkersByStops: function(stops) {
      this.cleanAllStopMarkers();

      if (!stops || !stops.length) return;
      var _this = this;

      stops.each(function(stop) {
        var options = {
          position: new google.maps.LatLng(stop.get('latitude'), stop.get('longitude')),
          map: _this.map,
          icon: '/app/images/' + stop.get('agencyEntry').mode.toLowerCase() + '-marker-icon.png'
        };
        var stopMarker = new google.maps.Marker(options);
        stopMarker.setDraggable(false);
        stopMarker.setTitle('[' + stop.get('stopCode') + '] ' + stop.get('name'));
        _this.stopMarkers.push(stopMarker);
      })
    },

    cleanAllStopMarkers: function() {
      console.log("Clear all markers!");
      for (var i = 0; i < this.stopMarkers.length; i++) {
        var marker = this.stopMarkers[i];
        marker.setMap(null);
      }
      this.stopMarkers = [];
    },

    getMapCenter: function() {
      return this.map.getCenter();
    }
  });

  return MapView;
});
