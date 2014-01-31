/**
 * Created by xuyuhang on 1/28/14.
 */

'use strict';

angular.module('departureStaticsApp').run(function ($rootScope) {

  $rootScope.nearbyStops = [];


  $rootScope.realtime511 = {
    token: '993706be-5332-4252-bd04-a42b6ca5415e'
  };

  $rootScope.safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if(phase == '$apply' || phase == '$digest') {
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };
});
