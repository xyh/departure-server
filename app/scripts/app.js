'use strict';

var dependencies = [
  'ngRoute',
  'chieffancypants.loadingBar',
  'ngAnimate',
  'geolocation'
];

angular.module('departureStaticsApp', dependencies)
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);
