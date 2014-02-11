/*global define*/

define([
  'underscore',
  'backbone'
], function (_, Backbone) {
  'use strict';

  var StopModel = Backbone.Model.extend({
    urlRoot: '/stops',
    defaults: {

    }

//    parse: function(response, options) {
//      console.log('response is ' +JSON.stringify(response));
//    }
  });

  return StopModel;
});
