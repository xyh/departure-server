/**
 * Created by xuyuhang on 1/28/14.
 */
'use strict';

angular.module('departureStaticsApp').factory('currentGeolocation', [function () {

  var geolocation = {};

  geolocation.coordinates = {
    latitude: 37.7833,
    longitude: -122.4167
  };

  geolocation.googleLatLng = function() {
    return new google.maps.LatLng(geolocation.coordinates.latitude, geolocation.coordinates.longitude);
  };

  return geolocation;
}]);