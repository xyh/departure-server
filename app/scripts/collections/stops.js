/*global define*/

define([
  'underscore',
  'backbone',
  'pubsub',
  'models/stop'
], function (_, Backbone, pubsub, StopModel) {
  'use strict';

  var StopCollection = Backbone.Collection.extend({
    url: '/stops',
    model: StopModel,

    fetch: function(options) {
      options.data = _.extend((options.data || {}), {
        radius: 100000,
        limit: 200,
        includeDepartures: 1,
        includeAgency: 1
      });
      return Backbone.Collection.prototype.fetch.call(this, options);
    }

  });

  return StopCollection;
});
