/*global define*/

define([
  'jquery',
  'underscore',
  'backbone'
], function ($, _, Backbone) {
  'use strict';

  var pubsub = {};
  _.extend(pubsub, Backbone.Events);

  return pubsub;
});
