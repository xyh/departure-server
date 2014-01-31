angular.module('departureStaticsApp').controller('HomeCtrl', ['$scope', 'cfpLoadingBar', 'geolocation', 'currentGeolocation', '$http', controller]);

function controller($scope, cfpLoadingBar, geolocation, currentGeolocation, $http) {

  $scope.settings = {
    showStopsWithNoDepartureTimes: true
  };

  $scope.mapOptions = {
    center: currentGeolocation.googleLatLng(),
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  $scope.map = new google.maps.Map(document.getElementById('map_canvas'), $scope.mapOptions);
  $scope.currentLocationMarker = new google.maps.Marker({
    position: currentGeolocation.googleLatLng()
  });
  $scope.currentLocationMarker.setDraggable(true);
  $scope.currentLocationMarker.setMap($scope.map);


  $scope.initialize = function() {
    cfpLoadingBar.start();

//    $scope.freshNearbyStops();
    $scope.notification = 'Start detecting your position...';
    geolocation
      .getLocation()
      .then(function(data){
        currentGeolocation.coordinates = data.coords;
        $scope.map.panTo(currentGeolocation.googleLatLng());
        $scope.currentLocationMarker.setPosition(currentGeolocation.googleLatLng());
        cfpLoadingBar.complete();
        $scope.notification = 'Successfully get your position...';
        $scope.freshNearbyStops();
        $scope.safeApply();
      }, function(reason) {
        $scope.notification = 'Cannot get current location, reason: ' + reason;
        cfpLoadingBar.complete();
        $scope.safeApply();
      });
  }

  $scope.freshNearbyStops = function() {
    $scope.showQueryAreaButton = false;
    $scope.notification = 'Refreshing nearby stops...';
    $scope.safeApply();

    var url = '/stops?near=1&lat=' + $scope.map.getCenter().lat()
      + '&lng=' + $scope.map.getCenter().lng() + '&radius=500000&limit=100&includeAgency=1';
    $http({method: 'GET', url: url}).
      success(function(data, status, headers, config) {
        // clear current nearby stops
        $scope.clearAllMarkers();

        $scope.nearbyStops = _.sortBy(data, function(stop) {
          return (stop.latitude - $scope.map.getCenter().lat()) * (stop.latitude - $scope.map.getCenter().lat())
          + (stop.longitude - $scope.map.getCenter().lng()) * (stop.longitude - $scope.map.getCenter().lng())
        });
        $scope.freshDepartureTimeOfNearbyStops();
        $scope.setupMarkerForNearbyStops();
        $scope.notification = 'Successfully get nearby stops info!';
      }).
      error(function(data, status, headers, config) {
        $scope.notification = 'Failed to get nearby stops info...';
      });
  }

  $scope.freshDepartureTimeOfNearbyStops = function() {
    var length = $scope.nearbyStops.length;
    for (var i = 0; i < length; i++) {
      var stop = $scope.nearbyStops[i];

      var url = '/departures?stopCode=' + stop.stopCode;
      $http({method: 'GET', url: url}).
        success(function(data, status, headers, config) {
          if (data.stopCode && data.departures) {
            for (var j = 0; j < $scope.nearbyStops.length; j++) {
              if ($scope.nearbyStops[j].stopCode == data.stopCode) {
                $scope.nearbyStops[j].departuresInfo = data.departures;
                $scope.safeApply();
                break;
              }
            }
          }
        }).
        error(function(data, status, headers, config) {
        });
    }
  }

  $scope.setupMarkerForNearbyStops = function() {
    var length = $scope.nearbyStops.length;
    for (var i = 0; i < length; i++) {
      var stop = $scope.nearbyStops[i];
      var stopMarker = new google.maps.Marker({
        position: new google.maps.LatLng(stop.latitude, stop.longitude),
        map: $scope.map,
        icon: '/app/images/' + stop.agencyEntry.mode.toLowerCase() + '-marker-icon.png'
      });
      stopMarker.setDraggable(true);
      stopMarker.setMap($scope.map);
      stopMarker.setTitle(stop.name);
      stop.ui = stop.ui || {};
      stop.ui.marker = stopMarker;

      google.maps.event.addListener(stopMarker, 'mouseover', function() {
        var hightlightedStop;
        for (var i = 0; i < $scope.nearbyStops.length; i++) {
          if ($scope.nearbyStops[i].ui && $scope.nearbyStops[i].ui.marker == this) {
            hightlightedStop = $scope.nearbyStops[i];
          }
        }
        if (hightlightedStop) {
          var hightlightedCell = document.getElementById('stopCell' + hightlightedStop.stopCode);
          document.getElementById('infoBoard').scrollTop = hightlightedCell.offsetTop;
          $scope.highlightStopMark(hightlightedStop);
        }
      });

      google.maps.event.addListener(stopMarker, 'mouseout', function() {
        var hightlightedStop;
        for (var i = 0; i < $scope.nearbyStops.length; i++) {
          if ($scope.nearbyStops[i].ui && $scope.nearbyStops[i].ui.marker == this) {
            hightlightedStop = $scope.nearbyStops[i];
          }
        }
        if (hightlightedStop) {
          $scope.dehighlightStopMark(hightlightedStop);
        }
      });
    }
  }

  $scope.clearAllMarkers = function() {
    console.log("Clear all markers!");
    for (var i = 0; i < $scope.nearbyStops.length; i++) {
      var stop = $scope.nearbyStops[i];
      var marker = stop.ui.marker;
      marker.setMap(null);
    }
  }

  $scope.getProgressBarClass = function(departureTime) {
    if (departureTime < 10) {
      return 'bar-danger';
    } else if (departureTime < 30) {
      return 'bar-warning';
    } else {
      return 'bar-success';
    }
  }

  $scope.printStopDeparturesInfo = function(stop) {
    console.log(JSON.stringify(stop.departuresInfo));
  }

  $scope.stopHasAvailableDepartureTimes = function(stop) {
    if (stop && stop.departuresInfo) {
      for (var i = 0; i < stop.departuresInfo.length; i++) {
        if (stop.departuresInfo[i].departures && stop.departuresInfo[i].departures.length > 0) return true;
      }
    }
    return false;
  }

  $scope.mouseEnterStopCell = function(stop) {
    $scope.highlightStopMark(stop);
  }

  $scope.mouseLeaveStopCell = function(stop) {
    $scope.dehighlightStopMark(stop);
  };

  $scope.highlightStopMark = function(stop) {
    if (stop && stop.ui && stop.ui.marker && stop.agencyEntry && stop.agencyEntry.mode) {
      stop.ui.marker.setIcon('/app/images/' + stop.agencyEntry.mode.toLowerCase() + '-marker-icon-highlighted.png')
    }
  }

  $scope.dehighlightStopMark = function(stop) {
    if (stop && stop.ui && stop.ui.marker && stop.agencyEntry && stop.agencyEntry.mode) {
      stop.ui.marker.setIcon('/app/images/' + stop.agencyEntry.mode.toLowerCase() + '-marker-icon.png')
    }
  }
}