/*global define*/

define([
    'jquery',
    'backbone'
], function ($, Backbone) {
    'use strict';

    var StopRouter = Backbone.Router.extend({
        routes: {
          '': 'home'
        }

    });

    return StopRouter;
});
